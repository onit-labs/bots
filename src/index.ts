import { Database } from "bun:sqlite";
import { Elysia, t } from "elysia";
import { createClient } from "./lib/xmtp/cli";
import { chainsByChainId } from "./lib/setup-chains";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import type { ChainAwareAddress } from "./db/schema";
import * as schema from "./db/schema";
import type { Address } from "viem";

const libxmtpDbPath = "./bot.db";
const bot = await createClient(libxmtpDbPath);
// const libmxtpDb = new Database(libxmtpDbPath);
const appDb = new Database("./app.db");
const db = drizzle(appDb, { schema });

migrate(db, { migrationsFolder: "./src/db/migrations" });

export default new Elysia()
	.get("/", () => "Onit XMTP bot 🤖")
	.group("/bot", (app) => {
		return app
			.get("/check-pending-members", async () => {
				const pendingMembers = await db.query.pendingGroupMembers.findMany({
					where(fields, { eq }) {
						return eq(fields.status, "pending");
					},
				});

				return JSON.stringify(pendingMembers, null, 4);
			})
			.post(
				"/create",
				async ({ body }) => {
					const { members } = body;

					let groupId: string | undefined = undefined;
					let pendingMembers: Address[] = [];

					try {
						groupId = await bot.createGroup();
						if (groupId) await db.insert(schema.groups).values({ id: groupId });
					} catch (e) {
						console.log("failed to create group", groupId, members);
						console.error("error code ->", (e as any).exitCode);
						console.error("error ->", (e as any).stderr.toString());
					} finally {
						if (!groupId) {
							console.log("Failed to create group");
							return "Failed to create group";
						}
					}

					try {
						const addedMembers = await bot.addMembers(groupId, members);
						console.log(
							`Group ID is ${groupId} -> Added members ${addedMembers}`,
						);
					} catch (e) {
						// - if a adding members fails we need to try each of them individually to see which of the members failed
						for await (const member of members) {
							console.log(`adding -> ${member}`);
							await bot.addMembers(groupId, [member]).catch(() => {
								console.log(`failed to add -> ${member}`);
								pendingMembers.push(member as Address);
							});
						}
					}

					console.log("Pending members -> ", pendingMembers);

					await db.insert(schema.pendingGroupMembers).values(
						pendingMembers.map((memberAddress) => ({
							status: "pending" as const,
							groupId,
							// TODO: once XMTP supports contract wallets update this
							chainAwareAddress:
								`eth:${memberAddress}` satisfies ChainAwareAddress,
						})),
					);

					return `Creating group ${groupId} with members ${members}`;
				},
				{
					body: t.Object({
						members: t.Array(
							t.RegExp(/0x[a-f0-9]{40}/gi)
							// t.String({ pattern: "/0x[a-f0-9]{40}/gi", format: 'regex' })
							),
					}),
				},
			)
			.get(
				"safe/:chainId",
				async ({ params: { chainId } }) => {
					if (Number.isNaN(chainId) || !(chainId in chainsByChainId)) {
						return "Invalid chainId";
					}
					const chain =
						chainsByChainId[Number(chainId) as keyof typeof chainsByChainId];

					return `Getting safe singletons for ${chain.name}`;
				},
				{ params: t.Object({ chainId: t.Numeric() }) },
			);
	})
	.listen(8080, ({ hostname, port }) => {
		console.log(`🦊 Elysia is running at http://${hostname}:${port}`);
	});
