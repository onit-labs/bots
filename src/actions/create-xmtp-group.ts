import { t, type Static } from "elysia";
import * as R from "remeda";
import type { Address } from "viem";
import { db } from "../db";
import type { ChainAwareAddress } from "../db/schema";
import * as schema from "../db/schema";
import { AddressLiteral, AddressOrChainAwareAddress } from "../lib/validators";
import { bot } from "../lib/xmtp/client";
import { getDeployments } from "./get-deployments";
import { getGroupByWalletAddress } from "./get-group-by-wallet-address";
import { addMembers } from "./add-members";
import type { CliError } from "../lib/xmtp/cli";
import { getGroup } from "./get-group";

/**
 * TODO: ?
 * ? we could convert this into a web hook and give progressive feedback ...
 * ? it can be quite slow adding members individually
 */

export const createXmtpGroupValidator = t.Object({
	groupAddress: t.Optional(AddressOrChainAwareAddress),
	members: t.Optional(t.Array(AddressLiteral)), // ! once xmtp supported contracts we can use this -> t.Array(AddressOrChainAwareAddress),
	groupType: t.Optional(t.Union([t.Literal("safe"), t.Literal("party")])),
});

/**
 * Create a group on XMTP and add the members to the group
 * The `groupAddress` should be a multisig address. The signers will then all be added to the group chat
 * and a job to track the members of the group chat will be created to sync the members of the group chat with the
 * signers of the multisig
 *
 * @param {Object} group
 * @param {Address[]} [group.members=[]]                    The members to add to the group chat (default: [])
 * @param {type} [group.members=safe]                       The type of wallet that is attached to the group chat (default: safe)
 * @param {Address | ChainAwareAddress} group.groupAddress  If a ChainAwareAddress is provided the wallet will be added to the group
 *                                                          If an Address is provided all supported chains will be checked for a wallet deployment
 *                                                          and each wallet will be added to the group
 * @returns {Promise<{
 *   groupId: string | undefined;
 *   members?: Array<{ status: "pending" | "approved" | "rejected"; address: Address }>;
 *   deployments?: ReturnType<typeof getDeployments>;
 *  }>
 * }
 */
export async function createXmtpGroup(
	group: Static<typeof createXmtpGroupValidator>,
): Promise<{
	groupId: string | undefined;
	members?: Array<{
		status: "pending" | "approved" | "rejected";
		address: Address;
	}>;
	deployments?: Awaited<ReturnType<typeof getDeployments>>;
}> {
	const { groupAddress, groupType = "safe" } = group;
	let { members = [] } = group;
	let groupId: string | undefined = undefined;

	if (groupAddress) {
		// - first check if a group with this wallet already exists
		const existingGroup = await getGroupByWalletAddress(groupAddress);

		if (existingGroup?.id) {
			// ? if someone is trying to recreate a group maybe we should retrigger the sync events for this group
			console.log("Group already exists", existingGroup);
			return {
				groupId: existingGroup.id,
				members: existingGroup.members,
			};
		}
	}

	// - try to create the group with only the bot
	try {
		groupId = await bot.createGroup();
		if (groupId) await db.insert(schema.groups).values({ id: groupId });
	} catch (e) {
		console.log("failed to create group", groupId);
		if (e instanceof Error) console.error(e.message);
		if (e && typeof e === "object" && "exitCode" in e && "stderr" in e) {
			console.error("error code ->", (e as CliError).exitCode);
			console.error("error ->", (e as CliError).stderr.toString());
		}
	}

	if (!groupId) {
		console.log("Failed to create group");
		return { groupId: undefined };
	}

	let deployments: Awaited<ReturnType<typeof getDeployments>> | undefined =
		undefined;

	// - get the deployments for the group address
	if (groupAddress) {
		deployments = await getDeployments({
			address: groupAddress as Address | ChainAwareAddress,
			type: groupType,
		});

		// tODO: what if we know the counterfactual address? do want to add it to the group?
		// ? first thoughts are no as it could change and be annoying to update rather than just adding it once deployed
		if (deployments && deployments.length > 0) {
			// - if deployments are available we want to only have the intersection of the members and the owners in the chat
			// - so we can disregard the members that are passed and use the owners from the deployments
			const interesction = R.pipe(
				deployments,
				R.flatMap((deployment) => deployment.members),
				R.unique(),
			);

			members = interesction;

			await db.insert(schema.groupWallets).values(
				deployments.map((deployment) => ({
					type: groupType,
					groupId,
					walletAddress: deployment.address,
				})),
			);
		}
		// TODO: gather each of the deployed chains and insert the chainAwareAddress
	}

	const { pendingMembers, members: successfullyAddedMembers } =
		await addMembers(groupId, members);

	console.log(
		" createXmtpGroup - pendingMembers ->",
		pendingMembers,
		" createXmtpGroup - successfullyAddedMembers ->",
		successfullyAddedMembers,
	);

	return {
		groupId,
		...(await getGroup(groupId)),
		...(deployments && deployments.length > 0 && { deployments }),
	};
}
