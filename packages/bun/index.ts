import { createClient } from "./utils/xmtp/cli";
// import { Client } from "@xmtp/xmtp-js";
// import { getWalletClient } from "./utils/viem/wallet";

// const wallet = getWalletClient();

// // @ts-expect-error: xmtp types do not like private key accounts
// const xmtp = await Client.create(wallet, {
// 	privateKeyOverride: new Uint8Array(
// 		JSON.parse(process.env["XMTP_KEY_BUNDLE"]!),
// 	),
// });

// console.log("xmtp", xmtp);

try {
	const bot = await createClient("./bot.db");
	console.log(`Created bot with address ${bot.accountAddress}`);
} catch (err) {
	console.log(`Failed with code ${err.exitCode}`);
}
