import { Database } from "bun:sqlite";
import { Elysia, t } from "elysia";
import { createClient } from "./lib/xmtp/cli";

const dbPath = "./bot.db";

const bot = await createClient(dbPath);

console.log(`Created bot with address ${bot.accountAddress}`);

const db = new Database(dbPath);

const loggerPlugin = new Elysia()
	.get("/hi", () => "Hi")
	.decorate("log", () => "A")
	.decorate("date", () => new Date())
	.state("fromPlugin", "From Logger")
	.use((app) => app.state("abc", "abc"));

new Elysia()
	.use(loggerPlugin)
	.group("/bot", (app) => {
		return app
			.get("/", () => "Landing")
			.get("/query", () => "Elysia", {
				beforeHandle: ({ query }) => {
					console.log("Name:", query?.name);

					if (query?.name === "peter")
						return `Hi ${JSON.stringify(
							db.query(`select account_address from identity;`).get(),
						)}`;
				},
				query: t.Object({
					name: t.String(),
				}),
			});
	})

	.listen(8080, ({ hostname, port }) => {
		console.log(`🦊 Elysia is running at http://${hostname}:${port}`);
	});
