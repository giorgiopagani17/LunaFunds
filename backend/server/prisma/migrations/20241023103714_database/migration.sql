/*
  Warnings:

  - Added the required column `userId` to the `Transactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Budgets` DROP FOREIGN KEY `Budgets_accountId_fkey`;

-- DropForeignKey
ALTER TABLE `Budgets` DROP FOREIGN KEY `Budgets_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `Goals` DROP FOREIGN KEY `Goals_accountId_fkey`;

-- DropForeignKey
ALTER TABLE `Goals` DROP FOREIGN KEY `Goals_categoryId_fkey`;

-- AlterTable
ALTER TABLE `Budgets` MODIFY `categoryId` INTEGER NULL,
    MODIFY `accountId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Goals` MODIFY `categoryId` INTEGER NULL,
    MODIFY `accountId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Transactions` ADD COLUMN `userId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Transactions` ADD CONSTRAINT `Transactions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Budgets` ADD CONSTRAINT `Budgets_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Budgets` ADD CONSTRAINT `Budgets_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Accounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Goals` ADD CONSTRAINT `Goals_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Goals` ADD CONSTRAINT `Goals_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Accounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
