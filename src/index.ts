import { Database } from "bun:sqlite";
import { Elysia, t } from "elysia";
import { createClient } from "./lib/xmtp/cli";

const dbPath = "./bot.db";

const bot = await createClient(dbPath);

console.log(`Created bot with address ${bot.accountAddress}`);

const db = new Database(dbPath);

export default new Elysia()
	.get("/", () => "Onit XMTP bot 🤖")
	.group("/bot", (app) => {
		return app
			.guard({ body: t.Object({ name: t.String(), members: t.Array(t.String()) }) })
			.post("/create", async ({ body }) => {
				const { name, members } = body;

				console.log(`Creating group ${name} with members ${members}`);

				try {
				const groupId = await bot.createGroup();
				if (!groupId) {
					return "Failed to create group";
				}
				console.log(`Group ID is ${groupId}`);
		console.log('add member')
		console.log('adding', 
				await bot.addMembers(groupId, members));
				} catch (e) {
					console.error('error code ->',e.exitCode);
					console.error('error ->', e.stderr.toString());
				}


				return `Creating group ${name} with members ${members}`
			});
	})
	.listen(8080, ({ hostname, port }) => {
		console.log(`🦊 Elysia is running at http://${hostname}:${port}`);
	});
