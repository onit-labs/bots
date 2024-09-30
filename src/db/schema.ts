import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import {
	relations,
	type InferInsertModel,
	type InferSelectModel,
} from "drizzle-orm";
import type { ChainShortName } from "../lib/eth/eip3770-shortnames";
import type { Address } from "viem";
import type { ValueOf } from "type-fest";

export type ChainAwareAddress =
	| `${ChainShortName}:${Address}`
	| `${string}:${Address}`;

export type WalletAddress = Address | ChainAwareAddress;

const idField = {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
};

const GroupMemberStatus = {
	PENDING: "PENDING",
	APPROVED: "APPROVED",
	REJECTED: "REJECTED",
} as const;

const GroupMemberStatuses = [
	"PENDING",
	"APPROVED",
	"REJECTED",
] as const satisfies Array<ValueOf<typeof GroupMemberStatus>>;

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
	walletAddress: text("wallet_address").$type<WalletAddress>().notNull(),
});

export const groupMembers = sqliteTable(
	"group_members",
	{
		...idField,
		groupId: text("group_id").references(() => groups.id),
		inboxId: text("inbox_id").notNull(),
		status: text("status", { enum: GroupMemberStatuses }).notNull(),
	},
	(fields) => ({
		uniqueMember: unique().on(fields.inboxId, fields.groupId),
	}),
);

export const inboxIds = sqliteTable(
	"inbox_ids",
	{
		inboxId: text("inbox_id").notNull(),
		address: text("address").$type<WalletAddress>().notNull(),
	},
	(fields) => ({
		uniqueInbox: unique().on(fields.inboxId, fields.address),
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

export type InboxId = InferSelectModel<typeof inboxIds>;
export type InsertInboxId = InferInsertModel<typeof inboxIds>;
