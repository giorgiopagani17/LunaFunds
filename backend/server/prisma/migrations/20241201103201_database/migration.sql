-- AlterTable
ALTER TABLE `Notification` ADD COLUMN `fromGroupId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_fromGroupId_fkey` FOREIGN KEY (`fromGroupId`) REFERENCES `Groups`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
