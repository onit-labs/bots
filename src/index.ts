import * as R from "remeda"
import { Elysia, t } from "elysia"
import { WalletAddressLiteral } from "@/lib/validators"
import { getOwnersSafes } from "@/actions/get-owners-safes"
import { getGroupsByWalletAddresses } from "@/actions/get-group-by-wallet-address"
import { addMembers } from "@/actions/add-members"
import { cron, Patterns } from "@elysiajs/cron"
import { db } from "@/db"
import { sql } from "drizzle-orm"
import { client } from "@/lib/xmtp/client"
import { getAuthedUser } from "@/services/auth"
import { isChainAwareAddress, parseWalletAddress } from "@/lib/chain"
import { setupListeners } from "./lib/xmtp/setup-listeners"
import type { Address } from "./db/schema"
import {
	retryAddMember,
	retryPendingMembers,
} from "./actions/retry-pending-members"
import { sqliteAddressFromChainAwareAddress } from "./lib/sqlite-address-from-chain-aware-address"

if (!process.env.JWT_SECRET) {
	throw new Error("JWT_SECRET is not set")
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
				console.log(
					`app.db size -> ${
						db.get<[number]>(
							sql`SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size();`,
						)[0] / 1024
					} KB`,
				)
			},
		}),
	)
	.use(
		cron({
			name: "retry all pending members",
			pattern: Patterns.EVERY_10_MINUTES,
			async run() {
				console.log("retrying all pending members")
				await retryPendingMembers()
			},
		}),
	)
	.get("/", async () => "Onit XMTP bot 🤖")
	.group("/v2", (app) => {
		return app
			.group(
				"/wallets/:address",
				{ params: t.Object({ address: WalletAddressLiteral }) },
				(app) =>
					app
						.get("/sync", async ({ params: { address } }) => {
							const pendingGroups = await db.query.pendingMembers.findMany({
								columns: { groupId: true },
								where: (fields, { eq, or }) =>
									or(
										eq(fields.address, address),
										eq(
											sqliteAddressFromChainAwareAddress(fields.address),
											address,
										),
									),
							})

							console.log(
								`syncing all pending groups for the wallet ${address}`,
							)
							console.log("pending groups ->", pendingGroups)

							const batchedPromises = R.chunk(
								pendingGroups
									.filter(({ groupId }) => !!groupId)
									// biome-ignore lint/style/noNonNullAssertion: filtered
									.map(({ groupId }) => retryPendingMembers(groupId!).catch()),
								10,
							)

							for (const batch of batchedPromises) {
								await Promise.all(batch)
							}
						})
						.use(getAuthedUser)
						.onBeforeHandle(({ error, params: { address }, user }) => {
							// ! ensure the user has authority over the account they are requesting
							if (
								!user.ethAccounts.some(
									(account) =>
										account.address.toLowerCase() === address.toLowerCase(),
								)
							)
								return error(401)

							// TODO: handle chain aware addresses
							if (isChainAwareAddress(address))
								return error(400, "Chain aware addresses are not supported yet")
						})
						.get(
							"/",
							async ({ params: { address } }) => {
								const safes = await getOwnersSafes(address as Address)

								console.log("safes ->", safes)

								// - check for groups with the safe address
								return (await getGroupsByWalletAddresses(safes)) || []
							},
							{ requiresAuthentication: true },
						),
				// .post("/", async ({ params: { address }, user, body }) => {}),
			)
			.group("/groups/:groupId", (app) => {
				return app
					.use(getAuthedUser)
					.patch(
						"/members",
						/**
						 * This route is used to add new members to a group chat. The caller must be an existing group member.
						 */
						async ({ params: { groupId }, body: { members } }) => {
							const group = client.conversations.getConversationById(groupId)
							if (!groupId || !group) return "Invalid group id"

							await addMembers(groupId, members)
						},
						{ body: t.Object({ members: t.Array(WalletAddressLiteral) }) },
					)
					.post(
						"/members",
						async ({ user, params: { groupId }, body: { members, type } }) => {
							const group = client.conversations.getConversationById(groupId)
							if (!groupId || !group) return "Invalid group id"

							// - ensure the requesting user is an existing group member
							// TODO: should also ensure they have privileges to add members ?
							if (
								!group.members.some((member) =>
									user.ethAccounts.some(
										(account) => account.inboxId === member.inboxId,
									),
								)
							)
								return new Response(null, { status: 401 })

							switch (type) {
								case "add":
									return addMembers(groupId, members)
								default:
									return "Invalid type"
							}
						},
						{
							requiresAuthentication: true,
							body: t.Object({
								members: t.Array(WalletAddressLiteral),
								type: t.Union([t.Literal("add")]),
							}),
						},
					)
					.post(
						"/members/:walletAddress",
						async ({ params: { groupId, walletAddress } }) => {
							const group = client.conversations.getConversationById(groupId)
							if (!groupId || !group) return "Invalid group id"
							const { address } = parseWalletAddress(walletAddress)
							// - do nothing if the user is already on the group
							if (
								group.members.some((member) =>
									member.accountAddresses.some(
										(addy) => addy.toLowerCase() === address.toLowerCase(),
									),
								)
							)
								return new Response(null, { status: 200 })

							// - if the user is a pending member of the group then we try to add them again
							await retryAddMember({ groupId, address })
						},
						{
							params: t.Object({
								groupId: t.String(),
								walletAddress: WalletAddressLiteral,
							}),
						},
					)
			})
	})
// .listen(PORT, ({ hostname, port }) => {
// 	console.log(`🦊 Elysia is running at http://${hostname}:${port}`);
// });

setupListeners()
