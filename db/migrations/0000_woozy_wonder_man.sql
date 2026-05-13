CREATE TABLE `devices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`device` varchar(255) NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'offline',
	`room` varchar(255) NOT NULL DEFAULT '',
	`description` text DEFAULT ('no description'),
	`enabled` boolean DEFAULT false,
	`image` varchar(512),
	`power` int DEFAULT 0,
	`created_at` timestamp DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` timestamp DEFAULT 'CURRENT_TIMESTAMP',
	CONSTRAINT `devices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `migrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`hash` varchar(32) NOT NULL,
	`applied_at` timestamp DEFAULT 'CURRENT_TIMESTAMP',
	CONSTRAINT `migrations_id` PRIMARY KEY(`id`),
	CONSTRAINT `migrations_name_unique` UNIQUE(`name`)
);
