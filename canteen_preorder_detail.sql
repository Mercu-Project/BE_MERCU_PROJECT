/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

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

INSERT INTO `canteen_preorder_detail` (`id`, `preorder_id`, `order_type`, `qty`, `created_at`, `updated_at`, `price`) VALUES
(152, 35, 'Snack Basic', 10, '2024-10-08 17:51:27', '2024-10-08 17:52:58', 10000);
INSERT INTO `canteen_preorder_detail` (`id`, `preorder_id`, `order_type`, `qty`, `created_at`, `updated_at`, `price`) VALUES
(153, 35, 'Lunch Basic', 13, '2024-10-08 17:51:27', '2024-10-08 17:51:27', 25000);
INSERT INTO `canteen_preorder_detail` (`id`, `preorder_id`, `order_type`, `qty`, `created_at`, `updated_at`, `price`) VALUES
(156, 36, 'Snack Medium', 1000, '2024-10-09 03:34:24', '2024-10-09 03:34:24', 10000);
INSERT INTO `canteen_preorder_detail` (`id`, `preorder_id`, `order_type`, `qty`, `created_at`, `updated_at`, `price`) VALUES
(157, 36, 'Snack Premium', 100, '2024-10-09 03:34:24', '2024-10-09 03:34:24', 13000);

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;