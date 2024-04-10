import { sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import {
	relations,
	type InferInsertModel,
	type InferSelectModel,
} from "drizzle-orm";
import { generateUuid7 } from "../lib/uuid";
import type { Uuidv7 } from "../lib/validators";
import type { ChainShortName } from "../lib/eth/eip3770-shortnames";
import type { Address } from "viem";

export type ChainAwareAddress =
	| `${ChainShortName}:${Address}`
	| `${string}:${Address}`;

const idField = {
	id: text("id")
		.$type<Uuidv7>()
		.$default(() => generateUuid7()),
};

/**
 * - Tables
 */

export const groups = sqliteTable("groups", {
	id: text("id"),
});

export const groupWallets = sqliteTable("group_wallets", {
	...idField,
	type: text("type", { enum: ["safe", "party"] }).notNull(),
	groupId: text("group_id").references(() => groups.id),
	walletAddress: text("wallet_address").$type<ChainAwareAddress>().notNull(),
});

export const groupMembers = sqliteTable(
	"group_members",
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

/**
 * - Relations
 */

export const groupsRelations = relations(groups, ({ many }) => ({
	wallets: many(groupWallets),
	members: many(groupMembers),
}));

export const groupWalletsRelations = relations(groupWallets, ({ one }) => ({
	group: one(groups, {
		fields: [groupWallets.groupId],
		references: [groups.id],
	}),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
	group: one(groups, {
		fields: [groupMembers.groupId],
		references: [groups.id],
	}),
}));

/**
 * - Types
 */

export type Group = InferSelectModel<typeof groups>;
export type InsertGroup = InferInsertModel<typeof groups>;

export type GroupMember = InferSelectModel<typeof groupMembers>;
export type GroupMemberStatus = InferSelectModel<typeof groupMembers>["status"];
export type InsertGroupMember = InferInsertModel<typeof groupMembers>;

export type GroupWallet = InferSelectModel<typeof groupWallets>;
export type InsertGroupWallet = InferInsertModel<typeof groupWallets>;
