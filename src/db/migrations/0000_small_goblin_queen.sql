CREATE TABLE `group_wallets` (
	`type` text NOT NULL,
	`group_id` text,
	`wallet_address` text COLLATE NOCASE NOT NULL,
	`factory` text,
	`factory_data` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`group_id`, `wallet_address`),
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `groups` (
	`id` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `inbox_ids` (
	`inbox_id` text NOT NULL,
	`address` text COLLATE NOCASE NOT NULL,
	`is_xmtp_v3_enabled` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`address`, `inbox_id`)
);
--> statement-breakpoint
CREATE TABLE `pending_members` (
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`group_id` text,
	`inbox_id` text NOT NULL,
	`address` text COLLATE NOCASE NOT NULL,
	PRIMARY KEY(`group_id`, `inbox_id`),
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `signers` (
	`group_wallet_address` text COLLATE NOCASE NOT NULL,
	`address` text COLLATE NOCASE NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`address`, `group_wallet_address`),
	FOREIGN KEY (`group_wallet_address`) REFERENCES `group_wallets`(`wallet_address`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`address`) REFERENCES `inbox_ids`(`address`) ON UPDATE no action ON DELETE no action
);
