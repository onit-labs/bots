import * as R from "remeda";
import { and, eq } from "drizzle-orm";
import * as schema from "../db/schema";
import { db } from "../db";
import { client } from "../lib/xmtp/client";
import type { GroupMember, GroupMemberStatus } from "../db/schema";

export async function retryPendingMembers(groupId?: string) {
	// - get the pending members
	const pendingMembers = await db.query.groupMembers.findMany({
		where: (fields, { eq }) =>
			groupId
				? and(eq(fields.groupId, groupId), eq(fields.status, "PENDING"))
				: eq(fields.status, "PENDING"),
	});

	const batchedPromises = R.chunk(pendingMembers.map(retryAddMember), 10);

	for (const batch of batchedPromises) {
		// TODO: maybe we should also have a delay?
		await Promise.allSettled(batch);
	}
}

/**
 * Retry adding a status `pending` member to the group & update the status if successful
 * */
async function retryAddMember({
	id,
	groupId,
	chainAwareAddress,
}: GroupMember): Promise<GroupMemberStatus | undefined> {
	const address = chainAwareAddress.split(":").at(-1);
	if (!id || !groupId || !address) return undefined;

	try {
		console.log(`adding ${address} to group ${groupId}`);
		const conversation =
			await client.conversations.getConversationById(groupId);
		if (!conversation) throw new Error("Conversation not found");
		await conversation.addMembers([address]);
		await db
			.update(schema.groupMembers)
			.set({ status: "APPROVED" as const })
			.where(
				and(
					eq(schema.groupMembers.id, id),
					eq(schema.groupMembers.chainAwareAddress, chainAwareAddress),
				),
			);
		return "APPROVED";
	} catch (e) {
		console.error(`failed to add ${address} to group ${groupId}`);
		// - no need to update the status as we will retry this on the next run
		return "pending";
	}
}
