-- CreateTable
CREATE TABLE `GroupTransactions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `groupId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL DEFAULT 'Transaction',
    `amount` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GroupTransactions` ADD CONSTRAINT `GroupTransactions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GroupTransactions` ADD CONSTRAINT `GroupTransactions_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Groups`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
