import * as R from "remeda"
import { and, eq } from "drizzle-orm"
import * as schema from "../db/schema"
import { db } from "../db"
import { client } from "../lib/xmtp/client"
import { parseWalletAddress } from "@/lib/chain"
import { getInboxIdByAddress } from "@/lib/get-inbox-id-by-address"

export async function retryPendingMembers(groupId?: string) {
	// - get the pending members
	const pendingMembers = await db.query.pendingMembers.findMany({
		...(groupId && {
			where: (fields, { eq }) => and(eq(fields.groupId, groupId)),
		}),
	})

	const batchedPromises = R.chunk(pendingMembers.map(retryAddMember), 10)

	for (const batch of batchedPromises) {
		// TODO: maybe we should also have a delay?
		await Promise.allSettled(batch)
	}
}

/**
 * Retry adding a status `pending` member to the group & update the status if successful
 * */
export async function retryAddMember({
	groupId,
	address: walletAddress,
}: Pick<schema.PendingMember, "groupId" | "address">): Promise<void> {
	if (!groupId) return
	const conversation = client.conversations.getConversationById(groupId)
	if (!conversation) throw new Error("Conversation not found")
	const { address } = parseWalletAddress(walletAddress)
	if (!address) return

	const inboxId = await getInboxIdByAddress(address, true)

	if (!inboxId) return

	try {
		console.log(`adding ${address} to group ${groupId}`)
		await conversation.addMembers([address])
		await db
			.delete(schema.pendingMembers)
			.where(
				and(
					eq(schema.pendingMembers.groupId, groupId),
					eq(schema.pendingMembers.address, address),
				),
			)
	} catch (e) {
		console.error(
			`failed to add ${address} to group ${groupId} -> ${(e as Error).message}`,
		)
		// - no need to update the status as we will retry this on the next run
	}
}
