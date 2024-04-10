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
	membersToRemove: Address[],
): Promise<void> {
	const group = await getGroup(groupId);

	if (!group) {
		throw new Error(`Group with ID ${groupId} not found`);
	}

	const { pending: pendingMemberAddresses, approved: approvedMemberAddresses } =
		R.pipe(
			group.members,
			R.filter((member) => membersToRemove.includes(member.address)),
			R.groupBy((member) => member.status),
			R.mapValues((value) => value.map(({ address }) => address)),
		);

	try {
		const removedMembers = await bot.removeMembers(
			groupId,
			approvedMemberAddresses,
		);
		console.log(
			`Group ID is ${groupId} -> remove members ${JSON.stringify(
				removedMembers,
			)}`,
		);
	} catch (e) {
		console.log(
			"Failed to remove members from group",
			e,
			approvedMemberAddresses,
		);
	}

	if (pendingMemberAddresses.length) {
		await db
			.delete(schema.groupMembers)
			.where(
				sql.join([
					sql`${schema.groupMembers.groupId} = ${groupId}`,
					sql` and `,
					inArray(
						sqliteAddressFromChainAwareAddress(
							schema.groupMembers.chainAwareAddress,
						),
						pendingMemberAddresses as string[],
					),
				]),
			);
	}
}
