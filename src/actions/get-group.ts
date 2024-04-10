import { db } from "../db";
import { sqliteAddressFromChainAwareAddress } from "../lib/sqlite-address-from-chain-aware-address";

export const getGroup = async (groupId: string) => {
	return await db.query.groups.findFirst({
		with: {
			wallets: {
				columns: {
					type: true,
					walletAddress: true,
				},
			},
			members: {
				columns: { status: true },
				extras: (fields) => ({
					address: sqliteAddressFromChainAwareAddress(
						fields.chainAwareAddress,
					).as("address"),
				}),
			},
		},
		where: (fields, { eq }) => eq(fields.id, groupId),
	});
};
