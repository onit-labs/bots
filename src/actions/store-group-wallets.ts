import type { LinkGroupWallet } from "@/lib/xmtp/content-types/link-wallet";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { sql } from "drizzle-orm";

export async function storeGroupWallets(
	wallets: Array<{
		groupId: string;
		linkedWallet: LinkGroupWallet;
	}>,
) {
	// - ensure all groups exist
	await db
		.insert(schema.groups)
		.values(wallets.map(({ groupId }) => ({ id: groupId })))
		.onConflictDoNothing();

	await db
		.insert(schema.groupWallets)
		.values(
			wallets.map(({ groupId, linkedWallet }) => ({
				type: "safe" as const,
				groupId,
				walletAddress: linkedWallet.address,
				factory: linkedWallet.factory,
				factoryData: linkedWallet.factoryData,
			})),
		)
		.onConflictDoUpdate({
			target: [schema.groupWallets.groupId, schema.groupWallets.walletAddress],
			set: {
				factory: sql`EXCLUDED.${sql.raw(schema.groupWallets.factory.name)}`,
				factoryData: sql`EXCLUDED.${sql.raw(
					schema.groupWallets.factoryData.name,
				)}`,
			},
		});
}
