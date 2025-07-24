CREATE TABLE `attendance` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`teacherId` integer NOT NULL,
	`date` text NOT NULL,
	`isPresent` integer NOT NULL,
	`createdAt` text DEFAULT '2025-07-19T10:41:10.651Z' NOT NULL,
	FOREIGN KEY (`teacherId`) REFERENCES `teacher`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `subject` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE TABLE `teacher` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`subject` text NOT NULL,
	`email` text,
	`phone` text,
	`createdAt` text DEFAULT '2025-07-19T10:41:10.651Z' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
