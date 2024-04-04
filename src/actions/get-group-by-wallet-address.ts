import type { Address } from "viem";
import { db } from "../db";
import type { ChainAwareAddress } from "../db/schema";
import { sqliteAddressFromChainAwareAddress } from "../lib/sqlite-address-from-chain-aware-address";

const groupWalletColumns = {
	columns: {
		type: true,
		walletAddress: true,
	},
	with: {
		group: {
			columns: { id: true },
			with: {
				pendingMembers: {
					columns: {},
					extras: (fields) => ({
						address: sqliteAddressFromChainAwareAddress(
							fields.chainAwareAddress,
						).as("address"),
					}),
				},
			},
		},
	},
} as const satisfies Parameters<typeof db.query.groupWallets.findFirst>[0];

/**
 * Get a group by the wallet address
 * @param {Address | ChainAwareAddress} walletAddress
 * @returns {Promise<{
 *   id: string;
 *   wallet: {
 *     type: string;
 *     walletAddress: string;
 *   };
 *   pendingMembers: Address[];
 * } | null>}
 */
export async function getGroupByWalletAddress(
	walletAddress: Address | ChainAwareAddress,
) {
	// - extract the chain prefix from the wallet address
	const groupAddressWithoutPrefix =
		walletAddress.split(":")[1] || walletAddress;

	// - query the database for a group wallet with the same address
	const groupWallet = await db.query.groupWallets.findFirst({
		...groupWalletColumns,
		// - compare the wallet address without the chain prefix
		where: (fields, { sql }) =>
			sql`${sqliteAddressFromChainAwareAddress(
				fields.walletAddress,
			)} = ${groupAddressWithoutPrefix}`,
	});

	if (!groupWallet || !groupWallet?.group?.id) return null;

	return {
		...groupWallet.group,
		wallet: {
			type: groupWallet.type,
			walletAddress: groupWallet.walletAddress,
		},
		pendingMembers:
			groupWallet.group?.pendingMembers.map(({ address }) => address) || [],
	};
}

export async function getGroupsByWalletAddresses(
	walletAddresses: (Address | ChainAwareAddress)[],
) {
	console.log("getting groups by addresses", walletAddresses);

	// - extract the chain prefix from the wallet address
	const groupAddressesWithoutPrefix = walletAddresses.map(
		(walletAddress) =>
			(walletAddress.split(":")[1] || walletAddress) as Address,
	);

	if (!groupAddressesWithoutPrefix || groupAddressesWithoutPrefix.length === 0)
		return null;

	// - query the database for a group wallet with the same address
	const groupWallets = await db.query.groupWallets.findMany({
		...groupWalletColumns,
		// - compare the wallet address without the chain prefix
		where: (fields, { inArray }) =>
			inArray(
				sqliteAddressFromChainAwareAddress(fields.walletAddress),
				groupAddressesWithoutPrefix,
			),
	});

	if (!groupWallets || groupWallets.length === 0) return null;

	return groupWallets.map((groupWallet) => ({
		...groupWallet.group,
		wallet: {
			type: groupWallet.type,
			walletAddress: groupWallet.walletAddress,
		},
		pendingMembers:
			groupWallet.group?.pendingMembers.map(({ address }) => address) || [],
	}));
}
