import { Elysia, t } from "elysia";
import {
	createXmtpGroup,
	createXmtpGroupValidator,
} from "./actions/create-xmtp-group";
import { getGroup } from "./actions/get-group";
import { syncPendingMembers } from "./actions/sync-pending-members";
import { AddressLiteral } from "./lib/validators";
import { getOwnersSafes } from "./actions/get-owners-safes";
import { getGroupsByWalletAddresses } from "./actions/get-group-by-wallet-address";
import { addMembers } from "./actions/add-members";
import { removeMembers } from "./actions/remove-members";

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
 * ! only run the next two methods if the group chat is a **deployed** safe
 * TODO: Add a job to periodically check for new members in a safe and add them to the group chat
 * TODO: Add a job to periodically check for removed members in a safe and remove them from the group chat
 */

export default new Elysia()
	.get("/", () => "Onit XMTP bot 🤖")
	.group("/:address", (app) => {
		return app.get(
			"/",
			async ({ params: { address } }) => {
				// - get the addresses safes
				const safes = await getOwnersSafes(address);

				// - check for groups with the safe address
				return await getGroupsByWalletAddresses(safes);
			},
			{ params: t.Object({ address: AddressLiteral }) },
		);
	})
	.group("/group/:groupId", (app) => {
		return app
			.get("/", async ({ params: { groupId } }) => {
				if (!groupId) return "Invalid group id";
				return await getGroup(groupId);
			})
			.get("/members", async ({ params: { groupId } }) => {
				if (!groupId) return "Invalid group id";
				return (await getGroup(groupId))?.pendingMembers || [];
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
			.post("/link-wallet", async ({ params: { groupId }, body }) => {
				return "Not implemented";
			});
	})
	.group("/bot", (app) => {
		return app
			.get("/sync-pending-members", async () => {
				const pendingMembers = await syncPendingMembers();
				return JSON.stringify(pendingMembers, null, 4);
			})
			.post(
				"/create",
				async ({ body }) => {
					const result = await createXmtpGroup(body);

					const { groupId, members, pendingMembers, deployments } = result;

					console.log(
						"Created group",
						groupId,
						members,
						pendingMembers,
						deployments,
					);

					// if (!groupId) return "Failed to create group";

					return result;
				},
				{ body: createXmtpGroupValidator },
			);
		// .get(
		// 	"safe/:chainId",
		// 	async ({ params: { chainId } }) => {
		// 		if (Number.isNaN(chainId) || !(chainId in chainsByChainId)) {
		// 			return "Invalid chainId";
		// 		}
		// 		const chain =
		// 			chainsByChainId[Number(chainId) as keyof typeof chainsByChainId];

		// 		return `Getting safe singletons for ${chain.name}`;
		// 	},
		// 	{ params: t.Object({ chainId: t.Numeric() }) },
		// );
	})
	.listen(8080, ({ hostname, port }) => {
		console.log(`🦊 Elysia is running at http://${hostname}:${port}`);
	});
