-- AlterTable
ALTER TABLE `Groups` ADD COLUMN `currency` VARCHAR(191) NOT NULL DEFAULT '€';

-- AlterTable
ALTER TABLE `Users` MODIFY `currency` VARCHAR(191) NOT NULL DEFAULT '€';
