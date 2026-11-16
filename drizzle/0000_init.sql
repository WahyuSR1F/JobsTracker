CREATE TABLE IF NOT EXISTS `applications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`company` text NOT NULL,
	`position` text NOT NULL,
	`location` text,
	`work_type` text,
	`source` text,
	`job_url` text,
	`salary_note` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`applied_at` integer,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_app_status` ON `applications` (`status`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_app_user` ON `applications` (`user_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `status_history` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`from_status` text,
	`to_status` text NOT NULL,
	`changed_at` integer NOT NULL,
	`note` text,
	FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_history_app` ON `status_history` (`application_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`avatar_url` text,
	`password_hash` text,
	`auth_provider` text DEFAULT 'credentials' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `users_email_unique` ON `users` (`email`);
