import SafeApiKit from "@safe-global/api-kit";
import type { SafeSingletonResponse } from "@safe-global/api-kit";
import { TRANSACTION_SERVICE_URLS } from "@safe-global/api-kit/dist/src/utils/config";
import * as R from "remeda";
import type { ValueOf, Simplify } from "type-fest";
import type { Chain } from "viem/chains";
import * as chains from "viem/chains";
import { chainShortNames } from "./eip3770-shortnames";

export type ChainId = ValueOf<typeof chains>["id"];

export interface ChainWithSafe extends Chain {
	safe?: {
		singletons: SafeSingletonResponse[];
		api: SafeApiKit;
		shortName: Simplify<ValueOf<typeof chainShortNames>>;
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
		if (!singletons) return;
		return { chainId, singletons, txServiceUrl };
	} catch (e) {
		console.error("error", e);
	}
}

async function setupChains() {
	const singletonPromises = await Promise.allSettled(
		Object.entries(TRANSACTION_SERVICE_URLS).flatMap(([chainId, txServiceUrl]) =>
		chainId === '5' ? [] : // skip Goerli testnet
			[getSingletons(Number(chainId) as ChainId, txServiceUrl)],
		),
	);

	for (const result of singletonPromises) {
		if (result.status === "fulfilled") {
			if (!result.value) continue;
			const chain = chainsByChainId[result.value.chainId];
			const { singletons, txServiceUrl, chainId } = result.value;
			if (chainId in chainShortNames)
				chain.safe = {
					singletons,
					api: new SafeApiKit({ chainId: BigInt(chainId), txServiceUrl: `${txServiceUrl}/api` }),
					shortName: chainShortNames[chainId as keyof typeof chainShortNames],
				};
			// console.log(
			// 	`Successfully setup ${chain.name} chain -> shortName: ${chain.safe?.shortName}`,
			// );
		} else {
			console.error("Error setting up chain", result.reason);
		}
	}

	chainsByChainId = R.omitBy(chainsByChainId, (chain) => !chain.safe);
}
