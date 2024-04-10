import { Elysia, t } from "elysia";
import {
	createXmtpGroup,
	createXmtpGroupValidator,
} from "./actions/create-xmtp-group";
import { getGroup } from "./actions/get-group";
import { syncStoredMembersWithXmtp } from "./actions/sync-stored-members-with-xmtp";
import { retryAddPendingMembers } from "./actions/retry-add-pending-members";
import {
	AddressLiteral,
	ChainAwareAddressLiteral,
	HexLiteral,
} from "./lib/validators";
import { getOwnersSafes } from "./actions/get-owners-safes";
import { getGroupsByWalletAddresses } from "./actions/get-group-by-wallet-address";
import { addMembers } from "./actions/add-members";
import { removeMembers } from "./actions/remove-members";
import { cron, Patterns } from "@elysiajs/cron";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { bot } from "./lib/xmtp/client";
import { getLinkWalletEIP712TypedData } from "./lib/eth/link-wallet-sign-typed-data";
import { verifyTypedData } from "viem";
import { TypedDataDomain } from "abitype/zod";

/**
 * This service is responsible for keeping xmtp group chat members in sync with the members of a safe.
 *
 * We first have a method to allow a xmtp group chat to be created with a list of members.
 *
 * Then we have a method to check for pending members (members that failed to be added to the group chat i.e. are not
 * yet on XMTP v3). This method will be used to retry adding the members to the group chat and is run on a schedule.
 *
 * Finally we have another method that periodically checks for new members in a safe and adds them to the group chat.
 * Or removes members from the group chat if they are no longer in the safe.
 *
 * **NOTE:** This service only handles updating the members of **deployed** safe accounts. If the account is counterfactual
 * another call will have to be made to the service once the account is deployed.
 *
 * TODO: Add a method to link a deployed counterfactual account to the group chat
 * TODO: Add the ability for a member to remove themselves from a group chat
 * ! only run the next two methods if the group chat is a **deployed** safe
 * TODO: Add a job to periodically check for new members in a safe and add them to the group chat
 * TODO: Add a job to periodically check for removed members in a safe and remove them from the group chat
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
	.use(
		cron({
			name: "sync-members-with-xmtp",
			pattern: Patterns.EVERY_5_MINUTES,
			async run() {
				console.log("sync members with xmtp");
				await syncStoredMembersWithXmtp().catch((e) => console.error(e));
			},
		}),
	)
	.use(
		cron({
			name: "retry-add-pending-members",
			pattern: Patterns.EVERY_5_MINUTES,
			async run() {
				console.log("retry add pending members");
				await retryAddPendingMembers().catch((e) => console.error(e));
			},
		}),
	)
	.get("/", async () => {
		if (process.env.NODE_ENV === "development") {
			console.log("groups", await bot.listGroups());
			await bot
				.send("5eb5b1fa27adc585a75cdedd6a1d4d5d", "Hello")
				.catch(console.error);
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
		return app
			.get("/", async ({ params: { groupId } }) => {
				if (!groupId) return "Invalid group id";
				return await getGroup(groupId);
			})
			.get("/members", async ({ params: { groupId } }) => {
				if (!groupId) return "Invalid group id";
				return (await getGroup(groupId))?.members || [];
			})
			.post(
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
						case "remove":
							return removeMembers(groupId, members);
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
			)
			.get("/wallets", async ({ params: { groupId } }) => {
				if (!groupId) return "Invalid group id";
				return (await getGroup(groupId))?.wallets || [];
			})
			.group(
				"/link-wallet",
				{
					params: t.Object({
						chainAwareAddress: ChainAwareAddressLiteral,
						groupId: t.String(),
					}),
				},
				(app) => {
					return app
						.get(
							"/:chainAwareAddress",
							async ({ params: { groupId, chainAwareAddress } }) => {
								return getLinkWalletEIP712TypedData(chainAwareAddress, groupId);
							},
						)
						.post(
							"/:chainAwareAddress",
							async ({ params: { groupId, chainAwareAddress }, body }) => {
								const group = await getGroup(groupId);

								if (!group) throw new Error("Group not found");

								const { signature } = body;

								console.log("signature", signature);

								const signTypedData = getLinkWalletEIP712TypedData(
									chainAwareAddress,
									groupId,
								);

								// TODO: check that each member is a member of the group
								// TODO: if so then add the wallet to the group
								// TODO: if not return an error
								return await Promise.any(
									group?.members.map(async (member) => {
										return await verifyTypedData({
											address: member.address,
											...signTypedData,
											// @ts-expect-error: still throws even after parsing
											domain: TypedDataDomain.parse(signTypedData.domain),
											signature,
										});
									}),
								);
							},
							{
								body: t.Object({ signature: HexLiteral }),
							},
						);
				},
			);
	})
	.group("/bot", (app) => {
		return app
			.get(
				"/sync-members",
				async ({ query: { groupId } }) => {
					const members = await syncStoredMembersWithXmtp(groupId);
					return JSON.stringify(members, null, 4);
				},
				{
					query: t.Object({ groupId: t.Optional(t.String()) }),
				},
			)
			.get(
				"/retry-add-pending-members",
				async ({ query: { groupId } }) => {
					const pendingMembers = await retryAddPendingMembers(groupId);
					return JSON.stringify(pendingMembers, null, 4);
				},
				{
					query: t.Object({ groupId: t.String() }),
				},
			)
			.post(
				"/create",
				async ({ body }) => {
					const result = await createXmtpGroup(body);

					const { groupId, members, deployments } = result;

					console.log("Created group", groupId, members, deployments);

					if (!groupId) return "Failed to create group";

					return result;
				},
				{ body: createXmtpGroupValidator },
			);
	})
	.listen(8080, ({ hostname, port }) => {
		console.log(`🦊 Elysia is running at http://${hostname}:${port}`);
	});
