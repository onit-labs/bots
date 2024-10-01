import type { Address } from "viem";
import { sha256 } from "viem";
import { client } from "../lib/xmtp/client";

export function getDefaultInboxId(address: Address): string {
	return sha256(`${address.toLowerCase()}0` as `0x${string}`).slice(2);
}

export async function getInboxIdByAddress(
	address: Address,
	shouldFallback?: false,
): Promise<string | undefined>;
export async function getInboxIdByAddress(
	address: Address,
	shouldFallback: true,
): Promise<string>;
export async function getInboxIdByAddress(
	address: Address,
	shouldFallback = true,
): Promise<string | undefined> {
	const inboxId = await client.getInboxIdByAddress(address);
	return inboxId || (shouldFallback ? getDefaultInboxId(address) : undefined);
}
