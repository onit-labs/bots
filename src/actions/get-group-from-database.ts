import { db } from "../db";

export const getGroupFromDatabase = async (groupId: string) => {
	return await db.query.groups.findFirst({
		with: {
			wallets: { columns: { type: true, walletAddress: true } },
			pendingMembers: { with: { inboxes: true } },
		},
		where: (fields, { eq }) => eq(fields.id, groupId),
	});
};
