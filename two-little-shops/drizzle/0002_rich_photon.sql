ALTER TABLE `orders` ADD `feifei_email_status` text DEFAULT 'not_requested' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `feifei_email_attempts` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `feifei_email_error` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `feifei_email_sent_at` text;