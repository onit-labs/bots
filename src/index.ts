import { Elysia, t } from "elysia";
import { syncStoredMembersWithXmtp } from "@/actions/sync-stored-members-with-xmtp";
import { WalletAddressLiteral } from "@/lib/validators";
import { getOwnersSafes } from "@/actions/get-owners-safes";
import { getGroupsByWalletAddresses } from "@/actions/get-group-by-wallet-address";
import { addMembers } from "@/actions/add-members";
import { cron, Patterns } from "@elysiajs/cron";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { client } from "@/lib/xmtp/client";
import { getAuthedUser } from "@/services/auth";
import { isChainAwareAddress } from "@/lib/chain";
import { setupListeners } from "./lib/xmtp/setup-listeners";

if (!process.env.JWT_SECRET) {
	throw new Error("JWT_SECRET is not set");
}

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

export default new Elysia({ serve: { port: process.env.PORT ?? 8080 } })
	.use(
		cron({
			name: "heartbeat",
			pattern: Patterns.EVERY_10_SECONDS,
			run() {
				db.query.groups
					.findMany()
					.then((groups) => console.log("groups -> ", groups));
				db.query.groupWallets
					.findMany()
					.then((wallets) => console.log("group wallets -> ", wallets));
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
	.get("/", async () => "Onit XMTP bot 🤖")
	.group(
		"/wallet/:address",
		{ params: t.Object({ address: WalletAddressLiteral }) },
		(app) => {
			return app.use(getAuthedUser).get(
				"/",
				async ({ params: { address }, user }) => {
					console.log("user ->", user);

					if (
						!user.ethAccounts.some(
							(account) =>
								account.address.toLowerCase() === address.toLowerCase(),
						)
					)
						return new Response(null, { status: 401 });

					// TODO: handle chain aware addresses
					if (isChainAwareAddress(address)) {
						throw new Error("Chain aware addresses are not supported yet");
					}

					const safes = await getOwnersSafes(address);

					console.log("safes ->", safes);

					// - check for groups with the safe address
					return (await getGroupsByWalletAddresses(safes)) || [];
				},
				{ requiresAuthentication: true },
			);
		},
	)
	.group("/group/:groupId", (app) => {
		return app.use(getAuthedUser).post(
			"/members",
			async ({ user, params: { groupId }, body: { members, type } }) => {
				const group = client.conversations.getConversationById(groupId);
				if (!groupId || !group) return "Invalid group id";

				// - ensure the requesting user is an existing group member
				// TODO: should also ensure they have privileges to add members ?
				if (
					!group.members.some((member) =>
						user.ethAccounts.some(
							(account) => account.inboxId === member.inboxId,
						),
					)
				)
					return new Response(null, { status: 401 });

				switch (type) {
					case "add":
						return addMembers(groupId, members);
					default:
						return "Invalid type";
				}
			},
			{
				requiresAuthentication: true,
				body: t.Object({
					members: t.Array(WalletAddressLiteral),
					type: t.Union([t.Literal("add")]),
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
	});
// .listen(PORT, ({ hostname, port }) => {
// 	console.log(`🦊 Elysia is running at http://${hostname}:${port}`);
// });

setupListeners();
