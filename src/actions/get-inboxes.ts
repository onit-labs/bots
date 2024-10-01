import type { WalletAddress } from "@/db/schema";
import { parseWalletAddress } from "@/lib/chain";
import {
	getInboxIdByAddress,
	getDefaultInboxId,
} from "@/lib/get-inbox-id-by-address";
import type { Address } from "@/db/schema";

export async function getInboxes(
	members: WalletAddress[],
): Promise<
	Array<{ inboxId: string; address: Address; isXmtpV3Enabled: boolean }>
> {
	return (
		await Promise.all(
			members.map(async (walletAddress) => {
				try {
					const { address } = parseWalletAddress(walletAddress);
					let inboxId = await getInboxIdByAddress(address);
					const isXmtpV3Enabled = !!inboxId;
					inboxId ||= getDefaultInboxId(address);

					return { inboxId, address, isXmtpV3Enabled };
				} catch {
					return undefined;
				}
			}),
		)
	).filter((result) => !!result);
}
