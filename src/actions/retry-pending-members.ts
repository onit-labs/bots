import * as R from "remeda";
import { and, eq } from "drizzle-orm";
import * as schema from "../db/schema";
import { db } from "../db";
import { bot } from "../lib/xmtp/client";
import type { GroupMember, GroupMemberStatus } from "../db/schema";

export async function retryPendingMembers(groupId?: string) {
	// - get the pending members
	const pendingMembers = await db.query.groupMembers.findMany({
		where: (fields, { eq }) =>
			groupId
				? and(eq(fields.groupId, groupId), eq(fields.status, "pending"))
				: eq(fields.status, "pending"),
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
		await bot.addMembers(groupId, [address]);
		await db
			.update(schema.groupMembers)
			.set({ status: "approved" as const })
			.where(
				and(
					eq(schema.groupMembers.id, id),
					eq(schema.groupMembers.chainAwareAddress, chainAwareAddress),
				),
			);
		return "approved";
	} catch (e) {
		console.error(`failed to add ${address} to group ${groupId}`);
		// - no need to update the status as we will retry this on the next run
		return "pending";
	}
}
