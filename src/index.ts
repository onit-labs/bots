import { Elysia, t } from "elysia";
import {
	createXmtpGroup,
	createXmtpGroupValidator,
} from "./actions/create-xmtp-group";
import { syncPendingMembers } from "./actions/sync-pending-members";
import { getGroup } from "./actions/get-group";

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
 * TODO: Add a method to create a group chat with a list of members
 * TODO: Add a method to remove members from the group chat
 * TODO: Add a method to add members to the group chat
 * TODO: Add a method to retry adding members
 * TODO: Add a method to list all the existing safe group chats for address
 * TODO: Add a method to list all the pending members of group
 * TODO: Add a method to add a deployed counterfactual account to the group chat
 * ! only run the next two methods if the group chat is a **deployed** safe
 * TODO: Add a job to periodically check for new members in a safe and add them to the group chat
 * TODO: Add a job to periodically check for removed members in a safe and remove them from the group chat
 */

export default new Elysia()
	.get("/", () => "Onit XMTP bot 🤖")
	.group("/group/:groupId", (app) => {
		return app
			.get("/", async ({ params: { groupId } }) => {
				if (!groupId) return "Invalid group id";
				return await getGroup(groupId);
			})
			.get("/members", async ({ params: { groupId } }) => {
				if (!groupId) return "Invalid group id";
				return (await getGroup(groupId))?.pendingMembers || [];
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
					const { groupAddress, groupType } = body;
					if (groupType !== "safe")
						return "Sorry only safes are supported at the moment";

					// const { groupId, members } =
					return JSON.stringify(
						await createXmtpGroup({ groupAddress, groupType }),
						null,
						4,
					);

					// if (!groupId) return "Failed to create group";

					// return `Creating group ${groupId} with members ${members}`;
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
