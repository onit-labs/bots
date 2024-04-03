import * as schema from "../db/schema";
import * as R from "remeda";
import { sql, inArray } from "drizzle-orm";
import type { Address } from "viem";
import { bot } from "../lib/xmtp/client";
import { db } from "../db";
import { getGroup } from "./get-group";
import { sqliteAddressFromChainAwareAddress } from "../lib/sqlite-address-from-chain-aware-address";

export async function removeMembers(
	groupId: string,
	members: Address[],
): Promise<void> {
	const group = await getGroup(groupId);

	if (!group) {
		throw new Error(`Group with ID ${groupId} not found`);
	}

	const pendingMembersToRemove = R.intersectionWith(
		members,
		group.pendingMembers,
		R.equals,
	);
	const existingMembersToRemove = R.differenceWith(
		members,
		group.pendingMembers,
		R.equals,
	);

	try {
		const removedMembers = await bot.removeMembers(
			groupId,
			existingMembersToRemove as string[],
		);
		console.log(`Group ID is ${groupId} -> remove members ${JSON.stringify(removedMembers)}`);
	} catch (e) {
		console.log(
			"Failed to remove members from group",
			e,
			existingMembersToRemove,
		);
	}

	if (pendingMembersToRemove.length) {
	await db
		.delete(schema.pendingGroupMembers)
		.where(
			sql.join([
				sql`${schema.pendingGroupMembers.groupId} = ${groupId}`,
				sql` and `,
				inArray(
					sqliteAddressFromChainAwareAddress(
						schema.pendingGroupMembers.chainAwareAddress,
					),
					pendingMembersToRemove as string[],
				),
			]),
		);
	}
}
