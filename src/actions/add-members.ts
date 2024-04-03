import * as R from "remeda";
import type { Address } from "viem";
import { bot } from "../lib/xmtp/client";

export async function addMembers(
	groupId: string,
	members: Address[],
): Promise<{ pendingMembers: Address[] }> {
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
				bot.addMembers(groupId, [member]).catch(() => {
					throw member;
				}),
			),
		);

		for (const result of addPromises) {
			if (result.status === "rejected")
				pendingMembers.push(result.reason as Address);
		}
	}

	return { pendingMembers: R.unique(pendingMembers) };
}
