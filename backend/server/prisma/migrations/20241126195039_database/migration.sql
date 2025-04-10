/*
  Warnings:

  - Added the required column `lastValue` to the `Crypto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `Crypto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Crypto` ADD COLUMN `lastValue` DOUBLE NOT NULL,
    ADD COLUMN `value` DOUBLE NOT NULL;
