import type { Address } from "viem";
import { db } from "../db";
import type { ChainAwareAddress } from "../db/schema";
import * as schema from "../db/schema";
import { bot } from "../lib/xmtp/client";

class MemberAddFailure extends Error {
	constructor(
		public address: Address,
		public type: "existing" | "pending",
	) {
		super(`Failed to add member ${address} to group chat`);
	}
}

/**
 * Add members to a group chat
 * @param {string} groupId
 * @param {Address[]} members
 * @returns {Promise<{ pendingMembers: Address[]; members: Address[] }>}
 */
export async function addMembers(
	groupId: string,
	members: Address[],
): Promise<{ pendingMembers: Address[]; members: Address[] }> {
	let existingMembers: Address[] = [];
	let pendingMembers: Address[] = [];

	// - Try to add all the members to the group if this fails
	// - then we will try to add each member individually to determine
	// - which of the members failed to be added & add them to the pending members list
	// ! we have to do this because atm there is no good way to check if the user is on the network &
	// ! xmtp doesn't return a list of failed members on creation
	try {
		const addedMembers = await bot.addMembers(groupId, members as string[]);
		console.log(`Group ID is ${groupId} -> Added members ${addedMembers}`);
	} catch (e) {
		// ! if a adding members fails we need to try each of them individually to see which of the members failed

		// - add members in parallel (this is slower for small numbers of members but SIGNIFICANTLY faster for large numbers of members)
		const addPromises = await Promise.allSettled(
			members.map((member) =>
				bot.addMembers(groupId, [member]).catch((e) => {
					if (
						e.info.stderr
							.toString()
							.includes(
								"AddMembers(CreateCommitError(ProposalValidationError(DuplicateSignatureKey)))",
							)
					) {
						console.log("member already in group", member);
						throw new MemberAddFailure(member, "existing");
					} else throw new MemberAddFailure(member, "pending");
				}),
			),
		);

		for (const result of addPromises) {
			if (result.status === "rejected" && result.reason instanceof MemberAddFailure) {
					const { address, type } = result.reason;
					if (type === "existing") existingMembers.push(address);
					else pendingMembers.push(address);
			}
		}
	}


	const successfullyAddedMembers = members.filter(
		(member) => ![pendingMembers, existingMembers].flat().includes(member as Address),
	);

	if (pendingMembers.length !== 0)
		await db.insert(schema.pendingGroupMembers).values(
			pendingMembers.map((memberAddress) => ({
				status: "pending" as const,
				groupId,
				// TODO: once XMTP supports contract wallets update this
				chainAwareAddress: `eth:${memberAddress}` satisfies ChainAwareAddress,
			})),
		);

	return { pendingMembers, members: successfullyAddedMembers };
}
