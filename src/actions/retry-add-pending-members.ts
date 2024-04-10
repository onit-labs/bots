import { and, eq } from "drizzle-orm";
import * as schema from "../db/schema";
import { db } from "../db";
import { bot } from "../lib/xmtp/client";

export async function retryAddPendingMembers(groupId?: string) {
	// - get the pending members
	const pendingMembers = await db.query.groupMembers.findMany({
		where: (fields, { eq }) =>
			groupId
				? and(eq(fields.groupId, groupId), eq(fields.status, "pending"))
				: eq(fields.status, "pending"),
	});

	// - for each pending member try to add them to the group
	for await (const pendingMember of pendingMembers) {
		const { groupId, chainAwareAddress, id } = pendingMember;
		const address = chainAwareAddress.split(":").at(-1);
		if (id && groupId && address) {
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
			} catch (e) {
				console.error(
					`failed to add ${address} to group ${pendingMember.groupId}`,
				);
				// - no need to update the status as we will retry this on the next run
			}
		}
	}
}
