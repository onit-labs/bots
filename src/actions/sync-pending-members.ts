import { eq } from "drizzle-orm";
import * as schema from "../db/schema";
import { db } from "../db";
import { bot } from "../lib/xmtp/client";

export async function syncPendingMembers() {
	// - get the pending members
	const pendingMembers = await db.query.pendingGroupMembers.findMany({
		where: (fields, { eq }) => eq(fields.status, "pending"),
	});

	// - for each pending member try to add them to the group
	for await (const pendingMember of pendingMembers) {
		const { groupId, chainAwareAddress, id } = pendingMember;
		const address = chainAwareAddress.split(":").at(-1);
		if (id && groupId && address) {
			try {
				await bot.addMembers(groupId, [address]);
				await db
					.delete(schema.pendingGroupMembers)
					.where(eq(schema.pendingGroupMembers.id, id));
			} catch (e) {
				console.error(
					`failed to add ${address} to group ${pendingMember.groupId}`,
				);
				// - no need to update the status as we will retry this on the next run
			}
		}
	}
}
