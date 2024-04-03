import { http, createWalletClient, createPublicClient } from "viem";
// import { privateKeyToAccount } from "viem/accounts";
import { mnemonicToAccount } from "viem/accounts";
// import { chainsByChainId } from './utils/setup-chains'
import { mainnet } from "viem/chains";

export const publicClient = createPublicClient({
	chain: mainnet,
	transport: http(),
})

export function getWalletClient() {
	// const mnemonic = generateMnemonic(english)

	// console.log("mnemonic", mnemonic)

	const mnemonic = process.env.MNEMONIC;
	if (!mnemonic) throw new Error("MNEMONIC is required");
	const account = mnemonicToAccount(mnemonic);
	return {
		mnemonic,
		walletClient: createWalletClient({
			account,
			chain: mainnet,
			transport: http(),
		}),
	};
}
