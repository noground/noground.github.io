CREATE TABLE `limits` (
	`key` text PRIMARY KEY NOT NULL,
	`attempts` integer NOT NULL,
	`reset` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`nickname` text NOT NULL,
	`items` text NOT NULL,
	`total` integer NOT NULL,
	`note` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	`rating` integer,
	`review` text DEFAULT '' NOT NULL,
	`request_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_request_id_unique` ON `orders` (`request_id`);--> statement-breakpoint
CREATE TABLE `overrides` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`token` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`nickname` text NOT NULL,
	`salt` text NOT NULL,
	`pin_hash` text NOT NULL,
	`role` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_nickname_unique` ON `users` (`nickname`);