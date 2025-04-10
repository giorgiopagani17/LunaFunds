/*
  Warnings:

  - You are about to alter the column `amount` on the `Stocks` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `Stocks` MODIFY `amount` DOUBLE NOT NULL;
