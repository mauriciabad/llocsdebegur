ALTER TABLE `feature` ADD `hasUnofficialName` boolean;--> statement-breakpoint
ALTER TABLE `feature` ADD `isOutOfTheMunicipality` boolean;--> statement-breakpoint
ALTER TABLE `feature` ADD `allowedAccess` enum('public','private','customers','permit','permissive','mixed');--> statement-breakpoint
ALTER TABLE `feature` ADD `allowedAccessNotes` text;--> statement-breakpoint
ALTER TABLE `feature_translation` ADD `allowedAccessNotes` text;