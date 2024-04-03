import type { Address } from "viem";
import { bot } from "../lib/xmtp/client";
import { db } from "../db";
import * as schema from "../db/schema";
import type { ChainAwareAddress } from "../db/schema";
import { t, type Static } from "elysia";
import { AddressLiteral, ChainAwareAddressLiteral } from "../lib/validators";
import { getDeployments } from "./get-deployments";

export const createXmtpGroupValidator = t.Object({
	groupAddress: t.Union(
		[AddressLiteral, ChainAwareAddressLiteral],
		// , {error: "groupAddress must be an Address or ChainAwareAddress"}
	),
	groupType: t.Union(
		[t.Literal("safe"), t.Literal("party")],
		// , {error: "groupType must be either 'safe' or 'party'"}
	),
});

/**
 * Create a group on XMTP and add the members to the group
 * The `groupAddress` should be a multisig address. The signers will then all be added to the group chat
 * and a job to track the members of the group chat will be created to sync the members of the group chat with the signers of the multisig
 *
 * @param {Object} group
 * @param {Address[]} [group.members]
 * @param {Address | ChainAwareAddress} group.groupAddress  If a ChainAwareAddress is provided the wallet will be added to the group
 *                                                          If an Address is provided all supported chains will be checked for a wallet deployment
 *                                                          and each wallet will be added to the group
 * @returns {Promise<{ groupId: string | undefined }>}
 */
export async function createXmtpGroup({
	groupAddress,
	groupType,
}: Static<typeof createXmtpGroupValidator>): Promise<
	| string
	| {
			groupId: string | undefined;
	  }
> {
	let groupId: string | undefined = undefined;
	let pendingMembers: Address[] = [];

	const deployments = await getDeployments({
		address: groupAddress as Address | ChainAwareAddress,
		type: groupType,
	});

	return JSON.stringify(deployments, null, 4);

	// // - first try to create the group with only the bot
	// try {
	// 	groupId = await bot.createGroup();
	// 	if (groupId) {
	// 		await db.transaction(async (tx) => {
	// 			await tx.insert(schema.groups).values({ id: groupId });
	// 			if (groupAddress.includes(":")) {
	// 				await tx.insert(schema.groupWallets).values({
	// 					type: groupType,
	// 					groupId,
	// 					walletAddress: groupAddress as ChainAwareAddress,
	// 				});
	// 			}
	// 			// TODO: gather each of the deployed chains and insert the chainAwareAddress
	// 		});
	// 	}
	// } catch (e) {
	// 	console.log("failed to create group", groupId, members);
	// 	console.error("error code ->", (e as any).exitCode);
	// 	console.error("error ->", (e as any).stderr.toString());
	// } finally {
	// 	if (!groupId) {
	// 		console.log("Failed to create group");
	// 		return { groupId: undefined };
	// 	}
	// }

	// // - Try to add all the members to the group if this fails
	// // - then we will try to add each member individually to determine
	// // - which of the members failed to be added & add them to the pending members list
	// try {
	// 	const addedMembers = await bot.addMembers(groupId, members);
	// 	console.log(`Group ID is ${groupId} -> Added members ${addedMembers}`);
	// } catch (e) {
	// 	// - if a adding members fails we need to try each of them individually to see which of the members failed
	// 	for await (const member of members) {
	// 		console.log(`adding -> ${member}`);
	// 		await bot.addMembers(groupId, [member]).catch(() => {
	// 			console.log(`failed to add -> ${member}`);
	// 			pendingMembers.push(member as Address);
	// 		});
	// 	}
	// }

	// console.log("Pending members -> ", pendingMembers);

	// if (pendingMembers.length !== 0)
	// 	await db.insert(schema.pendingGroupMembers).values(
	// 		pendingMembers.map((memberAddress) => ({
	// 			status: "pending" as const,
	// 			groupId,
	// 			// TODO: once XMTP supports contract wallets update this
	// 			chainAwareAddress: `eth:${memberAddress}` satisfies ChainAwareAddress,
	// 		})),
	// 	);

	// return { groupId };
}
