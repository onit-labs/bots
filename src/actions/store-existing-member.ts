import * as R from "remeda";
import { db } from "@/db";
import * as schema from "@/db/schema";
import type { Address, WalletAddress } from "@/db/schema";
import { inArray, sql } from "drizzle-orm";
import { getInboxes } from "./get-inboxes";
import type { NapiGroupMember } from "@xmtp/mls-client";

function isXmtpInbox(
	input: WalletAddress | NapiGroupMember,
): input is NapiGroupMember {
	return typeof input !== "string";
}

export async function storeExistingMembers(
	groups: Array<{
		groupId: string;
		members: Array<NapiGroupMember>;
	}>,
): Promise<void>;
export async function storeExistingMembers(
	groups: Array<{
		groupId: string;
		members: Array<NapiGroupMember>;
	}>,
): Promise<void>;
export async function storeExistingMembers(
	groups: Array<{
		groupId: string;
		members: Array<WalletAddress> | Array<NapiGroupMember>;
	}>,
): Promise<void> {
	const [inboxes, addresses] = R.pipe(
		groups,
		R.partition(({ members }) => isXmtpInbox(members[0])),
	) as [
		Array<{
			groupId: string;
			members: Array<NapiGroupMember>;
		}>,
		Array<{
			groupId: string;
			members: Array<WalletAddress>;
		}>,
	];

	const inboxesToStore = addresses.length
		? await getInboxes(addresses.flatMap(({ members }) => members))
		: inboxes.flatMap(({ members }) =>
				members.flatMap((member) =>
					member.accountAddresses.map((address) => ({
						inboxId: member.inboxId,
						isXmtpV3Enabled: true,
						address: address as Address,
					})),
				),
			);

	// - store all inboxes regardless of if they are available or not
	await db.insert(schema.inboxIds).values(inboxesToStore).onConflictDoNothing();

	// - if successful, remove pending members from database if they exist
	await db.delete(schema.pendingMembers).where(
		inArray(
			sql`${schema.pendingMembers.groupId}-${schema.pendingMembers.address}`,
			groups.flatMap(({ members, groupId }) =>
				members.map((member) => `${groupId}-${member}`),
			),
		),
	);
}
