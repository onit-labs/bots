import type { Address, ChainAwareAddress, WalletAddress } from "@/db/schema"
import { db } from "@/db"
import { sqliteAddressFromChainAwareAddress } from "@/lib/sqlite-address-from-chain-aware-address"
import { parseWalletAddress } from "@/lib/chain"

const groupWalletColumns = {
	columns: {
		type: true,
		walletAddress: true,
	},
	with: {
		signers: { columns: { address: true } },
		group: {
			columns: { id: true },
			with: { pendingMembers: true },
		},
	},
} as const satisfies Parameters<typeof db.query.groupWallets.findFirst>[0]

/**
 * Get a group by the wallet address
 */
export async function getGroupByWalletAddress(walletAddress: WalletAddress) {
	// - extract the chain prefix from the wallet address
	const { address: groupAddress } = parseWalletAddress(walletAddress)

	// - query the database for a group wallet with the same address
	const groupWallet = await db.query.groupWallets.findFirst({
		...groupWalletColumns,
		// - compare the wallet address without the chain prefix
		where: (fields, { sql }) =>
			sql`${sqliteAddressFromChainAwareAddress(
				fields.walletAddress,
			)} = ${groupAddress}`,
	})

	if (!groupWallet || !groupWallet?.group?.id) return null

	return {
		...groupWallet.group,
		wallet: {
			...groupWallet,
			signers: groupWallet.signers.map((signer) => signer.address),
		},
	}
}

export async function getGroupsByWalletAddresses(
	walletAddresses: (Address | ChainAwareAddress)[],
) {
	// - extract the chain prefix from the wallet address
	const groupAddresses = walletAddresses.map(
		(walletAddress) => parseWalletAddress(walletAddress).address,
	)

	if (!groupAddresses || groupAddresses.length === 0) return null

	// - query the database for a group wallet with the same address
	const groupWallets = await db.query.groupWallets.findMany({
		...groupWalletColumns,
		// - compare the wallet address without the chain prefix
		where: (fields, { inArray }) =>
			inArray(
				sqliteAddressFromChainAwareAddress(fields.walletAddress),
				groupAddresses,
			),
	})

	if (!groupWallets || groupWallets.length === 0) return null

	return groupWallets.map((groupWallet) => ({
		...groupWallet.group,
		wallet: {
			...groupWallet,
			signers: groupWallet.signers.map((signer) => signer.address),
		},
	}))
}
