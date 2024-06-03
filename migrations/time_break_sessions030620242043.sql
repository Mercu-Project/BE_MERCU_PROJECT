/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

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

INSERT INTO `time_break_sessions` (`id`, `session_name`, `session_open`, `session_close`, `status`, `created_at`, `updated_at`) VALUES
(4, 'Jam Makan Pagi', '07:00:00', '08:00:00', '0', '2024-05-12 11:30:16', '2024-05-24 16:56:15');
INSERT INTO `time_break_sessions` (`id`, `session_name`, `session_open`, `session_close`, `status`, `created_at`, `updated_at`) VALUES
(6, 'Jam Makan Sahur', '03:00:00', '04:30:00', '0', '2024-05-12 11:31:32', '2024-05-24 16:56:10');
INSERT INTO `time_break_sessions` (`id`, `session_name`, `session_open`, `session_close`, `status`, `created_at`, `updated_at`) VALUES
(14, 'Jam Makan Dora', '06:00:00', '08:00:00', '1', '2024-05-19 07:10:13', '2024-05-20 14:04:39');
INSERT INTO `time_break_sessions` (`id`, `session_name`, `session_open`, `session_close`, `status`, `created_at`, `updated_at`) VALUES
(15, 'Jam Lapar', '11:00:00', '14:00:00', '1', '2024-05-19 14:06:29', '2024-05-19 14:06:29');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;