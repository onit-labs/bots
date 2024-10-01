import * as fs from "node:fs";
import { Client, type XmtpEnv } from "@xmtp/mls-client";
import { TextCodec } from "@xmtp/content-type-text";
import { mnemonicToAccount } from "viem/accounts";
import { createWalletClient, http, toBytes } from "viem";
import { mainnet } from "viem/chains";

const env = process.env.XMTP_ENV as XmtpEnv | undefined;
const encryptionKey = process.env.ENCRYPTION_KEY as string | undefined;
let mnemonic = process.env.MNEMONIC as string | undefined;

if (!env || !encryptionKey || !mnemonic) {
	throw new Error("XMTP_ENV or ENCRYPTION_KEY is not set");
}

const account = mnemonicToAccount(mnemonic);

const dbPath = `./data/${env}-${account.address}.db`;

if (!fs.existsSync(dbPath)) {
	fs.mkdirSync(dbPath);
}

export const client = await Client.create(account.address, {
	env,
	dbPath,
	codecs: [new TextCodec()],
	encryptionKey: toBytes(encryptionKey).slice(0, 32),
});

console.log("XMTP Client: ", {
	accountAddress: client.accountAddress,
	inboxId: client.inboxId,
	installationId: client.installationId,
});

if (!client.isRegistered && client.signatureText) {
	const wallet = createWalletClient({
		account,
		chain: mainnet,
		transport: http(),
	});

	// register identity
	const signature = await wallet.signMessage({ message: client.signatureText });
	const signatureBytes = toBytes(signature);
	client.addEcdsaSignature(signatureBytes);
	await client.registerIdentity();
}

mnemonic = undefined;
