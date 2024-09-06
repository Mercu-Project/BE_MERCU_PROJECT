/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE TABLE "accounts" (
  "id" int NOT NULL AUTO_INCREMENT,
  "username" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "password" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "role_id" int NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  "faculty_id" int DEFAULT NULL,
  PRIMARY KEY ("id"),
  KEY "role_id" ("role_id"),
  KEY "faculty_id" ("faculty_id"),
  CONSTRAINT "accounts_ibfk_1" FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON DELETE CASCADE,
  CONSTRAINT "accounts_ibfk_2" FOREIGN KEY ("faculty_id") REFERENCES "faculties" ("id") ON DELETE SET NULL
);

CREATE TABLE "admins" (
  "id" int NOT NULL AUTO_INCREMENT,
  "full_name" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "account_id" int NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  KEY "account_id" ("account_id"),
  CONSTRAINT "admins_ibfk_1" FOREIGN KEY ("account_id") REFERENCES "accounts" ("id") ON DELETE CASCADE
);

CREATE TABLE "canteen_preorder_detail" (
  "id" int NOT NULL AUTO_INCREMENT,
  "preorder_id" int NOT NULL,
  "order_type" varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  "qty" int NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  KEY "preorder_id" ("preorder_id"),
  CONSTRAINT "canteen_preorder_detail_ibfk_1" FOREIGN KEY ("preorder_id") REFERENCES "canteen_preorders" ("id") ON DELETE CASCADE
);

CREATE TABLE "canteen_preorder_status_history" (
  "id" int NOT NULL AUTO_INCREMENT,
  "preorder_id" int DEFAULT NULL,
  "status" varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  "changed_at" datetime DEFAULT CURRENT_TIMESTAMP,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  "reject_reason" text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  "approver_id" int NOT NULL,
  PRIMARY KEY ("id"),
  KEY "approver_id" ("approver_id"),
  KEY "preorder_id" ("preorder_id"),
  CONSTRAINT "canteen_preorder_status_history_ibfk_1" FOREIGN KEY ("approver_id") REFERENCES "accounts" ("id") ON DELETE CASCADE,
  CONSTRAINT "canteen_preorder_status_history_ibfk_2" FOREIGN KEY ("preorder_id") REFERENCES "canteen_preorders" ("id") ON DELETE CASCADE
);

CREATE TABLE "canteen_preorders" (
  "id" int NOT NULL AUTO_INCREMENT,
  "requester_id" int DEFAULT NULL,
  "event_date" date NOT NULL,
  "request_count" int NOT NULL DEFAULT '1',
  "status" varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  "number" varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  "faculty_id" int DEFAULT NULL,
  PRIMARY KEY ("id"),
  KEY "requester_id" ("requester_id"),
  KEY "faculty_id" ("faculty_id"),
  CONSTRAINT "canteen_preorders_ibfk_1" FOREIGN KEY ("requester_id") REFERENCES "accounts" ("id") ON DELETE SET NULL,
  CONSTRAINT "canteen_preorders_ibfk_2" FOREIGN KEY ("faculty_id") REFERENCES "faculties" ("id") ON DELETE SET NULL
);

CREATE TABLE "canteen_scans" (
  "id" int NOT NULL AUTO_INCREMENT,
  "account_id" int NOT NULL,
  "scanned_at" time DEFAULT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  KEY "account_id" ("account_id"),
  CONSTRAINT "canteen_scans_ibfk_1" FOREIGN KEY ("account_id") REFERENCES "accounts" ("id") ON DELETE CASCADE
);

CREATE TABLE "faculties" (
  "id" int NOT NULL AUTO_INCREMENT,
  "name" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE TABLE "roles" (
  "id" int NOT NULL AUTO_INCREMENT,
  "name" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE TABLE "time_break_sessions" (
  "id" int NOT NULL AUTO_INCREMENT,
  "session_name" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "session_open" time NOT NULL,
  "session_close" time NOT NULL,
  "status" enum('0','1') COLLATE utf8mb4_unicode_ci DEFAULT '1',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE TABLE "users" (
  "id" int NOT NULL AUTO_INCREMENT,
  "full_name" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "status" enum('0','1') COLLATE utf8mb4_unicode_ci DEFAULT '1',
  "account_id" int NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  KEY "account_id" ("account_id"),
  CONSTRAINT "users_ibfk_1" FOREIGN KEY ("account_id") REFERENCES "accounts" ("id") ON DELETE CASCADE
);

INSERT INTO `accounts` (`id`, `username`, `password`, `role_id`, `created_at`, `updated_at`, `faculty_id`) VALUES
(2, 'admin1', '$2a$12$6wKpWsvOP8V2/cDifYcAvuf1cSisrcMPbV4HxYFQ9ogyRo3GCEMQG', 1, '2024-07-17 13:08:54', '2024-09-01 09:17:36', 1);
INSERT INTO `accounts` (`id`, `username`, `password`, `role_id`, `created_at`, `updated_at`, `faculty_id`) VALUES
(3, '12345678', '$2a$12$guUxFrt.AV0hlCt.6uEFbOlORkJRCF8.fbk66O8wwGpdXKwpSJiHe', 2, '2024-07-17 14:24:33', '2024-09-01 09:17:36', 1);
INSERT INTO `accounts` (`id`, `username`, `password`, `role_id`, `created_at`, `updated_at`, `faculty_id`) VALUES
(4, '54321', '$2a$12$DHGQqzQiN/av4izxvejJ6OGf0yTjnMShtapLTdt6S0nigJY6H1cTu', 2, '2024-07-17 14:34:17', '2024-09-01 09:17:36', 1);
INSERT INTO `accounts` (`id`, `username`, `password`, `role_id`, `created_at`, `updated_at`, `faculty_id`) VALUES
(5, '41521010176', '$2a$12$B7jfXe1mR3k46wgAlOrbxOTx3.IaTQv2RnpF1MnwAk/rHFQ2WQKZO', 2, '2024-07-17 14:54:04', '2024-09-01 09:17:36', 1),
(6, '09000993', '$2a$12$/mnQK75zZZtbsm.5132LZOMaiITcHLUSc6e7QMCS/aYUKawsB1VMa', 2, '2024-07-18 07:29:50', '2024-09-01 09:17:36', 1),
(7, '111133333', '$2a$12$44OYRq2E9t5O8V7YAG/Mfec0YKxaa.TxyfTMhSNswcnwTP91dZdAK', 2, '2024-07-18 07:36:25', '2024-09-01 09:17:36', 1),
(8, '114690444', '$2a$12$EP.lPDuJQV3iP7yOZ7cwC.iseYY/SEolOeJ.rCIQ4bEZIi0vlzja2', 2, '2024-07-18 07:48:05', '2024-09-01 09:17:36', 1),
(9, '123321', '$2a$12$I1LAykHlBQjCNecxzTgwDuA0hZ9WaZHibF5KpuimpVF0KAW9xiys2', 2, '2024-07-18 13:13:48', '2024-09-01 09:17:36', 1),
(10, '098098', '$2a$12$mz18GlQEe9HO7GI7hzbLo.8I.qJUA48Jmrz225nZ8mnnGSDIwGi..', 2, '2024-07-18 13:14:03', '2024-09-01 09:17:36', 1),
(11, '1006', '$2a$12$zRBh3FWchf0Bje4mVULKseKHSdgBaIDj4PJMtkrOuAMagblQUwaBC', 2, '2024-07-18 14:49:07', '2024-09-01 09:17:36', 1),
(12, '865865', '$2a$12$b4i06MlromrUy4uTiABw/uQx/jA8CJg1KHp5v8AkaUrWE.Nyu2DUa', 2, '2024-07-18 14:54:22', '2024-09-01 09:17:36', 1),
(13, '76567', '$2a$12$PGOa2Nuf2R1k35H/UDd0Vuk6kpMuIOab4QidWb/6gL2SaXp2Jz5.C', 2, '2024-07-18 15:54:04', '2024-09-01 09:17:36', 1),
(14, '41520110044', '$2a$12$eRI13gQd55PSgYlBo55hBenxH83esM1OTyVj0K2UiA8fWiwiNiZLe', 2, '2024-07-18 16:30:19', '2024-09-01 09:17:37', 1),
(15, '08082002', '$2a$12$Y1otnkuh5EkplrO2PmPw6.jfTZ55qwzikOvTpPSy09dn5BRvZE.1G', 2, '2024-07-23 07:05:27', '2024-09-01 09:17:37', 1),
(16, '415200101400', '$2a$12$sKwds6oPQ6Dvxdumgs5jcezRnhWfow6qbUKaDyBkPLo93OGC5zZsi', 2, '2024-07-23 07:59:17', '2024-09-01 09:17:37', 1),
(17, '41520010023', '$2a$12$khIIaky7n5awQNQj.ZujkuCTayN81lTXDaNorphOSlNn0DNhtvXXO', 2, '2024-08-01 13:05:29', '2024-09-01 09:17:37', 1),
(18, '123', '$2a$12$SbPYGzqnf/Y4YIOtWWScRu4KZtReAA.7tUpjhX0OZ.0.OeZP9DKVW', 2, '2024-08-02 02:46:34', '2024-09-01 09:17:37', 1),
(19, '41521010037', '$2a$12$Mu069kRQLiieQJTf2/Nxj.qmBR86eEyaKsB4f4ge.1.TZiRqipFMi', 2, '2024-08-02 03:51:08', '2024-09-01 09:17:37', 1),
(20, '12345', '$2a$12$sQ/Zy6oUqTHWcbmaNfiSYeBtXABPHl2O5CR1LIsyH5N1K8qMxP2Oe', 2, '2024-08-13 04:15:45', '2024-09-01 09:17:37', 1),
(21, 'tu1', '$2a$12$XI3Gmk.BPdYW7PXiFqflPe7F5ifBYKAInqSkPcSsFhwHhw76kBP4a', 5, '2024-09-01 11:53:32', '2024-09-01 11:53:32', 1),
(22, 'dekan1', '$2a$12$8xi/ffNbGajNxUg4TgpSOu8gg9N0.QwKhHBrbxRsudcgls86I41.6', 3, '2024-09-01 14:33:12', '2024-09-01 14:33:12', 1);

INSERT INTO `admins` (`id`, `full_name`, `account_id`, `created_at`, `updated_at`) VALUES
(1, 'Admin 1', 2, '2024-07-17 13:08:54', '2024-07-17 13:08:54');
INSERT INTO `admins` (`id`, `full_name`, `account_id`, `created_at`, `updated_at`) VALUES
(2, 'TU 1', 21, '2024-09-01 11:53:32', '2024-09-01 11:53:32');
INSERT INTO `admins` (`id`, `full_name`, `account_id`, `created_at`, `updated_at`) VALUES
(3, 'Dekan 1', 22, '2024-09-01 14:33:12', '2024-09-01 14:33:12');

INSERT INTO `canteen_preorder_detail` (`id`, `preorder_id`, `order_type`, `qty`, `created_at`, `updated_at`) VALUES
(1, 2, 'Snack Basic', 120, '2024-09-01 12:42:02', '2024-09-01 12:42:02');
INSERT INTO `canteen_preorder_detail` (`id`, `preorder_id`, `order_type`, `qty`, `created_at`, `updated_at`) VALUES
(2, 3, 'Snack Premium', 112, '2024-09-01 12:44:16', '2024-09-01 12:44:16');
INSERT INTO `canteen_preorder_detail` (`id`, `preorder_id`, `order_type`, `qty`, `created_at`, `updated_at`) VALUES
(3, 3, 'Snack Medium', 129, '2024-09-01 12:44:16', '2024-09-01 12:44:16');
INSERT INTO `canteen_preorder_detail` (`id`, `preorder_id`, `order_type`, `qty`, `created_at`, `updated_at`) VALUES
(4, 3, 'Lunch Basic', 118, '2024-09-01 12:44:16', '2024-09-01 12:44:16');

INSERT INTO `canteen_preorder_status_history` (`id`, `preorder_id`, `status`, `changed_at`, `created_at`, `updated_at`, `reject_reason`, `approver_id`) VALUES
(1, 2, 'Disetujui oleh Dekan', '2024-09-01 14:36:16', '2024-09-01 14:36:16', '2024-09-01 14:36:16', NULL, 22);


INSERT INTO `canteen_preorders` (`id`, `requester_id`, `event_date`, `request_count`, `status`, `created_at`, `updated_at`, `number`, `faculty_id`) VALUES
(2, 21, '2024-09-10', 1, 'Disetujui oleh Dekan', '2024-09-01 12:42:02', '2024-09-01 14:36:16', 'PO.09.2024.0002', 1);
INSERT INTO `canteen_preorders` (`id`, `requester_id`, `event_date`, `request_count`, `status`, `created_at`, `updated_at`, `number`, `faculty_id`) VALUES
(3, 21, '2024-09-10', 1, 'Menunggu Persetujuan', '2024-09-01 12:44:15', '2024-09-01 13:22:13', 'PO.09.2024.0003', 1);


INSERT INTO `canteen_scans` (`id`, `account_id`, `scanned_at`, `created_at`, `updated_at`) VALUES
(1, 3, '21:29:08', '2024-07-17 14:29:09', '2024-07-17 14:29:09');
INSERT INTO `canteen_scans` (`id`, `account_id`, `scanned_at`, `created_at`, `updated_at`) VALUES
(2, 4, '21:49:21', '2024-07-17 14:49:22', '2024-07-17 14:49:22');
INSERT INTO `canteen_scans` (`id`, `account_id`, `scanned_at`, `created_at`, `updated_at`) VALUES
(3, 5, '21:58:05', '2024-07-17 14:58:05', '2024-07-17 14:58:05');
INSERT INTO `canteen_scans` (`id`, `account_id`, `scanned_at`, `created_at`, `updated_at`) VALUES
(4, 4, '11:30:36', '2024-07-18 04:30:36', '2024-07-18 04:30:36'),
(5, 6, '14:27:58', '2024-07-18 07:31:21', '2024-07-18 07:31:21'),
(6, 7, '14:35:00', '2024-07-18 07:38:23', '2024-07-18 07:38:23'),
(7, 5, '20:11:56', '2024-07-18 13:11:58', '2024-07-18 13:11:58'),
(8, 3, '20:12:17', '2024-07-18 13:12:19', '2024-07-18 13:12:19'),
(9, 9, '20:16:01', '2024-07-18 13:16:03', '2024-07-18 13:16:03'),
(10, 10, '20:16:11', '2024-07-18 13:16:12', '2024-07-18 13:16:12'),
(11, 11, '21:51:27', '2024-07-18 14:51:28', '2024-07-18 14:51:28'),
(12, 12, '21:57:36', '2024-07-18 14:57:37', '2024-07-18 14:57:37'),
(13, 14, '23:39:31', '2024-07-18 16:39:34', '2024-07-18 16:39:34'),
(14, 5, '20:41:28', '2024-07-19 13:41:30', '2024-07-19 13:41:30'),
(15, 14, '22:53:12', '2024-07-22 15:53:14', '2024-07-22 15:53:14'),
(16, 15, '14:07:10', '2024-07-23 07:07:15', '2024-07-23 07:07:15'),
(17, 13, '20:46:55', '2024-07-23 13:46:57', '2024-07-23 13:46:57'),
(18, 14, '22:58:44', '2024-07-24 15:58:47', '2024-07-24 15:58:47'),
(19, 17, '20:08:16', '2024-08-01 13:08:19', '2024-08-01 13:08:19'),
(20, 20, '11:17:56', '2024-08-13 04:17:58', '2024-08-13 04:17:58'),
(21, 19, '11:34:49', '2024-08-13 04:34:49', '2024-08-13 04:34:49'),
(22, 5, '11:35:15', '2024-08-13 04:35:16', '2024-08-13 04:35:16');

INSERT INTO `faculties` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'Fasilkom', '2024-09-01 09:15:38', '2024-09-01 09:15:38');


INSERT INTO `roles` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'Admin', '2024-07-17 13:08:26', '2024-07-17 13:08:26');
INSERT INTO `roles` (`id`, `name`, `created_at`, `updated_at`) VALUES
(2, 'User', '2024-07-17 13:08:34', '2024-07-17 13:08:34');
INSERT INTO `roles` (`id`, `name`, `created_at`, `updated_at`) VALUES
(3, 'Dekan', '2024-09-01 05:40:46', '2024-09-01 05:40:46');
INSERT INTO `roles` (`id`, `name`, `created_at`, `updated_at`) VALUES
(4, 'BAK', '2024-09-01 05:40:46', '2024-09-01 05:40:46'),
(5, 'TU', '2024-09-01 05:40:46', '2024-09-01 05:40:46');

INSERT INTO `time_break_sessions` (`id`, `session_name`, `session_open`, `session_close`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Jam Makan Siang', '10:30:00', '13:30:00', '1', '2024-07-17 14:26:01', '2024-08-13 04:16:51');
INSERT INTO `time_break_sessions` (`id`, `session_name`, `session_open`, `session_close`, `status`, `created_at`, `updated_at`) VALUES
(7, 'Sesi Sekarang', '14:00:00', '15:00:00', '1', '2024-07-18 07:51:09', '2024-08-02 07:47:08');
INSERT INTO `time_break_sessions` (`id`, `session_name`, `session_open`, `session_close`, `status`, `created_at`, `updated_at`) VALUES
(8, 'Jam Makan Malam', '20:00:00', '23:50:00', '1', '2024-07-18 13:06:04', '2024-07-23 09:02:40');

INSERT INTO `users` (`id`, `full_name`, `status`, `account_id`, `created_at`, `updated_at`) VALUES
(1, 'Kevin', '1', 3, '2024-07-17 14:24:33', '2024-07-17 14:25:20');
INSERT INTO `users` (`id`, `full_name`, `status`, `account_id`, `created_at`, `updated_at`) VALUES
(2, 'adhen1', '1', 4, '2024-07-17 14:34:17', '2024-07-17 14:43:30');
INSERT INTO `users` (`id`, `full_name`, `status`, `account_id`, `created_at`, `updated_at`) VALUES
(3, 'bagaswara', '1', 5, '2024-07-17 14:54:04', '2024-08-01 03:32:37');
INSERT INTO `users` (`id`, `full_name`, `status`, `account_id`, `created_at`, `updated_at`) VALUES
(4, 'Tes', '0', 6, '2024-07-18 07:29:50', '2024-07-18 15:56:08'),
(5, 'coba1', '1', 7, '2024-07-18 07:36:25', '2024-07-18 07:36:43'),
(6, 'Afiyati', '1', 8, '2024-07-18 07:48:05', '2024-07-18 07:48:05'),
(7, 'Paul Pogba', '1', 9, '2024-07-18 13:13:48', '2024-07-18 13:13:48'),
(8, 'Arda', '1', 10, '2024-07-18 13:14:03', '2024-07-18 13:14:03'),
(9, 'Adhen10', '1', 11, '2024-07-18 14:49:07', '2024-07-18 14:49:07'),
(10, 'cobalagi', '0', 12, '2024-07-18 14:54:22', '2024-07-18 15:56:03'),
(11, 'Falah', '1', 13, '2024-07-18 15:54:04', '2024-07-18 15:54:04'),
(12, 'dafaadly', '1', 14, '2024-07-18 16:30:21', '2024-07-18 16:30:21'),
(13, 'Bintang Duinata', '1', 15, '2024-07-23 07:05:28', '2024-07-23 07:05:28'),
(14, 'sri sul', '1', 16, '2024-07-23 07:59:17', '2024-07-23 07:59:17'),
(15, 'rifq', '1', 17, '2024-08-01 13:05:29', '2024-08-01 13:05:29'),
(16, 'rfiqi', '1', 18, '2024-08-02 02:46:34', '2024-08-02 02:46:34'),
(17, 'Sandy M', '1', 19, '2024-08-02 03:51:08', '2024-08-02 03:51:08'),
(18, 'afi', '1', 20, '2024-08-13 04:15:46', '2024-08-13 04:15:46');


/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;