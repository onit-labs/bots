import type { ChainAwareAddress, WalletAddress } from "@/db/schema";
import type { Address } from "@/db/schema";
import { getAddress } from "viem";
import { getChainId, type SupportedChainId } from "./eth/eip3770-shortnames";

/**
 * Checks if a given address is a valid EVM address with short name prepended.
 *
 * @warning This function will throw if the address is not a valid EVM address or the chain is invalid
 * @param address - The address to check.
 * @returns True if the address is a valid EVM address with short name prepended, false otherwise.
 */
export function isChainAwareAddress(
	address: string | WalletAddress,
): address is ChainAwareAddress {
	// TODO: this check could definitely be better
	return address.includes(":");
}

/**
 * Parses a ChainAwareAddress and returns the chain and address.
 * @warning This function will throw if the address is not a valid ChainAwareAddress.
 * @param chainAwareAddress - The ChainAwareAddress to parse.
 * @returns The parsed ChainAwareAddress.
 */
export function parseChainAwareAddress(chainAwareAddress: ChainAwareAddress): {
	chainId: SupportedChainId;
	address: Address;
} {
	const [shortName, address] = chainAwareAddress.split(":");
	if (!shortName || !address) throw new Error("Invalid ChainAwareAddress");
	// @ts-expect-error: TODO: fixme
	const chainId = getChainId(shortName);
	if (!chainId) throw new Error("Unsupported chain");
	return { chainId, address: getAddress(address) };
}

/**
 * Checks if a given address is a valid EVM address.
 *
 * @warning This function will throw if the address is not a valid EVM address.
 * @param address - The address to check.
 * @returns True if the address is a valid EVM address, false otherwise.
 */
export function isEvmAddress(address: string): address is Address {
	try {
		getAddress(address);
		return true;
	} catch (error) {
		return false;
	}
}

/**
 * Checks if a given address is a wallet address.
 * @warning This function will throw if the address is not a valid ChainAwareAddress or EVM address.
 * @param address - The address to check.
 * @returns True if the address is a wallet address, false otherwise.
 */
export function isWalletAddress(
	address: string | WalletAddress,
): address is WalletAddress {
	return isChainAwareAddress(address) || isEvmAddress(address);
}

/**
 * Parses a wallet address and returns the chain and address.
 * @warning This function will throw if the address is not a valid EVM address.
 * @param walletAddress - The wallet address to parse.
 * @returns The parsed wallet address.
 */
export function parseWalletAddress(walletAddress: WalletAddress): {
	chainId: SupportedChainId | undefined;
	address: Address;
} {
	if (isChainAwareAddress(walletAddress))
		return parseChainAwareAddress(walletAddress);
	if (isEvmAddress(walletAddress))
		return { chainId: undefined, address: getAddress(walletAddress) };
	throw new Error("Invalid wallet address");
}
