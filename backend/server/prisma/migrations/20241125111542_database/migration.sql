/*
  Warnings:

  - You are about to drop the column `paidGroup` on the `UserGroup` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `UserGroup` DROP COLUMN `paidGroup`,
    ADD COLUMN `payGroup` BOOLEAN NOT NULL DEFAULT false;
