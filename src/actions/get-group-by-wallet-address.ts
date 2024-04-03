import type { Address } from "viem"
import { db } from "../db"
import type { ChainAwareAddress } from "../db/schema"

export async function getGroupByWalletAddress(walletAddress: Address | ChainAwareAddress) {
  // - extract the chain prefix from the wallet address
  const groupAddressWithoutPrefix = walletAddress.split(':')[1] || walletAddress

  // - query the database for a group wallet with the same address
  const groupWallet = await db.query.groupWallets.findFirst({
    columns: {
					type: true,
					walletAddress: true,
				},
    with: {
      group: {columns: {id: true} ,with: { 
      pendingMembers: {
        columns: {},
        extras: (fields, { sql }) => ({
          address: sql<Address>`SUBSTR(${fields.chainAwareAddress}, INSTR(${fields.chainAwareAddress}, ':') + 1)`.as("address")
        })
      }}}
    },
    // - compare the wallet address without the chain prefix
    where: (fields, { sql }) => sql`SUBSTR(${fields.walletAddress}, INSTR(${fields.walletAddress}, ':') + 1) = ${groupAddressWithoutPrefix}`
  })

  if (!groupWallet || !groupWallet?.group?.id) return null

  return {
     ...groupWallet.group,
    wallet: {
      type: groupWallet.type,
      walletAddress: groupWallet.walletAddress
    },
    pendingMembers: groupWallet.group?.pendingMembers.map(({ address }) => address) || []
  }
}