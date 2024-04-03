import { Elysia, t } from "elysia";
import {
	createXmtpGroup,
	createXmtpGroupValidator,
} from "./actions/create-xmtp-group";
import { syncPendingMembers } from "./actions/sync-pending-members";
import { chainsByChainId } from "./lib/setup-chains";

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
 */

export default new Elysia()
	.get("/", () => "Onit XMTP bot 🤖")
	.group("/bot", (app) => {
		return app
			.get("/sync-pending-members", async () => {
				const pendingMembers = await syncPendingMembers();
				return JSON.stringify(pendingMembers, null, 4);
			})
			.post(
				"/create",
				async ({ body }) => {
					const { members, groupAddress, groupType } = body;
					if (groupType !== "safe")
						return "Sorry only safes are supported at the moment";

					const { groupId } = await createXmtpGroup({ members, groupAddress, groupType });

					if (!groupId) return "Failed to create group";

					return `Creating group ${groupId} with members ${members}`;
				},
				{ body: createXmtpGroupValidator },
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
