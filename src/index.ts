import { Elysia, t } from "elysia";
import { getGroup } from "./actions/get-group";
import { syncStoredMembersWithXmtp } from "./actions/sync-stored-members-with-xmtp";
import { AddressLiteral } from "./lib/validators";
import { getOwnersSafes } from "./actions/get-owners-safes";
import { getGroupsByWalletAddresses } from "./actions/get-group-by-wallet-address";
import { addMembers } from "./actions/add-members";
import { cron, Patterns } from "@elysiajs/cron";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { client } from "./lib/xmtp/client";

/**
 * This service is responsible for keeping xmtp group chat members in sync with the members of a safe.
 *
 * We check for pending members (members that failed to be added to the group chat i.e. are not yet on XMTP v3).
 * This method will be used to retry adding the members to the group chat and is run on a schedule.
 *
 * Finally we have another method that periodically checks for new members in a safe and adds them to the group chat.
 *
 * **NOTE:** This service only handles updating the members of **deployed** safe accounts. If the account is counterfactual
 * another call will have to be made to the service once the account is deployed.
 */

/**
 * - TODO
 * - add a method to link a deployed counterfactual account to the group chat
 * - add the ability for a member to remove themselves from a group chat
 *
 * For the V2 version we need the bot to:
 * - keep track of the groups it is in
 * - keep track of the members of each group
 * - handle the addition of new members to a group
 * - track wallets that are attached to a group
 * - periodically check for new members in a safe and add them to the group chat
 *
 * To do this we need to:
 * - track the messages in the group chat that are 'system' messages, i.e. attachWallet, addMember, removeMember, etc
 */

export default new Elysia()
	.use(
		cron({
			name: "heartbeat",
			pattern: Patterns.EVERY_10_SECONDS,
			run() {
				console.log(
					`app.db size -> ${
						db.get<[number]>(
							sql`SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size();`,
						)[0] / 1024
					} KB`,
				);
			},
		}),
	)
	.get("/", async () => {
		if (process.env.NODE_ENV === "development") {
			const conversations = await client.conversations.list();
			console.log("groups", conversations);
		}

		return "Onit XMTP bot 🤖";
	})
	.group(
		"/wallet/:address",
		{ params: t.Object({ address: AddressLiteral }) },
		(app) => {
			return app.get("/", async ({ params: { address } }) => {
				console.log("getting groups by address", address);
				// - get the addresses safes
				const safes = await getOwnersSafes(address);

				console.log("safes ->", safes);

				// - check for groups with the safe address
				return (await getGroupsByWalletAddresses(safes)) || [];
			});
		},
	)
	.group("/group/:groupId", (app) => {
		return app.post(
			"/members",
			async ({ params: { groupId }, body: { members, type } }) => {
				const group = await getGroup(groupId);
				if (!groupId || !group) return "Invalid group id";
				// - we only enable adding and removing members if a wallet is not already attached to the group
				if (group.wallets.length)
					return "Members on group chat with wallets are managed by who is a signer on each of the wallet";

				switch (type) {
					case "add":
						return addMembers(groupId, members);
					default:
						return "Invalid type";
				}
			},
			{
				body: t.Object({
					members: t.Array(AddressLiteral),
					type: t.Union([t.Literal("add"), t.Literal("remove")]),
				}),
			},
		);
	})
	.group("/bot", (app) => {
		return app.get(
			"/sync-members",
			async ({ query: { groupId } }) => {
				const members = await syncStoredMembersWithXmtp(groupId);
				return JSON.stringify(members, null, 4);
			},
			{
				query: t.Object({ groupId: t.Optional(t.String()) }),
			},
		);
	})
	.listen(8080, ({ hostname, port }) => {
		console.log(`🦊 Elysia is running at http://${hostname}:${port}`);
	});
