import { Client } from "@xmtp/xmtp-js";
import { http, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
// import { chainsByChainId } from './utils/setup-chains'
import { mainnet } from "viem/chains";

function getWalletClient() {
	const account = privateKeyToAccount(
		process.env.PRIVATE_KEY! as `0x${string}`,
	);
	return createWalletClient({
		account,
		chain: mainnet,
		transport: http(),
	});
}

const wallet = getWalletClient();

// @ts-expect-error: xmtp types do not like private key accounts
const xmtp = await Client.create(wallet, {
	privateKeyOverride: new Uint8Array(JSON.parse(process.env.XMTP_KEY_BUNDLE!)),
});

console.log("xmtp", xmtp);
