/*
  Warnings:

  - You are about to drop the column `default` on the `Groups` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Groups` DROP COLUMN `default`;

-- AlterTable
ALTER TABLE `UserGroup` ADD COLUMN `default` BOOLEAN NOT NULL DEFAULT false;
