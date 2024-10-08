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
  "unit" varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  "price" int DEFAULT NULL,
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
  "reject_reason" text COLLATE utf8mb4_unicode_ci,
  "attachment_path" varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "event_name" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "is_finished" tinyint(1) DEFAULT '0',
  "unit" varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  "sequence" int NOT NULL,
  PRIMARY KEY ("id"),
  KEY "account_id" ("account_id"),
  CONSTRAINT "canteen_scans_ibfk_1" FOREIGN KEY ("account_id") REFERENCES "accounts" ("id") ON DELETE CASCADE
);

CREATE TABLE "event_members" (
  "id" int NOT NULL AUTO_INCREMENT,
  "member_name" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "is_additional" tinyint(1) DEFAULT '0',
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  "preorder_id" int DEFAULT NULL,
  PRIMARY KEY ("id"),
  KEY "preorder_id" ("preorder_id"),
  CONSTRAINT "event_members_ibfk_1" FOREIGN KEY ("preorder_id") REFERENCES "canteen_preorders" ("id") ON DELETE SET NULL
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
  "unit" varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "category" varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "jobPosition" varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
(21, 'tu_fasilkom_1', '$2a$12$XI3Gmk.BPdYW7PXiFqflPe7F5ifBYKAInqSkPcSsFhwHhw76kBP4a', 5, '2024-09-01 11:53:32', '2024-10-08 15:04:41', 1),
(22, 'dekan1', '$2a$12$8xi/ffNbGajNxUg4TgpSOu8gg9N0.QwKhHBrbxRsudcgls86I41.6', 3, '2024-09-01 14:33:12', '2024-09-01 14:33:12', 1),
(23, 'sdm1', '$2a$12$/khnFizGk/z9sM9vovlGc.jFvwfThQmnOuYfXz2jXoqQaEvnd1.OW', 4, '2024-09-05 21:46:05', '2024-09-16 08:27:25', 1),
(24, '320950413', '$2a$12$lEfGOc4dqWDNPeWg0LyNI.KBv/96Nmo0qr5Run.YinELyPFaHSKP.', 2, '2024-09-09 03:49:31', '2024-09-09 03:49:31', NULL),
(25, '312', '$2a$12$laYKtWk5QbOCr38RHH.bv.BBMBkanCHEWNdPrrX6GwNNW7uJGY9l.', 2, '2024-09-09 03:53:49', '2024-09-09 03:53:49', NULL),
(26, '777999', '$2a$12$CZhTzvJyNPvFQoscabp8Pe.r5TqRSx.0r3MRPeyM.LxHAxnu9lLvi', 2, '2024-09-09 16:44:58', '2024-09-09 16:44:58', NULL),
(27, '1994', '$2a$12$uzjB2zUsWZvNTbT.9f.vTOl2ffKlnRA/6WcY74lTr87wDb/jHK/Yu', 2, '2024-09-11 07:58:42', '2024-09-11 07:58:42', NULL),
(28, '123123', '$2a$12$zgx4QNy0lF3iXWtXDqAHbeIf992wawIhHolKjexwuMFNVGMvWw.iy', 2, '2024-09-11 08:00:02', '2024-09-11 08:00:02', NULL),
(29, '001', '$2a$12$PINspekVtkwKrQZvxz3SlO4EjWS/3A2kYhzorIit.O6c.dDRx/EMa', 2, '2024-09-13 15:12:11', '2024-09-13 15:12:11', NULL),
(30, '002', '$2a$12$bqBQ8LLjfEJJ8Mcouhvg6uVIpF.8TOXeHTvfi0GgLBmZ7PskVGPkS', 2, '2024-09-13 15:28:18', '2024-09-16 12:22:42', NULL),
(31, '003', '$2a$12$k.f.LMQawNvXVBog.rJn3u/lJhF3QiK34oZprKFS2qSrGK9C2Ykbq', 2, '2024-09-13 15:54:53', '2024-09-13 15:54:53', NULL),
(32, '004', '$2a$12$SVAuJ02KrTQOHw4X/1H.dO4yLDZJ0SmafpdeA5LZiGJNEJuUhxCBi', 2, '2024-09-16 10:29:14', '2024-09-16 10:29:14', NULL),
(33, '10000', '$2a$12$KSxpYpdHSFUOgc3fmpuC/OjZ8TsSuQyDGD1o.CfuR9mbdpQ9UTso6', 2, '2024-09-18 07:20:21', '2024-09-18 07:20:21', NULL),
(34, '20000', '$2a$12$Uayoqn5jjkMHPqU.Io1ao.y5emHU2QLzIVmOJFh58xyuBIAjRewb.', 2, '2024-09-19 01:23:13', '2024-09-19 01:23:13', NULL),
(35, '30000', '$2a$12$RGf/yHgPyWhTPuS.87CB2.aCWt2VeUVQHmhdkI/U4qTKQXMeaabpe', 2, '2024-09-20 08:24:25', '2024-09-20 08:24:25', NULL),
(36, '393700115', '$2a$12$22gWaV6UM16s.kwiTNAP5O2gPUUouUj4Z4.GrzkAa3H9TVFVuZhlq', 2, '2024-09-20 08:46:51', '2024-09-20 08:46:51', NULL),
(37, '8000', '$2a$12$C2.gPv131fxjvtGG0HdM3.NrsL2CIhFi7zsptR0iItEYZYsCAPSnu', 2, '2024-09-24 15:27:32', '2024-09-24 15:27:32', NULL),
(38, '17000', '$2a$12$jRJJj4Jpkuakp0L0H56JmOBrngj/fVcdH4uMdwr7E0KF5fc2vTuW2', 2, '2024-10-06 13:59:14', '2024-10-06 13:59:14', NULL);

INSERT INTO `admins` (`id`, `full_name`, `account_id`, `created_at`, `updated_at`, `unit`) VALUES
(1, 'Admin 1', 2, '2024-07-17 13:08:54', '2024-07-17 13:08:54', NULL);
INSERT INTO `admins` (`id`, `full_name`, `account_id`, `created_at`, `updated_at`, `unit`) VALUES
(2, 'TU Fasilkom 1', 21, '2024-09-01 11:53:32', '2024-10-08 15:03:59', 'Fasilkom');
INSERT INTO `admins` (`id`, `full_name`, `account_id`, `created_at`, `updated_at`, `unit`) VALUES
(3, 'Dekan 1', 22, '2024-09-01 14:33:12', '2024-09-01 14:33:12', NULL);
INSERT INTO `admins` (`id`, `full_name`, `account_id`, `created_at`, `updated_at`, `unit`) VALUES
(4, 'SDM 1', 23, '2024-09-05 21:46:05', '2024-09-16 13:38:39', NULL);

INSERT INTO `canteen_preorder_detail` (`id`, `preorder_id`, `order_type`, `qty`, `created_at`, `updated_at`, `price`) VALUES
(105, 22, 'Snack Basic', 30, '2024-09-06 12:56:24', '2024-10-07 17:14:53', 20000);
INSERT INTO `canteen_preorder_detail` (`id`, `preorder_id`, `order_type`, `qty`, `created_at`, `updated_at`, `price`) VALUES
(106, 22, 'Lunch Basic', 30, '2024-09-06 12:56:24', '2024-10-07 17:14:53', 30000);
INSERT INTO `canteen_preorder_detail` (`id`, `preorder_id`, `order_type`, `qty`, `created_at`, `updated_at`, `price`) VALUES
(108, 23, 'Snack Basic', 10, '2024-09-06 16:02:46', '2024-09-06 16:02:46', NULL);
INSERT INTO `canteen_preorder_detail` (`id`, `preorder_id`, `order_type`, `qty`, `created_at`, `updated_at`, `price`) VALUES
(110, 24, 'Snack Medium', 10, '2024-09-08 15:14:08', '2024-09-08 15:14:08', NULL),
(113, 25, 'Snack Basic', 70, '2024-09-09 04:23:16', '2024-10-07 17:16:31', 60000),
(114, 26, 'Snack Basic', 30, '2024-09-09 14:46:51', '2024-09-09 14:46:51', NULL),
(115, 27, 'Snack Premium', 35, '2024-10-03 13:25:59', '2024-10-03 13:25:59', NULL),
(116, 27, 'Lunch Basic', 40, '2024-10-03 13:25:59', '2024-10-03 13:25:59', NULL),
(117, 28, 'Snack Basic', 70, '2024-10-03 16:17:23', '2024-10-03 16:17:23', NULL),
(118, 28, 'Lunch Basic', 70, '2024-10-03 16:17:24', '2024-10-03 16:17:24', NULL),
(127, 29, 'Snack Medium', 12, '2024-10-06 07:25:28', '2024-10-06 07:25:28', NULL),
(128, 29, 'Lunch Basic', 12, '2024-10-06 07:25:28', '2024-10-06 07:25:28', NULL),
(129, 30, 'Lunch Basic', 10, '2024-10-06 13:51:37', '2024-10-08 11:54:35', 3000),
(130, 30, 'Snack Medium', 11, '2024-10-06 13:51:38', '2024-10-08 11:54:35', 40000),
(133, 31, 'Snack Basic', 30, '2024-10-06 16:50:00', '2024-10-06 16:50:00', NULL),
(134, 31, 'Lunch Basic', 30, '2024-10-06 16:50:00', '2024-10-06 16:50:00', NULL),
(135, 32, 'Snack Basic', 130, '2024-10-07 17:19:23', '2024-10-07 17:25:58', 9000),
(136, 32, 'Lunch Basic', 129, '2024-10-07 17:19:23', '2024-10-07 17:19:23', 25000),
(137, 30, 'Snack Basic', 18, '2024-10-08 11:46:43', '2024-10-08 11:54:35', 25000),
(144, 33, 'Lunch Basic', 23, '2024-10-08 15:29:13', '2024-10-08 15:31:24', 23000),
(145, 33, 'Snack Medium', 23, '2024-10-08 15:29:13', '2024-10-08 15:31:24', 13000),
(146, 34, 'Snack Basic', 2, '2024-10-08 15:45:09', '2024-10-08 15:45:09', 8000),
(147, 34, 'Lunch Basic', 2, '2024-10-08 15:45:09', '2024-10-08 15:45:09', 25000);

INSERT INTO `canteen_preorder_status_history` (`id`, `preorder_id`, `status`, `changed_at`, `created_at`, `updated_at`, `reject_reason`, `approver_id`) VALUES
(59, 22, 'Ditolak oleh Dekan', '2024-09-06 19:54:12', '2024-09-06 12:54:13', '2024-09-06 12:54:13', 'snack premium nya tambah 5 lagi', 22);
INSERT INTO `canteen_preorder_status_history` (`id`, `preorder_id`, `status`, `changed_at`, `created_at`, `updated_at`, `reject_reason`, `approver_id`) VALUES
(60, 22, 'Menunggu Persetujuan Dekan', '2024-09-06 19:54:54', '2024-09-06 12:54:56', '2024-09-06 12:54:56', NULL, 21);
INSERT INTO `canteen_preorder_status_history` (`id`, `preorder_id`, `status`, `changed_at`, `created_at`, `updated_at`, `reject_reason`, `approver_id`) VALUES
(61, 22, 'Disetujui oleh Dekan', '2024-09-06 19:55:26', '2024-09-06 12:55:28', '2024-09-06 12:55:28', NULL, 22);
INSERT INTO `canteen_preorder_status_history` (`id`, `preorder_id`, `status`, `changed_at`, `created_at`, `updated_at`, `reject_reason`, `approver_id`) VALUES
(62, 22, 'Menunggu Persetujuan BAK', '2024-09-06 19:55:26', '2024-09-06 12:55:28', '2024-09-06 12:55:28', NULL, 22),
(63, 22, 'Ditolak oleh BAK', '2024-09-06 19:55:50', '2024-09-06 12:55:52', '2024-09-06 12:55:52', 'snack premium hapus saja', 23),
(64, 22, 'Menunggu Persetujuan Dekan', '2024-09-06 19:56:23', '2024-09-06 12:56:24', '2024-09-06 12:56:24', NULL, 21),
(65, 22, 'Disetujui oleh Dekan', '2024-09-06 20:00:06', '2024-09-06 13:00:07', '2024-09-06 13:00:07', NULL, 22),
(66, 22, 'Menunggu Persetujuan BAK', '2024-09-06 20:00:06', '2024-09-06 13:00:07', '2024-09-06 13:00:07', NULL, 22),
(67, 22, 'Disetujui oleh BAK', '2024-09-06 20:00:17', '2024-09-06 13:00:19', '2024-09-06 13:00:19', NULL, 23),
(68, 22, 'Menunggu Proses Kantin', '2024-09-06 20:00:17', '2024-09-06 13:00:19', '2024-09-06 13:00:19', NULL, 23),
(69, 23, 'Ditolak oleh Dekan', '2024-09-06 20:01:23', '2024-09-06 13:01:25', '2024-09-06 13:01:25', 'tolak aja', 22),
(70, 23, 'Menunggu Persetujuan Dekan', '2024-09-06 23:02:44', '2024-09-06 16:02:46', '2024-09-06 16:02:46', NULL, 21),
(71, 23, 'Ditolak oleh Dekan', '2024-09-08 22:07:16', '2024-09-08 15:07:16', '2024-09-08 15:07:16', 'tidak ada alasan', 22),
(72, 24, 'Disetujui oleh Dekan', '2024-09-08 22:10:54', '2024-09-08 15:10:54', '2024-09-08 15:10:54', NULL, 22),
(73, 24, 'Menunggu Persetujuan BAK', '2024-09-08 22:10:54', '2024-09-08 15:10:54', '2024-09-08 15:10:54', NULL, 22),
(74, 24, 'Ditolak oleh BAK', '2024-09-08 22:11:11', '2024-09-08 15:11:12', '2024-09-08 15:11:12', 'tolak aja', 23),
(75, 24, 'Menunggu Persetujuan Dekan', '2024-09-08 22:14:07', '2024-09-08 15:14:08', '2024-09-08 15:14:08', NULL, 21),
(76, 24, 'Ditolak oleh Dekan', '2024-09-08 22:14:51', '2024-09-08 15:14:52', '2024-09-08 15:14:52', 'tolak lagi', 22),
(77, 25, 'Ditolak oleh Dekan', '2024-09-09 11:17:50', '2024-09-09 04:18:35', '2024-09-09 04:18:35', 'kurangi jumlahmya', 22),
(78, 25, 'Menunggu Persetujuan Dekan', '2024-09-09 11:19:28', '2024-09-09 04:20:13', '2024-09-09 04:20:13', NULL, 21),
(79, 25, 'Disetujui oleh Dekan', '2024-09-09 11:19:47', '2024-09-09 04:20:33', '2024-09-09 04:20:33', NULL, 22),
(80, 25, 'Menunggu Persetujuan BAK', '2024-09-09 11:19:47', '2024-09-09 04:20:33', '2024-09-09 04:20:33', NULL, 22),
(81, 25, 'Ditolak oleh BAK', '2024-09-09 11:21:55', '2024-09-09 04:22:41', '2024-09-09 04:22:41', 'kurangi pesanan', 23),
(82, 25, 'Menunggu Persetujuan Dekan', '2024-09-09 11:22:31', '2024-09-09 04:23:16', '2024-09-09 04:23:16', NULL, 21),
(83, 25, 'Disetujui oleh Dekan', '2024-09-09 11:22:52', '2024-09-09 04:23:37', '2024-09-09 04:23:37', NULL, 22),
(84, 25, 'Menunggu Persetujuan BAK', '2024-09-09 11:22:52', '2024-09-09 04:23:37', '2024-09-09 04:23:37', NULL, 22),
(85, 25, 'Disetujui oleh BAK', '2024-09-09 11:23:13', '2024-09-09 04:23:58', '2024-09-09 04:23:58', NULL, 23),
(86, 25, 'Menunggu Proses Kantin', '2024-09-09 11:23:13', '2024-09-09 04:23:59', '2024-09-09 04:23:59', NULL, 23),
(87, 27, 'Ditolak oleh Dekan', '2024-10-05 11:21:16', '2024-10-05 04:21:17', '2024-10-05 04:21:17', 'Yahahahah', 22),
(88, 28, 'Ditolak oleh Dekan', '2024-10-06 10:52:13', '2024-10-06 03:52:15', '2024-10-06 03:52:15', 'ditolakkk aja', 22),
(89, 26, 'Ditolak oleh Dekan', '2024-10-06 10:53:15', '2024-10-06 03:53:16', '2024-10-06 03:53:16', 'ditolaakkk 1', 22),
(90, 29, 'Ditolak oleh Dekan', '2024-10-06 11:10:01', '2024-10-06 04:10:02', '2024-10-06 04:10:02', 'ditolakkkk aja', 22),
(92, 29, 'Menunggu Persetujuan Dekan', '2024-10-06 14:19:10', '2024-10-06 07:19:11', '2024-10-06 07:19:11', NULL, 21),
(93, 29, 'Disetujui oleh Dekan', '2024-10-06 14:21:03', '2024-10-06 07:21:04', '2024-10-06 07:21:04', NULL, 22),
(94, 29, 'Menunggu Persetujuan SDM', '2024-10-06 14:21:03', '2024-10-06 07:21:04', '2024-10-06 07:21:04', NULL, 22),
(95, 29, 'Ditolak oleh SDM', '2024-10-06 14:23:38', '2024-10-06 07:23:39', '2024-10-06 07:23:39', 'Tambahkan 2 orang lagi', 23),
(96, 29, 'Menunggu Persetujuan Dekan', '2024-10-06 14:24:29', '2024-10-06 07:24:30', '2024-10-06 07:24:30', NULL, 21),
(97, 29, 'Ditolak oleh Dekan', '2024-10-06 14:24:50', '2024-10-06 07:24:51', '2024-10-06 07:24:51', 'hapus arda', 22),
(98, 29, 'Menunggu Persetujuan Dekan', '2024-10-06 14:25:27', '2024-10-06 07:25:27', '2024-10-06 07:25:27', NULL, 21),
(99, 29, 'Disetujui oleh Dekan', '2024-10-06 14:25:52', '2024-10-06 07:25:52', '2024-10-06 07:25:52', NULL, 22),
(100, 29, 'Menunggu Persetujuan SDM', '2024-10-06 14:25:52', '2024-10-06 07:25:52', '2024-10-06 07:25:52', NULL, 22),
(101, 29, 'Disetujui oleh SDM', '2024-10-06 14:26:10', '2024-10-06 07:26:11', '2024-10-06 07:26:11', NULL, 23),
(102, 29, 'Menunggu Proses Kantin', '2024-10-06 14:26:10', '2024-10-06 07:26:11', '2024-10-06 07:26:11', NULL, 23),
(103, 30, 'Disetujui oleh Dekan', '2024-10-06 20:55:19', '2024-10-06 13:55:20', '2024-10-06 13:55:20', NULL, 22),
(104, 30, 'Menunggu Persetujuan SDM', '2024-10-06 20:55:19', '2024-10-06 13:55:20', '2024-10-06 13:55:20', NULL, 22),
(105, 30, 'Disetujui oleh SDM', '2024-10-06 21:01:51', '2024-10-06 14:01:51', '2024-10-06 14:01:51', NULL, 23),
(106, 30, 'Menunggu Proses Kantin', '2024-10-06 21:01:51', '2024-10-06 14:01:52', '2024-10-06 14:01:52', NULL, 23),
(107, 31, 'Ditolak oleh Dekan', '2024-10-06 23:49:09', '2024-10-06 16:49:10', '2024-10-06 16:49:10', 'Kurangin 2 orang', 22),
(108, 31, 'Menunggu Persetujuan Dekan', '2024-10-06 23:49:58', '2024-10-06 16:50:00', '2024-10-06 16:50:00', NULL, 21),
(109, 32, 'Disetujui oleh Dekan', '2024-10-08 00:25:04', '2024-10-07 17:25:04', '2024-10-07 17:25:04', NULL, 22),
(110, 32, 'Menunggu Persetujuan SDM', '2024-10-08 00:25:04', '2024-10-07 17:25:04', '2024-10-07 17:25:04', NULL, 22),
(111, 32, 'Disetujui oleh SDM', '2024-10-08 00:25:19', '2024-10-07 17:25:20', '2024-10-07 17:25:20', NULL, 23),
(112, 32, 'Menunggu Proses Kantin', '2024-10-08 00:25:19', '2024-10-07 17:25:20', '2024-10-07 17:25:20', NULL, 23),
(113, 33, 'Ditolak oleh Dekan', '2024-10-08 22:23:36', '2024-10-08 15:23:36', '2024-10-08 15:23:36', 'Kebanyakan makanan nya tidak sesuai peserta', 22),
(114, 33, 'Menunggu Persetujuan Dekan', '2024-10-08 22:24:27', '2024-10-08 15:24:27', '2024-10-08 15:24:27', NULL, 21),
(115, 33, 'Ditolak oleh Dekan', '2024-10-08 22:25:23', '2024-10-08 15:25:23', '2024-10-08 15:25:23', 'no komen', 22),
(116, 33, 'Menunggu Persetujuan Dekan', '2024-10-08 22:25:46', '2024-10-08 15:25:46', '2024-10-08 15:25:46', NULL, 21),
(117, 33, 'Ditolak oleh Dekan', '2024-10-08 22:29:01', '2024-10-08 15:29:01', '2024-10-08 15:29:01', 'tolakkk', 22),
(118, 33, 'Menunggu Persetujuan Dekan', '2024-10-08 22:29:13', '2024-10-08 15:29:13', '2024-10-08 15:29:13', NULL, 21),
(119, 33, 'Disetujui oleh Dekan', '2024-10-08 22:29:56', '2024-10-08 15:29:56', '2024-10-08 15:29:56', NULL, 22),
(120, 33, 'Menunggu Persetujuan SDM', '2024-10-08 22:29:56', '2024-10-08 15:29:56', '2024-10-08 15:29:56', NULL, 22),
(121, 33, 'Disetujui oleh SDM', '2024-10-08 22:30:23', '2024-10-08 15:30:23', '2024-10-08 15:30:23', NULL, 23),
(122, 33, 'Menunggu Proses Kantin', '2024-10-08 22:30:23', '2024-10-08 15:30:23', '2024-10-08 15:30:23', NULL, 23),
(123, 34, 'Ditolak oleh Dekan', '2024-10-08 22:46:54', '2024-10-08 15:46:54', '2024-10-08 15:46:54', 'aaaa', 22);

INSERT INTO `canteen_preorders` (`id`, `requester_id`, `event_date`, `request_count`, `status`, `created_at`, `updated_at`, `number`, `faculty_id`, `reject_reason`, `attachment_path`, `event_name`, `is_finished`, `unit`) VALUES
(22, 21, '2024-09-13', 3, 'Menunggu Proses Kantin', '2024-09-06 12:51:49', '2024-10-07 17:14:53', 'PO.09.2024.0001', 1, NULL, NULL, '', 1, NULL);
INSERT INTO `canteen_preorders` (`id`, `requester_id`, `event_date`, `request_count`, `status`, `created_at`, `updated_at`, `number`, `faculty_id`, `reject_reason`, `attachment_path`, `event_name`, `is_finished`, `unit`) VALUES
(23, 21, '2024-09-14', 2, 'Ditolak oleh Sistem', '2024-09-06 13:01:04', '2024-09-08 15:07:17', 'PO.09.2024.0002', 1, 'tidak ada alasan', NULL, '', 0, NULL);
INSERT INTO `canteen_preorders` (`id`, `requester_id`, `event_date`, `request_count`, `status`, `created_at`, `updated_at`, `number`, `faculty_id`, `reject_reason`, `attachment_path`, `event_name`, `is_finished`, `unit`) VALUES
(24, 21, '2024-09-16', 2, 'Ditolak oleh Sistem', '2024-09-08 15:10:36', '2024-09-10 17:06:40', 'PO.09.2024.0003', 1, 'tolak lagi', NULL, '', 0, NULL);
INSERT INTO `canteen_preorders` (`id`, `requester_id`, `event_date`, `request_count`, `status`, `created_at`, `updated_at`, `number`, `faculty_id`, `reject_reason`, `attachment_path`, `event_name`, `is_finished`, `unit`) VALUES
(25, 21, '2024-09-30', 3, 'Menunggu Proses Kantin', '2024-09-09 04:10:23', '2024-10-07 17:16:31', 'PO.09.2024.0004', 1, NULL, NULL, '', 1, NULL),
(26, 21, '2024-09-16', 1, 'Ditolak oleh Sistem', '2024-09-09 14:46:50', '2024-10-06 03:53:17', 'PO.09.2024.0005', 1, 'ditolaakkk 1', NULL, '', 0, NULL),
(27, 21, '2024-10-10', 1, 'Ditolak oleh Sistem', '2024-10-03 13:25:59', '2024-10-05 04:21:20', 'PO.10.2024.0001', 1, 'Yahahahah', NULL, 'Makan besar mercu', 0, NULL),
(28, 21, '2024-10-10', 1, 'Ditolak oleh Sistem', '2024-10-03 16:17:23', '2024-10-06 03:52:16', 'PO.10.2024.0002', 1, 'ditolakkk aja', NULL, 'Dewa 19 Road To Mercu Buana', 0, NULL),
(29, 21, '2024-10-14', 4, 'Menunggu Proses Kantin', '2024-10-06 04:09:23', '2024-10-06 07:26:11', 'PO.10.2024.0003', 1, NULL, NULL, 'Bala Dukun', 0, NULL),
(30, 21, '2024-10-14', 1, 'Menunggu Proses Kantin', '2024-10-06 13:51:37', '2024-10-08 11:43:51', 'PO.10.2024.0004', 1, 'NULL', NULL, 'rapat fasilkom', 1, 'Fasilkom'),
(31, 21, '2024-10-30', 2, 'Menunggu Persetujuan Dekan', '2024-10-06 16:46:23', '2024-10-06 16:50:00', 'PO.10.2024.0005', 1, NULL, NULL, 'Acara perpisahan aja', 0, NULL),
(32, 21, '2024-10-17', 1, 'Menunggu Proses Kantin', '2024-10-07 17:19:23', '2024-10-07 17:25:57', 'PO.10.2024.0006', 1, NULL, NULL, 'Testing Acara Metal', 1, NULL),
(33, 21, '2024-10-15', 4, 'Menunggu Proses Kantin', '2024-10-08 15:21:38', '2024-10-08 15:31:24', 'PO.10.2024.0007', 1, NULL, NULL, 'Malam Malam Hepi', 1, 'Fasilkom'),
(34, 21, '2024-10-15', 1, 'Ditolak oleh Dekan', '2024-10-08 15:45:09', '2024-10-08 15:46:54', 'PO.10.2024.0008', 1, 'aaaa', NULL, 'Sheila datang', 0, 'Fasilkom');

INSERT INTO `canteen_scans` (`id`, `account_id`, `scanned_at`, `created_at`, `updated_at`, `sequence`) VALUES
(1, 3, '21:29:08', '2024-07-17 14:29:09', '2024-07-17 14:29:09', 0);
INSERT INTO `canteen_scans` (`id`, `account_id`, `scanned_at`, `created_at`, `updated_at`, `sequence`) VALUES
(2, 4, '21:49:21', '2024-07-17 14:49:22', '2024-07-17 14:49:22', 0);
INSERT INTO `canteen_scans` (`id`, `account_id`, `scanned_at`, `created_at`, `updated_at`, `sequence`) VALUES
(3, 5, '21:58:05', '2024-07-17 14:58:05', '2024-07-17 14:58:05', 0);
INSERT INTO `canteen_scans` (`id`, `account_id`, `scanned_at`, `created_at`, `updated_at`, `sequence`) VALUES
(4, 4, '11:30:36', '2024-07-18 04:30:36', '2024-07-18 04:30:36', 0),
(5, 6, '14:27:58', '2024-07-18 07:31:21', '2024-07-18 07:31:21', 0),
(6, 7, '14:35:00', '2024-07-18 07:38:23', '2024-07-18 07:38:23', 0),
(7, 5, '20:11:56', '2024-07-18 13:11:58', '2024-07-18 13:11:58', 0),
(8, 3, '20:12:17', '2024-07-18 13:12:19', '2024-07-18 13:12:19', 0),
(9, 9, '20:16:01', '2024-07-18 13:16:03', '2024-07-18 13:16:03', 0),
(10, 10, '20:16:11', '2024-07-18 13:16:12', '2024-07-18 13:16:12', 0),
(11, 11, '21:51:27', '2024-07-18 14:51:28', '2024-07-18 14:51:28', 0),
(12, 12, '21:57:36', '2024-07-18 14:57:37', '2024-07-18 14:57:37', 0),
(13, 14, '23:39:31', '2024-07-18 16:39:34', '2024-07-18 16:39:34', 0),
(14, 5, '20:41:28', '2024-07-19 13:41:30', '2024-07-19 13:41:30', 0),
(15, 14, '22:53:12', '2024-07-22 15:53:14', '2024-07-22 15:53:14', 0),
(16, 15, '14:07:10', '2024-07-23 07:07:15', '2024-07-23 07:07:15', 0),
(17, 13, '20:46:55', '2024-07-23 13:46:57', '2024-07-23 13:46:57', 0),
(18, 14, '22:58:44', '2024-07-24 15:58:47', '2024-07-24 15:58:47', 0),
(19, 17, '20:08:16', '2024-08-01 13:08:19', '2024-08-01 13:08:19', 0),
(20, 20, '11:17:56', '2024-08-13 04:17:58', '2024-08-13 04:17:58', 0),
(21, 19, '11:34:49', '2024-08-13 04:34:49', '2024-08-13 04:34:49', 0),
(22, 5, '11:35:15', '2024-08-13 04:35:16', '2024-08-13 04:35:16', 0),
(23, 8, '10:57:16', '2024-09-09 03:58:01', '2024-09-09 03:58:01', 0),
(24, 30, '17:59:14', '2024-09-14 10:59:15', '2024-09-14 10:59:15', 0),
(25, 26, '18:00:50', '2024-09-14 11:00:51', '2024-09-14 11:00:51', 0),
(26, 28, '18:04:35', '2024-09-14 11:04:35', '2024-09-14 11:04:35', 0),
(27, 30, '16:30:09', '2024-09-16 09:30:10', '2024-09-16 09:30:10', 0),
(28, 32, '17:40:23', '2024-09-16 10:40:25', '2024-09-16 10:40:25', 0),
(29, 28, '17:44:59', '2024-09-16 10:45:00', '2024-09-16 10:45:00', 0),
(30, 24, '17:45:06', '2024-09-16 10:45:07', '2024-09-16 10:45:07', 0),
(31, 19, '17:45:16', '2024-09-16 10:45:17', '2024-09-16 10:45:17', 0),
(32, 25, '17:45:38', '2024-09-16 10:45:39', '2024-09-16 10:45:39', 0),
(33, 26, '17:46:13', '2024-09-16 10:46:14', '2024-09-16 10:46:14', 0),
(34, 13, '17:59:50', '2024-09-16 10:59:51', '2024-09-16 10:59:51', 0),
(35, 30, '22:10:21', '2024-09-17 15:10:21', '2024-09-17 15:10:21', 0),
(36, 33, '14:22:00', '2024-09-18 07:22:02', '2024-09-18 07:22:02', 0),
(37, 34, '08:23:43', '2024-09-19 01:23:43', '2024-09-19 01:23:43', 0),
(38, 33, '08:25:24', '2024-09-19 01:25:24', '2024-09-19 01:25:24', 0),
(39, 35, '15:30:15', '2024-09-20 08:30:16', '2024-09-20 08:30:16', 0),
(40, 26, '15:36:11', '2024-09-20 08:36:13', '2024-09-20 08:36:13', 0),
(41, 8, '15:36:53', '2024-09-20 08:36:54', '2024-09-20 08:36:54', 0),
(42, 32, '15:37:12', '2024-09-20 08:37:13', '2024-09-20 08:37:13', 0),
(43, 25, '15:37:19', '2024-09-20 08:37:20', '2024-09-20 08:37:20', 0),
(44, 33, '15:38:49', '2024-09-20 08:38:50', '2024-09-20 08:38:50', 0),
(45, 36, '15:48:00', '2024-09-20 08:48:01', '2024-09-20 08:48:01', 0),
(46, 31, '22:44:42', '2024-09-22 15:44:44', '2024-09-22 15:44:44', 0),
(47, 30, '22:45:09', '2024-09-22 15:45:10', '2024-09-22 15:45:10', 0),
(48, 30, '23:09:34', '2024-09-23 16:09:35', '2024-09-23 16:09:35', 0),
(49, 31, '23:11:10', '2024-09-23 16:11:11', '2024-09-23 16:11:11', 0),
(50, 32, '23:11:36', '2024-09-23 16:11:37', '2024-09-23 16:11:37', 0),
(51, 9, '23:12:17', '2024-09-23 16:12:18', '2024-09-23 16:12:18', 0),
(52, 13, '23:18:00', '2024-09-23 16:18:01', '2024-09-23 16:18:01', 0),
(53, 18, '23:18:12', '2024-09-23 16:18:13', '2024-09-23 16:18:13', 0),
(54, 37, '22:29:04', '2024-09-24 15:29:04', '2024-09-24 15:29:04', 0),
(55, 33, '22:33:46', '2024-09-24 15:33:46', '2024-09-24 15:33:46', 0),
(56, 33, '15:01:05', '2024-09-28 08:01:07', '2024-09-28 08:01:07', 0),
(57, 30, '15:02:07', '2024-09-28 08:02:09', '2024-09-28 08:02:09', 0),
(58, 31, '23:57:40', '2024-09-28 16:57:42', '2024-09-28 16:57:42', 0),
(59, 32, '23:59:00', '2024-09-28 16:59:02', '2024-09-28 16:59:02', 0),
(60, 28, '00:11:20', '2024-09-28 17:11:22', '2024-09-28 17:11:22', 0),
(61, 27, '00:12:46', '2024-09-28 17:12:51', '2024-09-28 17:12:51', 0),
(62, 34, '00:14:18', '2024-09-28 17:14:20', '2024-09-28 17:14:20', 0),
(63, 18, '00:14:29', '2024-09-28 17:14:31', '2024-09-28 17:14:31', 0),
(64, 36, '00:15:42', '2024-09-28 17:15:44', '2024-09-28 17:15:44', 0),
(65, 3, '00:43:49', '2024-09-28 17:43:51', '2024-09-28 17:43:51', 0),
(66, 9, '00:50:22', '2024-09-28 17:50:24', '2024-09-28 17:50:24', 0),
(67, 30, '16:30:05', '2024-09-29 09:30:05', '2024-09-29 09:30:05', 8);

INSERT INTO `event_members` (`id`, `member_name`, `is_additional`, `created_at`, `updated_at`, `preorder_id`) VALUES
(1, '393700115', 0, '2024-10-03 13:25:59', '2024-10-03 13:25:59', 27);
INSERT INTO `event_members` (`id`, `member_name`, `is_additional`, `created_at`, `updated_at`, `preorder_id`) VALUES
(2, '003', 0, '2024-10-03 13:25:59', '2024-10-03 13:25:59', 27);
INSERT INTO `event_members` (`id`, `member_name`, `is_additional`, `created_at`, `updated_at`, `preorder_id`) VALUES
(3, '1994', 0, '2024-10-03 13:25:59', '2024-10-03 13:25:59', 27);
INSERT INTO `event_members` (`id`, `member_name`, `is_additional`, `created_at`, `updated_at`, `preorder_id`) VALUES
(4, '320950413', 0, '2024-10-03 13:25:59', '2024-10-03 13:25:59', 27),
(5, '312', 0, '2024-10-03 13:25:59', '2024-10-03 13:25:59', 27),
(6, '415200101400', 0, '2024-10-03 13:25:59', '2024-10-03 13:25:59', 27),
(7, '41521010037', 0, '2024-10-03 13:25:59', '2024-10-03 13:25:59', 27),
(8, '12345678', 0, '2024-10-03 13:25:59', '2024-10-03 13:25:59', 27),
(9, '76567', 0, '2024-10-03 13:25:59', '2024-10-03 13:25:59', 27),
(10, '865865', 0, '2024-10-03 13:26:00', '2024-10-03 13:26:00', 27),
(11, '1006', 0, '2024-10-03 13:26:00', '2024-10-03 13:26:00', 27),
(12, '098098', 0, '2024-10-03 13:26:00', '2024-10-03 13:26:00', 27),
(13, '123321', 0, '2024-10-03 13:26:00', '2024-10-03 13:26:00', 27),
(14, '54321', 0, '2024-10-03 13:26:00', '2024-10-03 13:26:00', 27),
(15, '41521010176', 0, '2024-10-03 13:26:00', '2024-10-03 13:26:00', 27),
(16, '09000993', 0, '2024-10-03 13:26:00', '2024-10-03 13:26:00', 27),
(17, '111133333', 0, '2024-10-03 13:26:00', '2024-10-03 13:26:00', 27),
(18, '114690444', 0, '2024-10-03 13:26:00', '2024-10-03 13:26:00', 27),
(19, '30000', 0, '2024-10-03 13:26:00', '2024-10-03 13:26:00', 27),
(20, '20000', 0, '2024-10-03 13:26:00', '2024-10-03 13:26:00', 27),
(21, '8000', 0, '2024-10-03 13:26:00', '2024-10-03 13:26:00', 27),
(22, 'Bagus', 1, '2024-10-03 13:26:00', '2024-10-03 13:26:00', 27),
(23, 'Bangettt', 1, '2024-10-03 13:26:00', '2024-10-03 13:26:00', 27),
(24, '8000', 0, '2024-10-03 16:17:24', '2024-10-03 16:17:24', 28),
(25, '393700115', 0, '2024-10-03 16:17:24', '2024-10-03 16:17:24', 28),
(26, '12345678', 0, '2024-10-03 16:17:24', '2024-10-03 16:17:24', 28),
(27, '865865', 0, '2024-10-03 16:17:24', '2024-10-03 16:17:24', 28),
(28, '098098', 0, '2024-10-03 16:17:24', '2024-10-03 16:17:24', 28),
(29, '09000993', 0, '2024-10-03 16:17:24', '2024-10-03 16:17:24', 28),
(30, '111133333', 0, '2024-10-03 16:17:24', '2024-10-03 16:17:24', 28),
(31, '114690444', 0, '2024-10-03 16:17:24', '2024-10-03 16:17:24', 28),
(32, '003', 0, '2024-10-03 16:17:24', '2024-10-03 16:17:24', 28),
(33, '1994', 0, '2024-10-03 16:17:24', '2024-10-03 16:17:24', 28),
(34, '20000', 0, '2024-10-03 16:17:24', '2024-10-03 16:17:24', 28),
(35, 'Roy Kambuaya', 1, '2024-10-03 16:17:24', '2024-10-03 16:17:24', 28),
(36, 'Post Malone', 1, '2024-10-03 16:17:25', '2024-10-03 16:17:25', 28),
(37, 'Agus Sudibyo', 1, '2024-10-03 16:17:25', '2024-10-03 16:17:25', 28),
(76, '8000', 0, '2024-10-06 07:25:28', '2024-10-06 07:25:28', 29),
(77, '002', 0, '2024-10-06 07:25:28', '2024-10-06 07:25:28', 29),
(78, '1994', 0, '2024-10-06 07:25:28', '2024-10-06 07:25:28', 29),
(79, '312', 0, '2024-10-06 07:25:28', '2024-10-06 07:25:28', 29),
(80, '41521010037', 0, '2024-10-06 07:25:28', '2024-10-06 07:25:28', 29),
(81, '123', 0, '2024-10-06 07:25:28', '2024-10-06 07:25:28', 29),
(82, '123321', 0, '2024-10-06 07:25:28', '2024-10-06 07:25:28', 29),
(83, '20000', 0, '2024-10-06 07:25:28', '2024-10-06 07:25:28', 29),
(84, '777999', 0, '2024-10-06 07:25:29', '2024-10-06 07:25:29', 29),
(85, '41521010176', 0, '2024-10-06 07:25:29', '2024-10-06 07:25:29', 29),
(86, '41520110044', 0, '2024-10-06 07:25:29', '2024-10-06 07:25:29', 29),
(87, 'Ucup', 1, '2024-10-06 07:25:29', '2024-10-06 07:25:29', 29),
(88, 'Subejo', 1, '2024-10-06 07:25:29', '2024-10-06 07:25:29', 29),
(89, 'Jaxx', 1, '2024-10-06 07:25:29', '2024-10-06 07:25:29', 29),
(90, '8000', 0, '2024-10-06 13:51:38', '2024-10-06 13:51:38', 30),
(91, '393700115', 0, '2024-10-06 13:51:38', '2024-10-06 13:51:38', 30),
(92, '30000', 0, '2024-10-06 13:51:38', '2024-10-06 13:51:38', 30),
(93, '20000', 0, '2024-10-06 13:51:38', '2024-10-06 13:51:38', 30),
(94, '10000', 0, '2024-10-06 13:51:39', '2024-10-06 13:51:39', 30),
(95, '004', 0, '2024-10-06 13:51:39', '2024-10-06 13:51:39', 30),
(96, '003', 0, '2024-10-06 13:51:39', '2024-10-06 13:51:39', 30),
(97, '002', 0, '2024-10-06 13:51:39', '2024-10-06 13:51:39', 30),
(98, '123123', 0, '2024-10-06 13:51:39', '2024-10-06 13:51:39', 30),
(99, '1994', 0, '2024-10-06 13:51:40', '2024-10-06 13:51:40', 30),
(100, '320950413', 0, '2024-10-06 13:51:40', '2024-10-06 13:51:40', 30),
(124, '17000', 0, '2024-10-06 16:50:01', '2024-10-06 16:50:01', 31),
(125, '8000', 0, '2024-10-06 16:50:01', '2024-10-06 16:50:01', 31),
(126, '393700115', 0, '2024-10-06 16:50:01', '2024-10-06 16:50:01', 31),
(127, '30000', 0, '2024-10-06 16:50:01', '2024-10-06 16:50:01', 31),
(128, '20000', 0, '2024-10-06 16:50:01', '2024-10-06 16:50:01', 31),
(129, '10000', 0, '2024-10-06 16:50:01', '2024-10-06 16:50:01', 31),
(130, '004', 0, '2024-10-06 16:50:01', '2024-10-06 16:50:01', 31),
(131, '003', 0, '2024-10-06 16:50:01', '2024-10-06 16:50:01', 31),
(132, '002', 0, '2024-10-06 16:50:01', '2024-10-06 16:50:01', 31),
(133, '123123', 0, '2024-10-06 16:50:01', '2024-10-06 16:50:01', 31),
(134, '41520110044', 0, '2024-10-06 16:50:01', '2024-10-06 16:50:01', 31),
(135, '76567', 0, '2024-10-06 16:50:01', '2024-10-06 16:50:01', 31),
(136, '865865', 0, '2024-10-06 16:50:02', '2024-10-06 16:50:02', 31),
(137, '1006', 0, '2024-10-06 16:50:02', '2024-10-06 16:50:02', 31),
(138, '114690444', 0, '2024-10-06 16:50:02', '2024-10-06 16:50:02', 31),
(139, '111133333', 0, '2024-10-06 16:50:02', '2024-10-06 16:50:02', 31),
(140, '09000993', 0, '2024-10-06 16:50:02', '2024-10-06 16:50:02', 31),
(141, '41521010176', 0, '2024-10-06 16:50:02', '2024-10-06 16:50:02', 31),
(142, '54321', 0, '2024-10-06 16:50:02', '2024-10-06 16:50:02', 31),
(143, '320950413', 0, '2024-10-06 16:50:02', '2024-10-06 16:50:02', 31),
(144, 'Morrow', 1, '2024-10-06 16:50:02', '2024-10-06 16:50:02', 31),
(145, '1994', 0, '2024-10-07 17:19:23', '2024-10-07 17:19:23', 32),
(146, '777999', 0, '2024-10-07 17:19:24', '2024-10-07 17:19:24', 32),
(147, '312', 0, '2024-10-07 17:19:24', '2024-10-07 17:19:24', 32),
(148, '320950413', 0, '2024-10-07 17:19:24', '2024-10-07 17:19:24', 32),
(149, '12345', 0, '2024-10-07 17:19:24', '2024-10-07 17:19:24', 32),
(150, '41521010037', 0, '2024-10-07 17:19:24', '2024-10-07 17:19:24', 32),
(151, '123', 0, '2024-10-07 17:19:24', '2024-10-07 17:19:24', 32),
(152, '41520010023', 0, '2024-10-07 17:19:24', '2024-10-07 17:19:24', 32),
(153, '415200101400', 0, '2024-10-07 17:19:24', '2024-10-07 17:19:24', 32),
(154, '08082002', 0, '2024-10-07 17:19:24', '2024-10-07 17:19:24', 32),
(155, '17000', 0, '2024-10-07 17:19:24', '2024-10-07 17:19:24', 32),
(156, '8000', 0, '2024-10-07 17:19:24', '2024-10-07 17:19:24', 32),
(157, '393700115', 0, '2024-10-07 17:19:24', '2024-10-07 17:19:24', 32),
(158, '30000', 0, '2024-10-07 17:19:24', '2024-10-07 17:19:24', 32),
(159, '20000', 0, '2024-10-07 17:19:24', '2024-10-07 17:19:24', 32),
(160, '10000', 0, '2024-10-07 17:19:24', '2024-10-07 17:19:24', 32),
(161, '004', 0, '2024-10-07 17:19:24', '2024-10-07 17:19:24', 32),
(162, '003', 0, '2024-10-07 17:19:25', '2024-10-07 17:19:25', 32),
(163, '002', 0, '2024-10-07 17:19:25', '2024-10-07 17:19:25', 32),
(164, '123123', 0, '2024-10-07 17:19:25', '2024-10-07 17:19:25', 32),
(165, '41520110044', 0, '2024-10-07 17:19:25', '2024-10-07 17:19:25', 32),
(166, '76567', 0, '2024-10-07 17:19:25', '2024-10-07 17:19:25', 32),
(167, '865865', 0, '2024-10-07 17:19:25', '2024-10-07 17:19:25', 32),
(168, '1006', 0, '2024-10-07 17:19:25', '2024-10-07 17:19:25', 32),
(169, '098098', 0, '2024-10-07 17:19:25', '2024-10-07 17:19:25', 32),
(170, '123321', 0, '2024-10-07 17:19:25', '2024-10-07 17:19:25', 32),
(171, '114690444', 0, '2024-10-07 17:19:25', '2024-10-07 17:19:25', 32),
(172, '111133333', 0, '2024-10-07 17:19:25', '2024-10-07 17:19:25', 32),
(173, '09000993', 0, '2024-10-07 17:19:25', '2024-10-07 17:19:25', 32),
(174, '41521010176', 0, '2024-10-07 17:19:25', '2024-10-07 17:19:25', 32),
(175, 'Rafi ahmand', 1, '2024-10-07 17:19:25', '2024-10-07 17:19:25', 32),
(176, 'Rafael', 1, '2024-10-07 17:19:26', '2024-10-07 17:19:26', 32),
(246, '17000', 0, '2024-10-08 15:29:13', '2024-10-08 15:29:13', 33),
(247, '8000', 0, '2024-10-08 15:29:13', '2024-10-08 15:29:13', 33),
(248, '393700115', 0, '2024-10-08 15:29:14', '2024-10-08 15:29:14', 33),
(249, '30000', 0, '2024-10-08 15:29:14', '2024-10-08 15:29:14', 33),
(250, '20000', 0, '2024-10-08 15:29:14', '2024-10-08 15:29:14', 33),
(251, '10000', 0, '2024-10-08 15:29:14', '2024-10-08 15:29:14', 33),
(252, '004', 0, '2024-10-08 15:29:14', '2024-10-08 15:29:14', 33),
(253, '003', 0, '2024-10-08 15:29:14', '2024-10-08 15:29:14', 33),
(254, '002', 0, '2024-10-08 15:29:14', '2024-10-08 15:29:14', 33),
(255, '123123', 0, '2024-10-08 15:29:14', '2024-10-08 15:29:14', 33),
(256, '1994', 0, '2024-10-08 15:29:14', '2024-10-08 15:29:14', 33),
(257, '777999', 0, '2024-10-08 15:29:14', '2024-10-08 15:29:14', 33),
(258, '312', 0, '2024-10-08 15:29:14', '2024-10-08 15:29:14', 33),
(259, '320950413', 0, '2024-10-08 15:29:14', '2024-10-08 15:29:14', 33),
(260, '12345', 0, '2024-10-08 15:29:14', '2024-10-08 15:29:14', 33),
(261, '41521010037', 0, '2024-10-08 15:29:14', '2024-10-08 15:29:14', 33),
(262, '123', 0, '2024-10-08 15:29:15', '2024-10-08 15:29:15', 33),
(263, '41520010023', 0, '2024-10-08 15:29:15', '2024-10-08 15:29:15', 33),
(264, '415200101400', 0, '2024-10-08 15:29:15', '2024-10-08 15:29:15', 33);
INSERT INTO `event_members` (`id`, `member_name`, `is_additional`, `created_at`, `updated_at`, `preorder_id`) VALUES
(265, '08082002', 0, '2024-10-08 15:29:15', '2024-10-08 15:29:15', 33),
(266, 'Adhen', 1, '2024-10-08 15:29:15', '2024-10-08 15:29:15', 33),
(267, 'Ramy', 1, '2024-10-08 15:29:15', '2024-10-08 15:29:15', 33),
(268, 'Kepin', 1, '2024-10-08 15:29:15', '2024-10-08 15:29:15', 33),
(269, '17000', 0, '2024-10-08 15:45:09', '2024-10-08 15:45:09', 34),
(270, '20000', 0, '2024-10-08 15:45:09', '2024-10-08 15:45:09', 34);

INSERT INTO `faculties` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'Fasilkom', '2024-09-01 09:15:38', '2024-09-01 09:15:38');


INSERT INTO `roles` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'Admin', '2024-07-17 13:08:26', '2024-07-17 13:08:26');
INSERT INTO `roles` (`id`, `name`, `created_at`, `updated_at`) VALUES
(2, 'User', '2024-07-17 13:08:34', '2024-07-17 13:08:34');
INSERT INTO `roles` (`id`, `name`, `created_at`, `updated_at`) VALUES
(3, 'Dekan', '2024-09-01 05:40:46', '2024-09-01 05:40:46');
INSERT INTO `roles` (`id`, `name`, `created_at`, `updated_at`) VALUES
(4, 'SDM', '2024-09-01 05:40:46', '2024-09-16 08:26:59'),
(5, 'TU', '2024-09-01 05:40:46', '2024-09-01 05:40:46');

INSERT INTO `time_break_sessions` (`id`, `session_name`, `session_open`, `session_close`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Jam Makan Siang', '08:00:00', '18:00:00', '1', '2024-07-17 14:26:01', '2024-09-19 01:22:46');
INSERT INTO `time_break_sessions` (`id`, `session_name`, `session_open`, `session_close`, `status`, `created_at`, `updated_at`) VALUES
(8, 'Jam Makan Malam', '20:00:00', '23:59:00', '1', '2024-07-18 13:06:04', '2024-09-28 16:57:31');
INSERT INTO `time_break_sessions` (`id`, `session_name`, `session_open`, `session_close`, `status`, `created_at`, `updated_at`) VALUES
(9, 'Jam makan baru', '00:00:00', '01:00:00', '1', '2024-09-16 10:41:47', '2024-09-28 16:57:16');

INSERT INTO `users` (`id`, `full_name`, `status`, `account_id`, `created_at`, `updated_at`, `unit`, `category`, `jobPosition`) VALUES
(1, 'Kevin', '1', 3, '2024-07-17 14:24:33', '2024-07-17 14:25:20', NULL, NULL, NULL);
INSERT INTO `users` (`id`, `full_name`, `status`, `account_id`, `created_at`, `updated_at`, `unit`, `category`, `jobPosition`) VALUES
(2, 'adhen1', '1', 4, '2024-07-17 14:34:17', '2024-07-17 14:43:30', NULL, NULL, NULL);
INSERT INTO `users` (`id`, `full_name`, `status`, `account_id`, `created_at`, `updated_at`, `unit`, `category`, `jobPosition`) VALUES
(3, 'bagaswara', '1', 5, '2024-07-17 14:54:04', '2024-08-01 03:32:37', NULL, NULL, NULL);
INSERT INTO `users` (`id`, `full_name`, `status`, `account_id`, `created_at`, `updated_at`, `unit`, `category`, `jobPosition`) VALUES
(4, 'Tes', '0', 6, '2024-07-18 07:29:50', '2024-07-18 15:56:08', NULL, NULL, NULL),
(5, 'coba1', '1', 7, '2024-07-18 07:36:25', '2024-07-18 07:36:43', NULL, NULL, NULL),
(6, 'Afiyati', '1', 8, '2024-07-18 07:48:05', '2024-07-18 07:48:05', NULL, NULL, NULL),
(7, 'Paul Pogba', '1', 9, '2024-07-18 13:13:48', '2024-07-18 13:13:48', NULL, NULL, NULL),
(8, 'Arda', '1', 10, '2024-07-18 13:14:03', '2024-07-18 13:14:03', NULL, NULL, NULL),
(9, 'Adhen10', '1', 11, '2024-07-18 14:49:07', '2024-07-18 14:49:07', NULL, NULL, NULL),
(10, 'cobalagi', '0', 12, '2024-07-18 14:54:22', '2024-07-18 15:56:03', NULL, NULL, NULL),
(11, 'Falah', '1', 13, '2024-07-18 15:54:04', '2024-07-18 15:54:04', NULL, NULL, NULL),
(12, 'dafaadly', '1', 14, '2024-07-18 16:30:21', '2024-07-18 16:30:21', NULL, NULL, NULL),
(13, 'Bintang Duinata', '1', 15, '2024-07-23 07:05:28', '2024-07-23 07:05:28', NULL, NULL, NULL),
(14, 'sri sul', '1', 16, '2024-07-23 07:59:17', '2024-07-23 07:59:17', NULL, NULL, NULL),
(15, 'rifq', '1', 17, '2024-08-01 13:05:29', '2024-08-01 13:05:29', NULL, NULL, NULL),
(16, 'rfiqi', '1', 18, '2024-08-02 02:46:34', '2024-08-02 02:46:34', NULL, NULL, NULL),
(17, 'Sandy M', '1', 19, '2024-08-02 03:51:08', '2024-08-02 03:51:08', NULL, NULL, NULL),
(18, 'afi', '1', 20, '2024-08-13 04:15:46', '2024-08-13 04:15:46', NULL, NULL, NULL),
(19, 'prass', '1', 24, '2024-09-09 03:49:31', '2024-09-18 09:11:17', 'Fasilkom', NULL, NULL),
(20, 'adhenfirman', '1', 25, '2024-09-09 03:53:49', '2024-09-09 03:53:49', NULL, NULL, NULL),
(21, 'testing kevin', '1', 26, '2024-09-09 16:44:58', '2024-09-09 16:44:58', NULL, NULL, NULL),
(22, 'tester', '1', 27, '2024-09-11 07:58:42', '2024-09-11 07:58:42', NULL, NULL, NULL),
(23, 'Tes', '1', 28, '2024-09-11 08:00:03', '2024-09-11 08:00:03', NULL, NULL, NULL),
(24, 'testing 1 unit', '1', 30, '2024-09-13 15:28:18', '2024-09-13 15:28:18', 'Fasilkom', NULL, NULL),
(25, 'testing 2 unit', '1', 31, '2024-09-13 15:54:53', '2024-09-13 15:54:53', 'Fasilkom', NULL, NULL),
(26, 'nama saya kepin', '1', 32, '2024-09-16 10:29:14', '2024-09-17 16:20:56', 'Fasilkom', NULL, NULL),
(27, 'bagas', '1', 33, '2024-09-18 07:20:21', '2024-09-18 09:09:38', 'Fasilkom', NULL, NULL),
(28, 'juan', '1', 34, '2024-09-19 01:23:13', '2024-09-19 01:23:13', 'fasilkom', NULL, NULL),
(29, 'afiyati', '1', 35, '2024-09-20 08:24:25', '2024-09-20 08:24:25', 'fasilkom', NULL, NULL),
(30, 'kasiyo', '1', 36, '2024-09-20 08:46:51', '2024-09-20 08:46:51', 'fasilkom', NULL, NULL),
(31, 'bayu', '1', 37, '2024-09-24 15:27:32', '2024-09-24 15:27:32', 'fasilkom', NULL, NULL),
(32, 'lambang', '1', 38, '2024-10-06 13:59:15', '2024-10-06 13:59:15', 'hukum', NULL, NULL);


/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;