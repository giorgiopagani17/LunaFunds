/*
  Warnings:

  - You are about to drop the column `deleteGroup` on the `UserGroup` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `UserGroup` DROP COLUMN `deleteGroup`,
    ADD COLUMN `isBoss` BOOLEAN NOT NULL DEFAULT false;
