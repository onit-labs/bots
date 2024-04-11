import * as R from "remeda";
import { db } from "../db";
import { inArray, sql } from "drizzle-orm";
import { bot } from "../lib/xmtp/client";
import { getDeployments } from "./get-deployments";
import * as schema from "../db/schema";
import { sqliteAddressFromChainAwareAddress } from "../lib/sqlite-address-from-chain-aware-address";
import type { Address } from "viem";
import { addMembers } from "./add-members";
import { removeMembers } from "./remove-members";

export default async function syncGroupChatsWithSafeMembers() {
	console.log("syncing group chats with safe members");
	// - get the current group chats from XMTP
	const groupChats = await bot.listGroups().catch((e) => {});

	console.log("groupChats", groupChats);

	if (!groupChats || groupChats.length === 0) return;

	// - get all group wallets & the stored members of those groups from the database
	const groupWallets = await db.query.groupWallets.findMany({
		with: { group: { with: { members: true } } },
		where(fields, { inArray }) {
			return inArray(
				fields.groupId,
				groupChats.map((group) => group.group_id),
			);
		},
	});

	console.log("groupWallets", groupWallets);

	// - iterate over each groups wallet deployments & ensure the members in the chat are the union of the wallet owners
	for (const groupWallet of groupWallets) {
		const groupChat = groupChats.find(
			(group) => group.group_id === groupWallet.groupId,
		);

		if (!groupChat) continue;

		const deployments = await getDeployments({
			type: "safe",
			address: groupWallet.walletAddress,
		});

		// TODO: if we find a deployment that is not linked to a group wallet, we should link it

		const owners = R.pipe(
			deployments,
			R.flatMap((deployment) => deployment.members),
			R.unique(),
		);

		/**
		 * This is a list of owners (wallet signers) with their `status` in the group chat attached.
		 * The `status` represents our knowlegde (the database's) of the group chat on XMTP.
		 * If they are approved we think they are already in the group chat.
		 * Otherwise, they are pending or rejected i.e. not in the group chat.
		 *
		 * The list is then partitioned into two lists:
		 * - `ownersThatAreMembersOfTheChat` - owners that ARE actually in the group chat on XMTP
		 * - `ownersThatAreNotMembersOfTheChat` - owners that ARE NOT in the group chat on XMTP
		 */
		const [ownersThatAreMembersOfTheChat, ownersThatAreNotMembersOfTheChat] =
			R.pipe(
				owners,
				R.map((owner) => {
					const { status } =
						groupWallet?.group?.members.find((member) =>
							member.chainAwareAddress
								.toLowerCase()
								.endsWith(owner.toLowerCase()),
						) ?? {};

					return { address: owner, status };
				}),
				R.partition(
					(owner) =>
						groupChat?.members.some(
							(member) => member.toLowerCase() === owner.address.toLowerCase(),
						) ?? false,
				),
			);

		/**
		 * There are several situations that we need to handle explicitly here:
		 * 1. multisig owners that are in the group chat but not in the database
		 * 2. multisig owners that are in neither the database nor the group chat
		 * 3. group chat members / database members that are not multisig owners
		 *
		 * There are other situations that are handled elsewhere, such as:
		 * - owners that are in the database (as pending) but not in the group chat -> handled by `sync-members`
		 */

		// 1. ensure that all multisig owners that are in the group chat are approved in the database
		const unapprovedOwners = ownersThatAreMembersOfTheChat.filter(
			({ status }) => !!status && status !== "approved",
			// ! filter types suck here
		) as Array<{ status: "pending" | "rejected"; address: Address }>;

		if (unapprovedOwners.length > 0)
			await db
				.update(schema.groupMembers)
				.set({ status: "approved" })
				.where(
					sql.join([
						inArray(
							sqliteAddressFromChainAwareAddress(
								schema.groupMembers.chainAwareAddress,
							),
							unapprovedOwners,
						),
						sql` collate nocase`,
					]),
				);

		console.log("approved missing owners -> ", unapprovedOwners);

		// 2. add missing owners to the database as approved & to the XMTP group chat
		const membersToAdd = ownersThatAreNotMembersOfTheChat
			.filter(({ status }) => status === undefined)
			.map(({ address }) => address);

		console.log(
			"adding missing owners to the database and XMTP group chat",
			membersToAdd,
		);

		if (membersToAdd.length > 0)
			await addMembers(groupChat.group_id, membersToAdd);

		// 3. remove members from the group chat that are not multisig owners
		const groupChatMembersThatAreNotOwners = groupChat.members.filter(
			(member) => !owners.some((m) => m.toLowerCase() === member.toLowerCase()),
		);

		const databaseMembersThatAreNotOwners =
			groupWallet.group?.members.filter(
				(member) =>
					!owners.some((m) =>
						member.chainAwareAddress.toLowerCase().endsWith(m.toLowerCase()),
					),
			) ?? [];

		const membersToRemove = [
			...groupChatMembersThatAreNotOwners,
			...databaseMembersThatAreNotOwners.map(
				(m) => m.chainAwareAddress.split(":")[1] as Address,
			),
		];

		console.log("membersToRemove -> ", membersToRemove);
		if (membersToRemove.length > 0)
			await removeMembers(groupChat.group_id, membersToRemove);
	}
}
