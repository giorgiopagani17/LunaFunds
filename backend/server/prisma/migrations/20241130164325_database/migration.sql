-- DropForeignKey
ALTER TABLE `Notification` DROP FOREIGN KEY `Notification_fromUserId_fkey`;

-- AlterTable
ALTER TABLE `Notification` MODIFY `fromUserId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_fromUserId_fkey` FOREIGN KEY (`fromUserId`) REFERENCES `Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
