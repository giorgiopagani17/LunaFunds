/*
  Warnings:

  - You are about to drop the column `isBankTransfer` on the `Transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Transactions` DROP COLUMN `isBankTransfer`,
    ADD COLUMN `bankTransfer` INTEGER NULL;
