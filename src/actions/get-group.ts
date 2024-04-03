import { db } from "../db";
import { sqliteAddressFromChainAwareAddress } from "../lib/sqlite-address-from-chain-aware-address";

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
				extras: (fields) => ({
					address: sqliteAddressFromChainAwareAddress(
						fields.chainAwareAddress,
					).as("address"),
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
