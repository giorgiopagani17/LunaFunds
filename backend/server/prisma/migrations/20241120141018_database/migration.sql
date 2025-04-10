/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Budgets` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Budgets` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `Goals` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Goals` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Budgets` DROP FOREIGN KEY `Budgets_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `Goals` DROP FOREIGN KEY `Goals_categoryId_fkey`;

-- DropIndex
DROP INDEX `Transactions_transfer_fkey` ON `Transactions`;

-- AlterTable
ALTER TABLE `Budgets` DROP COLUMN `categoryId`,
    DROP COLUMN `image`;

-- AlterTable
ALTER TABLE `Goals` DROP COLUMN `categoryId`,
    DROP COLUMN `image`;
