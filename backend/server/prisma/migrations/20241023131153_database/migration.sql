-- AlterTable
ALTER TABLE `Transactions` ADD COLUMN `transfer` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Transactions` ADD CONSTRAINT `Transactions_transfer_fkey` FOREIGN KEY (`transfer`) REFERENCES `Transactions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
