import type { Address } from "viem";
import { db } from "../db";

export const getGroup = async (groupId: string) => {
	const group = await db.query.groups.findFirst({
		with: {
			wallets: {
				columns: {
					type: true,
					walletAddress: true,
				},
			},
			pendingMembers: {
				columns: {},
				extras: (fields, { sql }) => ({
					address:
						sql<Address>`SUBSTR(${fields.chainAwareAddress}, INSTR(${fields.chainAwareAddress}, ':') + 1)`.as(
							"address",
						),
				}),
			},
		},
		where: (fields, { eq }) => eq(fields.id, groupId),
	});

	return group
		? {
				...group,
				pendingMembers: group.pendingMembers.map(({ address }) => address),
			}
		: null;
};
