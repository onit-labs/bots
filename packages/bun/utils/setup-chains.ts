import type { SafeSingletonResponse } from "@safe-global/api-kit";
import { TRANSACTION_SERVICE_URLS } from "@safe-global/api-kit/dist/src/utils/config";
import * as R from "remeda";
import type { ValueOf } from "type-fest";
import type { Chain } from "viem/chains";
import * as chains from "viem/chains";

export type ChainId = ValueOf<typeof chains>["id"];

export interface ChainWithSafe extends Chain {
	safe?: {
		singletons: SafeSingletonResponse[];
		txServiceUrl: string;
	};
}

export let chainsByChainId = R.pipe(
	chains,
	R.values,
	R.pullObject(R.prop("id"), R.identity),
) as Record<ChainId, ChainWithSafe>;

/**
 * Stores all viem supported chains with safe singletons and transaction service url
 */
await setupChains();

async function getSingletons(
	chainId: ChainId,
	txServiceUrl: string,
): Promise<
	| {
			chainId: ChainId;
			singletons: SafeSingletonResponse[];
			txServiceUrl: string;
	  }
	| undefined
> {
	const chain = chainsByChainId[chainId];
	if (!chain) return;
	try {
		const singletons = (await fetch(
			`${txServiceUrl}/api/v1/about/singletons/`,
		).then((res) => res.json())) as SafeSingletonResponse[] | undefined;
		return {
			chainId,
			singletons: singletons!,
			txServiceUrl,
		};
	} catch (e) {
		console.error("error", e);
	}
}

async function setupChains() {
	const singletonPromises = await Promise.allSettled(
		Object.entries(TRANSACTION_SERVICE_URLS).map(([chainId, txServiceUrl]) =>
			getSingletons(Number(chainId) as ChainId, txServiceUrl),
		),
	);

	for (const result of singletonPromises) {
		if (result.status === "fulfilled") {
			if (!result.value) continue;
			const chain = chainsByChainId[result.value.chainId];
			chain.safe = result.value;
			console.log(`Successfully setup ${chain.name} chain`);
		} else {
			console.error("Error setting up chain", result.reason);
		}
	}

	chainsByChainId = R.omitBy(chainsByChainId, (chain) => !chain.safe);
}
