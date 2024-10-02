import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core"
import {
	relations,
	sql,
	type InferInsertModel,
	type InferSelectModel,
} from "drizzle-orm"
import type { ChainShortName } from "../lib/eth/eip3770-shortnames"
import type { Hex } from "viem"

export type Address = `0x${string}`
export type ChainAwareAddress =
	| `${ChainShortName}:${Address}`
	| `${string}:${Address}`

export type WalletAddress = Address | ChainAwareAddress

const adminFields = {
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.default(sql`(unixepoch() * 1000)`)
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.default(sql`(unixepoch() * 1000)`)
		.notNull(),
}

/**
 * - Tables
 */

export const groups = sqliteTable("groups", {
	id: text("id").primaryKey(),
})

export const groupWallets = sqliteTable(
	"group_wallets",
	{
		type: text("type", { enum: ["safe", "party"] }).notNull(),
		groupId: text("group_id").references(() => groups.id),
		walletAddress: text("wallet_address").$type<WalletAddress>().notNull(),
		factory: text("factory").$type<WalletAddress>(),
		factoryData: text("factory_data").$type<Hex>(),
		createdAt: adminFields.createdAt,
		updatedAt: adminFields.updatedAt,
	},
	(fields) => ({
		primaryKey: primaryKey({ columns: [fields.groupId, fields.walletAddress] }),
	}),
)

export const signers = sqliteTable(
	"signers",
	{
		groupWalletAddress: text("group_wallet_address")
			.references(() => groupWallets.walletAddress)
			.notNull(),
		address: text("address")
			.references(() => inboxIds.address)
			.$type<WalletAddress>()
			.notNull(),
		createdAt: adminFields.createdAt,
	},
	(fields) => ({
		primaryKey: primaryKey({
			columns: [fields.groupWalletAddress, fields.address],
		}),
	}),
)

export const pendingMembers = sqliteTable(
	"pending_members",
	{
		createdAt: adminFields.createdAt,
		updatedAt: adminFields.updatedAt,
		groupId: text("group_id").references(() => groups.id),
		address: text("address").$type<WalletAddress>().notNull(),
	},
	(fields) => ({
		primaryKey: primaryKey({ columns: [fields.groupId, fields.address] }),
	}),
)

export const inboxIds = sqliteTable(
	"inbox_ids",
	{
		inboxId: text("inbox_id").notNull(),
		address: text("address").$type<WalletAddress>().notNull(),
		isXmtpV3Enabled: integer("is_xmtp_v3_enabled", {
			mode: "boolean",
		}).notNull(),
		createdAt: adminFields.createdAt,
		updatedAt: adminFields.updatedAt,
	},
	(fields) => ({
		primaryKey: primaryKey({ columns: [fields.inboxId, fields.address] }),
	}),
)

/**
 * - Relations
 */

export const groupsRelations = relations(groups, ({ many }) => ({
	wallets: many(groupWallets),
	pendingMembers: many(pendingMembers),
}))

export const pendingMembersRelations = relations(
	pendingMembers,
	({ many }) => ({ inboxes: many(inboxIds) }),
)

export const groupWalletsRelations = relations(
	groupWallets,
	({ one, many }) => ({
		group: one(groups, {
			fields: [groupWallets.groupId],
			references: [groups.id],
		}),
		signers: many(signers),
	}),
)

export const signersRelations = relations(signers, ({ one }) => ({
	groupWallet: one(groupWallets, {
		fields: [signers.groupWalletAddress],
		references: [groupWallets.walletAddress],
	}),
}))

/**
 * - Types
 */

export type Group = InferSelectModel<typeof groups>
export type InsertGroup = InferInsertModel<typeof groups>

export type PendingMember = InferSelectModel<typeof pendingMembers>
export type InsertPendingMember = InferInsertModel<typeof pendingMembers>

export type GroupWallet = InferSelectModel<typeof groupWallets>
export type InsertGroupWallet = InferInsertModel<typeof groupWallets>

export type InboxId = InferSelectModel<typeof inboxIds>
export type InsertInboxId = InferInsertModel<typeof inboxIds>

export type Signer = InferSelectModel<typeof signers>
export type InsertSigner = InferInsertModel<typeof signers>
