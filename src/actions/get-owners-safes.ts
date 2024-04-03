import * as R from "remeda";
import type { Address } from "viem";
import { chainsByChainId, type ChainWithSafe } from "../lib/eth/setup-chains";
import type { OwnerResponse } from "@safe-global/api-kit";
import type { ChainAwareAddress } from "../db/schema";

export async function getOwnersSafes(address: Address) {
	const infoPromises = await Promise.allSettled(
		R.pipe(
			chainsByChainId,
			R.values,
			R.map(async (chain) => {
				return [
					chain,
					await chain.safe?.api.getSafesByOwner(address),
				] satisfies [ChainWithSafe, OwnerResponse | undefined];
			}),
		),
	);

	let safes: ChainAwareAddress[] = [];

	for (const result of infoPromises) {
		if (result.status !== "fulfilled") continue;
		const [chain, owner] = result.value;
		if (owner) {
			for (const safe of owner.safes) {
				safes.push(`${chain.safe?.shortName}:${safe as Address}` satisfies ChainAwareAddress);
			}
		}
	}

	return safes;
}
