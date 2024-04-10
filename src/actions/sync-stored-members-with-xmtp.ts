import { and, eq } from "drizzle-orm";
import * as schema from "../db/schema";
import { db } from "../db";
import { bot } from "../lib/xmtp/client";
import type { ChainAwareAddress } from "../db/schema";

/**
 * Syncs the database member state with the on network XMTP group chat member state
 *
 * @param groupId Optionally provide a groupId to only sync members for that group
 */
export async function syncStoredMembersWithXmtp(groupId?: string) {
	const groups = await bot.listGroups();

	if (!groups) {
		return;
	}

	// - ensure that the database member status is approved if the user is in the group on XMTP
	const members = await db.query.groupMembers.findMany({
		...(groupId && {
			where: (fields, { eq }) => eq(fields.groupId, groupId),
		}),
	});

	for (const group of groups) {
		const storedMembers = members.filter((m) => m.groupId === group.group_id);

		if (storedMembers.length === 0) {
			// - ensure the group exists in the database
			const storedGroup = await db.query.groups.findFirst({
				where: (fields, { eq }) => eq(fields.id, group.group_id),
			});

			// - store the group is not found
			if (!storedGroup) {
				await db.insert(schema.groups).values({
					id: group.group_id,
				});
			}

			// - the user has been added to the chat but is not in the database ... probably only possible if there is a bug
			// - but best to add them to the database to be safe

			// ? for now we assume that they are an EOA

			await db.insert(schema.groupMembers).values(
				group.members.map((address) => ({
					status: "approved" as const,
					chainAwareAddress: `eth:${address}` satisfies ChainAwareAddress,
					groupId: group.group_id,
				})),
			);

			continue;
		}

		// - check if the user is in the group chat & has the correct status
		for (const memberAddress of group.members) {
			const storedMember = storedMembers.find((m) =>
				m.chainAwareAddress.endsWith(memberAddress),
			);

			// - if the user is not in the database then add them
			if (!storedMember) {
				await db.insert(schema.groupMembers).values(
					group.members.map((address) => ({
						status: "approved" as const,
						chainAwareAddress: `eth:${address}` satisfies ChainAwareAddress,
						groupId: group.group_id,
					})),
				);

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
								eq(schema.groupMembers.groupId, group.group_id),
								eq(
									schema.groupMembers.chainAwareAddress,
									storedMember.chainAwareAddress,
								),
							),
						);
					break;
			}
		}
	}
}
