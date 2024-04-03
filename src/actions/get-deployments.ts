import * as R from "remeda";
import type { Address } from "viem";
import { chainsByChainId, type ChainWithSafe } from "../lib/eth/setup-chains";
import type { ChainAwareAddress } from "../db/schema";
import type { SafeInfoResponse } from "@safe-global/api-kit";

export async function getDeployments({
	address,
	type,
}: {
	address: Address | ChainAwareAddress;
	type: "safe" | "party";
}) {
	let deployments: { address: ChainAwareAddress; members: Address[] }[] = [];

	switch (type) {
		case "safe": {
			// - concurrently get the safe info for each supported chain
			// - if the address is a chain aware address, only check the chain that matches the short name
			const infoPromises = await Promise.allSettled(
				R.pipe(
					R.values(chainsByChainId),
					// - ensure we only check the necessary chains
					R.filter((chain) => {
						if (!address.includes(":")) return true;
						const addressShortName = address.split(":")[0];
						return chain.safe?.shortName === addressShortName;
					}),
					// - get the safe info for each chain
					R.map(async (chain) => {
						const [_, addressWithoutShortName] = address.split(":") as [
							string,
							Address,
						];
						return [
							chain,
							await chain.safe?.api
								.getSafeInfo(addressWithoutShortName)
								.catch((e) => console.log("failed to get safe info ->", e)),
						] satisfies [ChainWithSafe, SafeInfoResponse | undefined | void];
					}),
				),
			);

			for (const result of infoPromises) {
				if (result.status !== "fulfilled") continue;
				const [chain, info] = result.value;
				if (info && chain.safe && chain.safe.shortName) {
					const { address, owners } = info;
					deployments.push({
						address: `${chain.safe.shortName}:${address as Address}`,
						members: owners as Address[],
					});
				}
			}
			break;
		}
		case "party":
		// tODO: support party
		default:
			break;
	}

	return deployments;
}
