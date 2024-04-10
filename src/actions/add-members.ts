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
	const approvedMembers: Address[] = [];
	const pendingMembers: Address[] = [];

	// - Try to add all the members to the group if this fails
	// - then we will try to add each member individually to determine
	// - which of the members failed to be added & add them to the pending members list
	// ! we have to do this because atm there is no good way to check if the user is on the network &
	// ! xmtp doesn't return a list of failed members on creation
	try {
		// tODO: there is an issue where XMTP will add members who aren't on the network
		// TODO: see https://github.com/xmtp/libxmtp/issues/613
		const addedMembers = await bot.addMembers(groupId, members as string[]);
		approvedMembers.push(...members);
		console.log(
			`Created Group with id ${groupId} -> Added members ${members} -> full response ${JSON.stringify(
				addedMembers,
				null,
				2,
			)}`,
		);
	} catch (e) {
		// ! if a adding members fails we need to try each of them individually to see which of the members failed

		// - add members in parallel (this is slower for small numbers of members but SIGNIFICANTLY faster for large numbers of members)
		const addPromises = await Promise.allSettled(
			members.map(async (member) => {
				try {
					await bot.addMembers(groupId, [member]);

					console.log("added member", member);
					approvedMembers.push(member);
				} catch (e) {
					console.log("Failed to add member", member, e);
					if (
						// @ts-ignore
						e.info.stderr
							.toString()
							.includes(
								"AddMembers(CreateCommitError(ProposalValidationError(DuplicateSignatureKey)))",
							)
					) {
						console.log("member already in group", member);
						throw new MemberAddFailure(member, "existing");
					}
					throw new MemberAddFailure(member, "pending");
				}
			}),
		);

		for (const result of addPromises) {
			if (
				result.status === "rejected" &&
				result.reason instanceof MemberAddFailure
			) {
				const { address, type } = result.reason;
				if (type === "existing") approvedMembers.push(address);
				else pendingMembers.push(address);
			}
		}
	}

	if (approvedMembers.length !== 0 || pendingMembers.length !== 0)
		await db
			.insert(schema.groupMembers)
			.values([
				...approvedMembers.map((memberAddress) => ({
					status: "approved" as const,
					groupId,
					// TODO: once XMTP supports contract wallets update this
					chainAwareAddress: `eth:${memberAddress}` satisfies ChainAwareAddress,
				})),
				...pendingMembers.map((memberAddress) => ({
					status: "pending" as const,
					groupId,
					// TODO: once XMTP supports contract wallets update this
					chainAwareAddress: `eth:${memberAddress}` satisfies ChainAwareAddress,
				})),
			])
			.catch((e) => {
				console.error(
					"Failed to insert members into database",
					e,
					JSON.stringify(
						{
							members,
							pendingMembers,
							approvedMembers,
						},
						null,
						2,
					),
				);
			});

	return { pendingMembers, members: approvedMembers };
}
