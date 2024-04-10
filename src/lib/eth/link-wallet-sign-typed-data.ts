import { getAddress, type Address } from "viem";
import type { ChainAwareAddress } from "../../db/schema";
import { chainShortNames } from "./eip3770-shortnames";
import type { TypedDataDomain } from "abitype/zod";

type EIP712Domain = Zod.infer<typeof TypedDataDomain>;

type LinkingMessage = {
	address: Address;
	groupId: string;
};

export function getLinkWalletEIP712TypedData(
	safeAddress: ChainAwareAddress,
	groupId: string,
) {
	const [chainShortName, addressFromSplit] = safeAddress.split(":");

	if (!chainShortName || !addressFromSplit) {
		throw new Error("Invalid safe address");
	}

	const address = getAddress(addressFromSplit);

	const [chainId] =
		Object.entries(chainShortNames).find(
			([_, shortName]) => shortName === chainShortName,
		) ?? [];

	if (!chainId) {
		throw new Error(`Chain ${chainShortName} not supported`);
	}

	const domain: EIP712Domain = {
		name: "Link Safe With XMTP Group Chat",
		version: "1",
		chainId: Number(chainId),
	};

	const types = {
		EIP712Domain: [
			{ name: "name", type: "string" },
			{ name: "version", type: "string" },
			{ name: "chainId", type: "uint256" },
		],
		LinkingMessage: [
			{ name: "address", type: "address" },
			{ name: "groupId", type: "string" },
		],
	};

	const message: LinkingMessage = { address, groupId };

	return {
		domain,
		types,
		primaryType: "LinkingMessage" as const,
		message,
	};
}
