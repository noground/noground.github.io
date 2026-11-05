ALTER TABLE `orders` ADD `email_status` text DEFAULT 'not_requested' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `email_attempts` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `email_error` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `email_sent_at` text;