import { db } from "../db";

export const getGroup = async (groupId: string) => {
	return await db.query.groups.findFirst({
		with: {
			wallets: {columns: {
        type: true,
        walletAddress: true,
      }},
			pendingMembers: { 
        columns: {},
        extras:  (fields, {sql}) =>({
          address:  sql`${fields.chainAwareAddress}`.as('address')
        })
      }
		},
		where: (fields, { eq }) => eq(fields.id, groupId),
	}) || null 
};
