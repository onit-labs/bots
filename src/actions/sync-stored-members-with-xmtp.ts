import * as R from "remeda";
import { and, eq, inArray } from "drizzle-orm";
import * as schema from "../db/schema";
import { db } from "../db";
import { bot } from "../lib/xmtp/client";
import type { ChainAwareAddress } from "../db/schema";
import { getWalletClient } from "../lib/eth/clients";

const { walletClient } = getWalletClient();

/**
 * Syncs the database member state with the on network XMTP group chat member state
 *
 * This function will:
 * - Ensure that the xmtp group chats exist in the database if not found
 * - Ensure that all chat members are in the database
 * - Ensure database members with approved status who are not in the group chat are reverted to pending status
 * - Ensure database member status is approved if the user is in the group on XMTP
 *
 * @param groupId Optionally provide a groupId to only sync members for that group
 */
export async function syncStoredMembersWithXmtp(groupId?: string) {
	const groupChats = await bot.listGroups().catch((e) => {
		console.error("Failed to list groups", e);
	});

	console.log("groupChats", groupChats);
	if (!groupChats) {
		return;
	}

	// - ensure that the database member status is approved if the user is in the group on XMTP
	const membersFromDatabase = await db.query.groupMembers.findMany({
		...(groupId && {
			where: (fields, { eq }) => eq(fields.groupId, groupId),
		}),
	});

	// - first separate the groups into missing, stored and unsupported
	// - missing groups are groups that are not in the database
	// - stored groups are groups that are in the database
	// - unsupported groups are groups that are not supported by this function
	// - then map the values down onto each of the members so we end up with
	// - an array of members with the group id & metadata  attached
	const { missing: missingGroups, stored: storedGroups } = R.pipe(
		groupChats,
		R.groupBy((group) => {
			console.log(
				"groupChats -> ",
				group,
				"unsupported",
				group.metadata.creator_account_address.toLowerCase() !==
					walletClient.account.address.toLowerCase() ||
					group.metadata.policy !== "GroupCreatorIsAdmin",
			);
			if (
				group.metadata.creator_account_address.toLowerCase() !==
					walletClient.account.address.toLowerCase() ||
				group.metadata.policy !== "GroupCreatorIsAdmin"
			) {
				// - this is not a group that we don't manage so we do nothing
				// ? maybe we remove this in the future
				return "unsupported";
			}

			return !membersFromDatabase.some((m) => m.groupId === group.group_id)
				? "missing"
				: "stored";
		}),
	);

	console.log("missingGroups", missingGroups);
	console.log("storedGroups", storedGroups);

	// - find the set of missing groups and store them in the database
	for (const missingGroupId of R.unique(
		(missingGroups ?? []).map((group) => group.group_id),
	)) {
		await db.insert(schema.groups).values({ id: missingGroupId });
	}

	const missingMembers = R.pipe(
		missingGroups ?? [],
		R.flatMap((group) =>
			group.members.map((address) => ({
				groupId: group.group_id,
				address,
			})),
		),
	);

	if (missingMembers.length !== 0) {
		// - store the missing groups and their members	in the database with no further checks needed on these groups
		// ? for now we assume that they are an EOA
		await db.insert(schema.groupMembers).values(
			missingMembers.map((member) => ({
				status: "approved" as const,
				chainAwareAddress: `eth:${member.address}` satisfies ChainAwareAddress,
				groupId: member.groupId,
			})),
		);
	}

	const storedMembersInGroupChat = R.pipe(
		storedGroups ?? [],
		R.flatMap((group) =>
			group.members.map((address) => {
				const member = membersFromDatabase.find(
					(m) =>
						m.groupId === group.group_id &&
						m.chainAwareAddress.toLowerCase().endsWith(address.toLowerCase()),
				);
				const { status, chainAwareAddress } = member ?? {};
				return {
					groupId: group.group_id,
					address,
					// biome-ignore lint/style/noNonNullAssertion: we filtered on these members to get here
					chainAwareAddress: chainAwareAddress!,
					// biome-ignore lint/style/noNonNullAssertion: we filtered on these members to get here
					status: status!,
				};
			}),
		),
	);

	for (const storedMember of storedMembersInGroupChat) {
		// - only sync the already stored members for the provided group if defined
		if (groupId && storedMember.groupId !== groupId) {
			continue;
		}

		// - if the user is in the group chat but is not approved then approve them
		switch (storedMember.status) {
			case "approved": {
				// - do nothing they are already approved
				continue;
			}
			default:
				await db
					.update(schema.groupMembers)
					.set({ status: "approved" as const })
					.where(
						and(
							eq(schema.groupMembers.groupId, storedMember.groupId),
							eq(
								schema.groupMembers.chainAwareAddress,
								storedMember.chainAwareAddress,
							),
						),
					);
				break;
		}

		// - for members that are in the database but not in the group chat we should revert them to pending status

		const storedMembersThatAreNotInGroupChat = R.pipe(
			membersFromDatabase,
			R.filter((m) => {
				// - if the user is in the chat then we don't want to revert them to pending
				const groupChat = groupChats.find(
					({ group_id: id, members }) =>
						id === m.groupId &&
						members.some((address) =>
							m.chainAwareAddress.toLowerCase().endsWith(address.toLowerCase()),
						),
				);
				if (groupChat) return false;
				return true;
			}),
		);

		await db
			.update(schema.groupMembers)
			.set({ status: "pending" as const })
			.where(
				inArray(
					schema.groupMembers.id,
					// biome-ignore lint/style/noNonNullAssertion: these are assigned on insert and so shouldn't be null
					storedMembersThatAreNotInGroupChat.map((m) => m.id!),
				),
			);
	}
}
