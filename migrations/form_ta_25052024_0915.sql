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
  "nim" varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  "nama_lengkap" varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  "kelas_perkuliahan" varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  "kampus" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "nik" varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  "phone" varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  "email" varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  "dosen_pembimbing_ta_id" int NOT NULL,
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
  "form_id" int NOT NULL,
  PRIMARY KEY ("id"),
  KEY "dosen_pembimbing_ta_id" ("dosen_pembimbing_ta_id"),
  KEY "form_id" ("form_id"),
  CONSTRAINT "form_ta_ibfk_1" FOREIGN KEY ("dosen_pembimbing_ta_id") REFERENCES "lecturers" ("id"),
  CONSTRAINT "form_ta_ibfk_2" FOREIGN KEY ("form_id") REFERENCES "forms" ("id") ON DELETE CASCADE
);



/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;