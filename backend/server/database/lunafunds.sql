-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Creato il: Dic 06, 2024 alle 09:56
-- Versione del server: 5.7.39
-- Versione PHP: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `LunaFunds`
--

-- --------------------------------------------------------

--
-- Struttura della tabella `Accounts`
--

CREATE TABLE `Accounts` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `default` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `Budgets`
--

CREATE TABLE `Budgets` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `accountId` int(11) DEFAULT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MyBudget',
  `amount` double NOT NULL,
  `timeline` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `Categories`
--

CREATE TABLE `Categories` (
  `id` int(11) NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` int(11) NOT NULL,
  `image` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `Crypto`
--

CREATE TABLE `Crypto` (
  `id` int(11) NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `image` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastValue` double NOT NULL DEFAULT '0',
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '$',
  `actualValue` double NOT NULL,
  `last1Value` double NOT NULL DEFAULT '0',
  `last2Value` double NOT NULL DEFAULT '0',
  `last3Value` double NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dump dei dati per la tabella `Crypto`
--

INSERT INTO `Crypto` (`id`, `name`, `createdAt`, `updatedAt`, `image`, `lastValue`, `currency`, `actualValue`, `last1Value`, `last2Value`, `last3Value`) VALUES
(31, 'Bitcoin', '2024-11-27 10:58:00.739', '2024-11-27 11:07:47.038', 'bitcoin.jpg', 89210, '$', 93671, 0, 0, 0),
(32, 'Ethereum', '2024-11-27 10:58:00.742', '2024-11-27 11:07:47.040', 'ethereum.jpg', 3294.76, '$', 3453.03, 0, 0, 0),
(33, 'Tether', '2024-11-27 10:58:00.743', '2024-11-27 11:07:47.042', 'tether.jpg', 0.951207, '$', 0.999667, 0, 0, 0),
(34, 'Solana', '2024-11-27 10:58:00.744', '2024-11-27 11:07:47.044', 'solana.jpg', 224.47, '$', 235.72, 0, 0, 0),
(35, 'BNB', '2024-11-27 10:58:00.744', '2024-11-27 11:07:47.047', 'bnb.jpg', 593.87, '$', 623.93, 0, 0, 0),
(36, 'XRP', '2024-11-27 10:58:00.745', '2024-11-27 11:07:47.050', 'xrp.jpg', 1.38, '$', 1.44, 0, 0, 0),
(37, 'Dogecoin', '2024-11-27 10:58:00.746', '2024-11-27 11:07:47.052', 'dogecoin.jpg', 0.376786, '$', 0.394257, 0, 0, 0),
(38, 'USDC', '2024-11-27 10:58:00.746', '2024-11-27 11:07:47.053', 'usdc.jpg', 0.951137, '$', 0.999416, 0, 0, 0),
(39, 'Cardano', '2024-11-27 10:58:00.747', '2024-11-27 11:07:47.055', 'cardano.jpg', 0.964228, '$', 1.001, 0, 0, 0),
(40, 'Lido Staked Ether', '2024-11-27 10:58:00.747', '2024-11-27 11:07:47.057', 'lidostakedether.jpg', 3300.32, '$', 3450.02, 0, 0, 0),
(41, 'Bitcoin', '2024-11-27 10:58:00.883', '2024-12-06 09:54:29.651', 'bitcoin.jpg', 95868, '€', 92985, 97668, 97246, 97861),
(42, 'Ethereum', '2024-11-27 10:58:00.884', '2024-12-06 09:54:29.652', 'ethereum.jpg', 3705.4, '€', 3669.53, 3707.01, 3711.39, 3733.94),
(43, 'Tether', '2024-11-27 10:58:00.885', '2024-12-06 09:54:29.653', 'tether.jpg', 0.946668, '€', 0.94643, 0.945059, 0.946049, 0.950763),
(44, 'Solana', '2024-11-27 10:58:00.885', '2024-12-06 09:54:29.654', 'solana.jpg', 226.83, '€', 223.66, 227.41, 227.56, 230.19),
(45, 'BNB', '2024-11-27 10:58:00.886', '2024-12-06 09:54:29.655', 'bnb.jpg', 692.99, '€', 680.13, 688.06, 690.21, 694.19),
(46, 'XRP', '2024-11-27 10:58:00.887', '2024-12-06 09:54:29.657', 'xrp.jpg', 2.28, '€', 2.16, 2.2, 2.24, 2.26),
(47, 'Dogecoin', '2024-11-27 10:58:00.887', '2024-12-06 09:54:29.658', 'dogecoin.jpg', 0.419961, '€', 0.406556, 0.424072, 0.427002, 0.427342),
(48, 'USDC', '2024-11-27 10:58:00.888', '2024-12-06 09:54:29.659', 'usdc.jpg', 0.946398, '€', 0.945556, 0.944439, 0.945849, 0.949496),
(49, 'Cardano', '2024-11-27 10:58:00.889', '2024-12-06 09:54:29.661', 'cardano.jpg', 1.17, '€', 1.1, 1.14, 1.15, 1.16),
(50, 'Lido Staked Ether', '2024-11-27 10:58:00.889', '2024-12-06 09:54:29.668', 'lidostakedether.jpg', 3702, '€', 3667.32, 3701.48, 3713.44, 3732.39),
(51, 'Bitcoin', '2024-11-27 10:58:00.894', '2024-12-03 15:21:33.659', 'bitcoin.jpg', 74390, '£', 75878, 74246, 89152, 0),
(52, 'Ethereum', '2024-11-27 10:58:00.895', '2024-12-03 15:21:33.669', 'ethereum.jpg', 2811.41, '£', 2844.21, 2737.22, 3291.07, 0),
(53, 'Tether', '2024-11-27 10:58:00.896', '2024-12-03 15:21:33.676', 'tether.jpg', 0.790246, '£', 0.792772, 0.792429, 0.951175, 0),
(54, 'Solana', '2024-11-27 10:58:00.896', '2024-12-03 15:21:33.677', 'solana.jpg', 173.94, '£', 178.06, 186.83, 224.25, 0),
(55, 'BNB', '2024-11-27 10:58:00.897', '2024-12-03 15:21:33.683', 'bnb.jpg', 503.02, '£', 509.52, 494.5, 593.96, 0),
(56, 'XRP', '2024-11-27 10:58:00.897', '2024-12-03 15:21:33.685', 'xrp.jpg', 1.96, '£', 1.98, 1.14, 1.37, 0),
(57, 'Dogecoin', '2024-11-27 10:58:00.898', '2024-12-03 15:21:33.686', 'dogecoin.jpg', 0.316296, '£', 0.32321, 0.312423, 0.376022, 0),
(58, 'USDC', '2024-11-27 10:58:00.899', '2024-12-03 15:21:33.687', 'usdc.jpg', 0.790604, '£', 0.792028, 0.792044, 0.950888, 0),
(59, 'Cardano', '2024-11-27 10:58:00.899', '2024-12-03 15:21:33.689', 'cardano.jpg', 0.950259, '£', 0.952009, 0.792944, 0.9596, 0),
(60, 'Lido Staked Ether', '2024-11-27 10:58:00.900', '2024-12-03 15:21:33.690', 'lidostakedether.jpg', 2813.35, '£', 2840.49, 2733.36, 3287.65, 0);

-- --------------------------------------------------------

--
-- Struttura della tabella `Goals`
--

CREATE TABLE `Goals` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `accountId` int(11) DEFAULT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MyGoal',
  `amount` double NOT NULL,
  `timeline` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `Groups`
--

CREATE TABLE `Groups` (
  `id` int(11) NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '€'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dump dei dati per la tabella `Groups`
--

INSERT INTO `Groups` (`id`, `name`, `createdAt`, `updatedAt`, `currency`) VALUES
(12, '345345', '2024-12-05 16:14:20.240', '2024-12-05 16:14:20.240', '€');

-- --------------------------------------------------------

--
-- Struttura della tabella `GroupTransactions`
--

CREATE TABLE `GroupTransactions` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `groupId` int(11) NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Transaction',
  `amount` double NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `transactionId` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `Notifications`
--

CREATE TABLE `Notifications` (
  `id` int(11) NOT NULL,
  `toUserId` int(11) NOT NULL,
  `message` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `read` tinyint(1) NOT NULL DEFAULT '0',
  `fromUserId` int(11) DEFAULT NULL,
  `fromGroupId` int(11) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `Stocks`
--

CREATE TABLE `Stocks` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `cryptoId` int(11) NOT NULL,
  `amount` double NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `valueWhenBought` double NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `Transactions`
--

CREATE TABLE `Transactions` (
  `id` int(11) NOT NULL,
  `categoryId` int(11) NOT NULL,
  `amount` double NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Transaction',
  `accountId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `transfer` int(11) DEFAULT NULL,
  `bankTransfer` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `UserGroup`
--

CREATE TABLE `UserGroup` (
  `userId` int(11) NOT NULL,
  `groupId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `color` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#000000',
  `isBoss` tinyint(1) NOT NULL DEFAULT '0',
  `payGroup` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `Users`
--

CREATE TABLE `Users` (
  `id` int(11) NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '€',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `iban` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'IT00A0000000000000000000000'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dump dei dati per la tabella `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('0927536e-575a-4568-a43c-cb9e9d1b0ca2', '64f1a3de77ccd316860fbc7f751a6bbe00b584bcce82c0f7916a968b50312c89', '2024-12-05 11:50:37.019', '20241205115036_database', NULL, NULL, '2024-12-05 11:50:36.987', 1);

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `Accounts`
--
ALTER TABLE `Accounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Accounts_userId_fkey` (`userId`);

--
-- Indici per le tabelle `Budgets`
--
ALTER TABLE `Budgets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Budgets_userId_fkey` (`userId`),
  ADD KEY `Budgets_accountId_fkey` (`accountId`);

--
-- Indici per le tabelle `Categories`
--
ALTER TABLE `Categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Categories_userId_fkey` (`userId`);

--
-- Indici per le tabelle `Crypto`
--
ALTER TABLE `Crypto`
  ADD PRIMARY KEY (`id`);

--
-- Indici per le tabelle `Goals`
--
ALTER TABLE `Goals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Goals_userId_fkey` (`userId`),
  ADD KEY `Goals_accountId_fkey` (`accountId`);

--
-- Indici per le tabelle `Groups`
--
ALTER TABLE `Groups`
  ADD PRIMARY KEY (`id`);

--
-- Indici per le tabelle `GroupTransactions`
--
ALTER TABLE `GroupTransactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `GroupTransactions_userId_fkey` (`userId`),
  ADD KEY `GroupTransactions_groupId_fkey` (`groupId`);

--
-- Indici per le tabelle `Notifications`
--
ALTER TABLE `Notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Notifications_toUserId_fkey` (`toUserId`),
  ADD KEY `Notifications_fromGroupId_fkey` (`fromGroupId`),
  ADD KEY `Notifications_fromUserId_fkey` (`fromUserId`);

--
-- Indici per le tabelle `Stocks`
--
ALTER TABLE `Stocks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Stocks_userId_fkey` (`userId`),
  ADD KEY `Stocks_cryptoId_fkey` (`cryptoId`);

--
-- Indici per le tabelle `Transactions`
--
ALTER TABLE `Transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Transactions_accountId_fkey` (`accountId`),
  ADD KEY `Transactions_categoryId_fkey` (`categoryId`),
  ADD KEY `Transactions_userId_fkey` (`userId`);

--
-- Indici per le tabelle `UserGroup`
--
ALTER TABLE `UserGroup`
  ADD PRIMARY KEY (`userId`,`groupId`),
  ADD KEY `UserGroup_groupId_fkey` (`groupId`);

--
-- Indici per le tabelle `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Users_email_key` (`email`);

--
-- Indici per le tabelle `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `Accounts`
--
ALTER TABLE `Accounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT per la tabella `Budgets`
--
ALTER TABLE `Budgets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT per la tabella `Categories`
--
ALTER TABLE `Categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT per la tabella `Crypto`
--
ALTER TABLE `Crypto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT per la tabella `Goals`
--
ALTER TABLE `Goals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT per la tabella `Groups`
--
ALTER TABLE `Groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT per la tabella `GroupTransactions`
--
ALTER TABLE `GroupTransactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT per la tabella `Notifications`
--
ALTER TABLE `Notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT per la tabella `Stocks`
--
ALTER TABLE `Stocks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT per la tabella `Transactions`
--
ALTER TABLE `Transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=239;

--
-- AUTO_INCREMENT per la tabella `Users`
--
ALTER TABLE `Users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `Accounts`
--
ALTER TABLE `Accounts`
  ADD CONSTRAINT `Accounts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON UPDATE CASCADE;

--
-- Limiti per la tabella `Budgets`
--
ALTER TABLE `Budgets`
  ADD CONSTRAINT `Budgets_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Accounts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Budgets_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON UPDATE CASCADE;

--
-- Limiti per la tabella `Categories`
--
ALTER TABLE `Categories`
  ADD CONSTRAINT `Categories_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON UPDATE CASCADE;

--
-- Limiti per la tabella `Goals`
--
ALTER TABLE `Goals`
  ADD CONSTRAINT `Goals_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Accounts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Goals_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON UPDATE CASCADE;

--
-- Limiti per la tabella `GroupTransactions`
--
ALTER TABLE `GroupTransactions`
  ADD CONSTRAINT `GroupTransactions_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Groups` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `GroupTransactions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON UPDATE CASCADE;

--
-- Limiti per la tabella `Notifications`
--
ALTER TABLE `Notifications`
  ADD CONSTRAINT `Notifications_fromGroupId_fkey` FOREIGN KEY (`fromGroupId`) REFERENCES `Groups` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Notifications_fromUserId_fkey` FOREIGN KEY (`fromUserId`) REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Notifications_toUserId_fkey` FOREIGN KEY (`toUserId`) REFERENCES `Users` (`id`) ON UPDATE CASCADE;

--
-- Limiti per la tabella `Stocks`
--
ALTER TABLE `Stocks`
  ADD CONSTRAINT `Stocks_cryptoId_fkey` FOREIGN KEY (`cryptoId`) REFERENCES `Crypto` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Stocks_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON UPDATE CASCADE;

--
-- Limiti per la tabella `Transactions`
--
ALTER TABLE `Transactions`
  ADD CONSTRAINT `Transactions_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Accounts` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Transactions_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Categories` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Transactions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON UPDATE CASCADE;

--
-- Limiti per la tabella `UserGroup`
--
ALTER TABLE `UserGroup`
  ADD CONSTRAINT `UserGroup_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Groups` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `UserGroup_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
