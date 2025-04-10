/*
  Warnings:

  - Added the required column `valueWhenBought` to the `Stocks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Stocks` ADD COLUMN `valueWhenBought` DOUBLE NOT NULL;
