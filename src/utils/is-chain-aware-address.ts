import type { ChainAwareAddress, WalletAddress } from "../db/schema";

export function isChainAwareAddress(
	address: WalletAddress,
): address is ChainAwareAddress {
	return address.includes(":");
}
