CREATE TABLE `group_wallets` (
	`id` text,
	`type` text NOT NULL,
	`group_id` text,
	`wallet_address` text NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `groups` (
	`id` text
);
--> statement-breakpoint
CREATE TABLE `pending_group_members` (
	`id` text,
	`group_id` text,
	`address` text NOT NULL,
	`status` text NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pending_group_members_address_group_id_unique` ON `pending_group_members` (`address`,`group_id`);