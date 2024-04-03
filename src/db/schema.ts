import { sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { generateUuid7 } from "../lib/uuid";
import type { Uuidv7 } from "../lib/validators";

export type ChainAwareAddress = `${string}:0x${string}`;

const idField = {
	id: text("id")
		.$type<Uuidv7>()
		.$default(() => generateUuid7()),
};

export const groups = sqliteTable("groups", {
	id: text("id"),
});

export const groupWallets = sqliteTable("group_wallets", {
	...idField,
	type: text("type", { enum: ["safe", "party"] }).notNull(),
	groupId: text("group_id").references(() => groups.id),
	walletAddress: text("wallet_address").$type<ChainAwareAddress>().notNull(),
});

export const pendingGroupMembers = sqliteTable(
	"pending_group_members",
	{
		...idField,
		groupId: text("group_id").references(() => groups.id),
		chainAwareAddress: text("address").$type<ChainAwareAddress>().notNull(),
		status: text("status", {
			enum: ["pending", "approved", "rejected"],
		}).notNull(),
	},
	(fields) => ({
		uniqueMember: unique().on(fields.chainAwareAddress, fields.groupId),
	}),
);
