-- AlterTable
ALTER TABLE `UserGroup` ADD COLUMN `deleteGroup` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `paidGroup` BOOLEAN NOT NULL DEFAULT false;
