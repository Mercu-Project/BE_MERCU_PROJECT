/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE TABLE "form_ta" (
  "id" int NOT NULL AUTO_INCREMENT,
  "dosen_pembimbing_ta_id" int DEFAULT NULL,
  "judul" varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "peminatan" varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "jenis_sidang" varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  "formular_persetujuan" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "bentuk_ta" varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  "sertifikasi_kompetensi_bnsp" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "formular_bebas_adm_keuangan" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "formular_verifikasi_dosen_pembimbing_akademik" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "bukti_bebas_pinjaman_perpustakaan" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "formular_monitoring_sertifikat_skpi" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "bukti_upload_skpi" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "surat_persetujuan_pra_sidang_ta" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "jenis_ta" varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  "skema_ta" varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "laporan_ta" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  "koord_sidang" int DEFAULT NULL,
  "ketua_penguji" int DEFAULT NULL,
  "penguji_1" int DEFAULT NULL,
  "penguji_2" int DEFAULT NULL,
  "room_id" int DEFAULT NULL,
  "student_id" int DEFAULT NULL,
  PRIMARY KEY ("id"),
  KEY "koord_sidang" ("koord_sidang"),
  KEY "ketua_penguji" ("ketua_penguji"),
  KEY "penguji_1" ("penguji_1"),
  KEY "penguji_2" ("penguji_2"),
  KEY "room_id" ("room_id"),
  KEY "dosen_pembimbing_ta_id" ("dosen_pembimbing_ta_id"),
  KEY "student_id" ("student_id"),
  CONSTRAINT "form_ta_ibfk_3" FOREIGN KEY ("koord_sidang") REFERENCES "lecturers" ("id") ON DELETE SET NULL,
  CONSTRAINT "form_ta_ibfk_4" FOREIGN KEY ("ketua_penguji") REFERENCES "lecturers" ("id") ON DELETE SET NULL,
  CONSTRAINT "form_ta_ibfk_5" FOREIGN KEY ("penguji_1") REFERENCES "lecturers" ("id") ON DELETE SET NULL,
  CONSTRAINT "form_ta_ibfk_6" FOREIGN KEY ("penguji_2") REFERENCES "lecturers" ("id") ON DELETE SET NULL,
  CONSTRAINT "form_ta_ibfk_7" FOREIGN KEY ("room_id") REFERENCES "rooms" ("id") ON DELETE SET NULL,
  CONSTRAINT "form_ta_ibfk_8" FOREIGN KEY ("dosen_pembimbing_ta_id") REFERENCES "lecturers" ("id") ON DELETE SET NULL,
  CONSTRAINT "form_ta_ibfk_9" FOREIGN KEY ("student_id") REFERENCES "students" ("id") ON DELETE SET NULL
);



/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;