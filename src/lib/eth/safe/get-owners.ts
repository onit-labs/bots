import * as R from "remeda";
import type { ChainAwareAddress } from "../../../db/schema";
import { safeAbi } from "../abis/safe";
import { chainsByChainId } from "../setup-chains";
import { createPublicClient, http, type Address } from "viem";

export const getSafeOwners = async (safeAddress: ChainAwareAddress) => {
	const [shortName, address] = safeAddress.split(":") as [
		string | undefined,
		Address | undefined,
	];

	if (!shortName || !address) {
		throw new Error("Invalid safe address");
	}

	const chain = R.pipe(
		chainsByChainId,
		R.values,
		R.find((chain) => chain.safe?.shortName === shortName),
	);

	if (!chain) {
		throw new Error("Chain not supported");
	}

	const client = createPublicClient({
		chain,
		transport: http(),
	});

	return await client.readContract({
		abi: safeAbi,
		functionName: "getOwners",
		address,
	});
};
