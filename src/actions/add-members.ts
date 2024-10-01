import type { Address } from "viem";
import { db } from "@/db";
import * as schema from "@/db/schema";
import type { WalletAddress } from "@/db/schema";
import { client } from "@/lib/xmtp/client";
import { and, eq, inArray } from "drizzle-orm";
import {
	getInboxIdByAddress,
	getDefaultInboxId,
} from "@/utils/get-inbox-id-by-address";

/**
 * Add members to a group chat
 * @param {string} groupId
 * @param {Array<WalletAddress>} members
 * @returns {Promise<void>}
 */
export async function addMembers(
	groupId: string,
	members: WalletAddress[],
): Promise<void> {
	const availableMembersInboxIds: string[] = [];
	const pendingMembers: { inboxId: string; address: Address }[] = [];
	const group = client.conversations.getConversationById(groupId);
	if (!group) throw new Error("Group not found");

	const canMessageMembers = await client.canMessage(members);

	const inboxesToStore: Array<schema.InsertInboxId> = [];
	for await (const [address, canMessage] of Object.entries(canMessageMembers)) {
		let inboxId = await getInboxIdByAddress(address);
		const isXmtpV3Enabled = !!inboxId;
		inboxId ||= getDefaultInboxId(address);

		inboxesToStore.push({ inboxId, address, isXmtpV3Enabled });

		if (canMessage && isXmtpV3Enabled) {
			availableMembersInboxIds.push(inboxId);
			continue;
		}

		pendingMembers.push({ address, inboxId });
	}

	try {
		// - store all inboxes regardless of if they are available or not
		await db
			.insert(schema.inboxIds)
			.values(inboxesToStore)
			.onConflictDoNothing();

		// - add the members that can be added
		await group.addMembersByInboxId(availableMembersInboxIds);

		// - if successful, remove pending members from database if they exist
		await db
			.delete(schema.pendingMembers)
			.where(
				and(
					eq(schema.pendingMembers.groupId, groupId),
					inArray(schema.pendingMembers.inboxId, availableMembersInboxIds),
				),
			);
	} catch (e) {
		console.error("Failed to add members to group chat", e);
	}

	if (pendingMembers.length !== 0) {
		console.log("pendingMembers -> ", pendingMembers);
		await db
			.insert(schema.pendingMembers)
			.values(pendingMembers.map((member) => ({ ...member, groupId })))
			.catch((e) => {
				console.error("Failed to add pending members to database", e);
			});
	}
}
