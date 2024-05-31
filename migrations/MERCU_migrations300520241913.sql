/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE TABLE "academic_years" (
  "id" int NOT NULL AUTO_INCREMENT,
  "academic_year" varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  "semester" enum('Genap','Ganjil') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE "admins" (
  "id" int NOT NULL AUTO_INCREMENT,
  "full_name" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "code" varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  "prodi_id" int DEFAULT NULL,
  "user_id" int DEFAULT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  KEY "prodi_id" ("prodi_id"),
  KEY "user_id" ("user_id"),
  CONSTRAINT "admins_ibfk_1" FOREIGN KEY ("prodi_id") REFERENCES "prodi" ("id") ON DELETE SET NULL,
  CONSTRAINT "admins_ibfk_2" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
);

CREATE TABLE "canteen_scans" (
  "id" int NOT NULL AUTO_INCREMENT,
  "user_id" int NOT NULL,
  "scanned_at" time DEFAULT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  KEY "user_id" ("user_id"),
  CONSTRAINT "canteen_scans_ibfk_1" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
);

CREATE TABLE "faculties" (
  "id" int NOT NULL AUTO_INCREMENT,
  "name" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE TABLE "form_academic_years" (
  "form_id" int NOT NULL,
  "academic_year_id" int NOT NULL,
  "eff_date" date DEFAULT NULL,
  "end_eff_date" date DEFAULT NULL,
  "prodi_id" int DEFAULT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("form_id","academic_year_id"),
  KEY "academic_year_id" ("academic_year_id"),
  KEY "prodi_id" ("prodi_id"),
  CONSTRAINT "form_academic_years_ibfk_1" FOREIGN KEY ("form_id") REFERENCES "forms" ("id"),
  CONSTRAINT "form_academic_years_ibfk_2" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years" ("id"),
  CONSTRAINT "form_academic_years_ibfk_3" FOREIGN KEY ("prodi_id") REFERENCES "prodi" ("id")
);

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
  "form_id" int NOT NULL,
  "koord_sidang" int DEFAULT NULL,
  "ketua_penguji" int DEFAULT NULL,
  "penguji_1" int DEFAULT NULL,
  "penguji_2" int DEFAULT NULL,
  "room_id" int DEFAULT NULL,
  "student_id" int DEFAULT NULL,
  PRIMARY KEY ("id"),
  KEY "form_id" ("form_id"),
  KEY "koord_sidang" ("koord_sidang"),
  KEY "ketua_penguji" ("ketua_penguji"),
  KEY "penguji_1" ("penguji_1"),
  KEY "penguji_2" ("penguji_2"),
  KEY "room_id" ("room_id"),
  KEY "dosen_pembimbing_ta_id" ("dosen_pembimbing_ta_id"),
  KEY "student_id" ("student_id"),
  CONSTRAINT "form_ta_ibfk_2" FOREIGN KEY ("form_id") REFERENCES "forms" ("id") ON DELETE CASCADE,
  CONSTRAINT "form_ta_ibfk_3" FOREIGN KEY ("koord_sidang") REFERENCES "lecturers" ("id") ON DELETE SET NULL,
  CONSTRAINT "form_ta_ibfk_4" FOREIGN KEY ("ketua_penguji") REFERENCES "lecturers" ("id") ON DELETE SET NULL,
  CONSTRAINT "form_ta_ibfk_5" FOREIGN KEY ("penguji_1") REFERENCES "lecturers" ("id") ON DELETE SET NULL,
  CONSTRAINT "form_ta_ibfk_6" FOREIGN KEY ("penguji_2") REFERENCES "lecturers" ("id") ON DELETE SET NULL,
  CONSTRAINT "form_ta_ibfk_7" FOREIGN KEY ("room_id") REFERENCES "rooms" ("id") ON DELETE SET NULL,
  CONSTRAINT "form_ta_ibfk_8" FOREIGN KEY ("dosen_pembimbing_ta_id") REFERENCES "lecturers" ("id") ON DELETE SET NULL,
  CONSTRAINT "form_ta_ibfk_9" FOREIGN KEY ("student_id") REFERENCES "students" ("id") ON DELETE SET NULL
);

CREATE TABLE "forms" (
  "id" int NOT NULL AUTO_INCREMENT,
  "form_type" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE TABLE "lecturers" (
  "id" int NOT NULL AUTO_INCREMENT,
  "full_name" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "jabatan_akademik" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "nama_bank" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "rekening_bank" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "atas_nama_bank" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "user_id" int DEFAULT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  KEY "user_id" ("user_id"),
  CONSTRAINT "lecturers_ibfk_1" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
);

CREATE TABLE "prodi" (
  "id" int NOT NULL AUTO_INCREMENT,
  "name" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  "faculty_id" int DEFAULT NULL,
  PRIMARY KEY ("id"),
  KEY "faculty_id" ("faculty_id"),
  CONSTRAINT "prodi_ibfk_1" FOREIGN KEY ("faculty_id") REFERENCES "faculties" ("id") ON DELETE CASCADE
);

CREATE TABLE "roles" (
  "id" int NOT NULL AUTO_INCREMENT,
  "name" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE TABLE "rooms" (
  "id" int NOT NULL AUTO_INCREMENT,
  "name" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE KEY "room_name" ("name")
);

CREATE TABLE "students" (
  "id" int NOT NULL AUTO_INCREMENT,
  "full_name" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "email" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "phone" varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  "prodi_id" int DEFAULT NULL,
  "kampus" varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  "kelas" varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  "user_id" int NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  "nik" varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY ("id"),
  UNIQUE KEY "email" ("email"),
  KEY "user_id" ("user_id"),
  KEY "prodi_id" ("prodi_id"),
  CONSTRAINT "students_ibfk_1" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
  CONSTRAINT "students_ibfk_2" FOREIGN KEY ("prodi_id") REFERENCES "prodi" ("id") ON DELETE SET NULL
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
  "username" varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  "password" varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  "role_id" int DEFAULT NULL,
  PRIMARY KEY ("id"),
  UNIQUE KEY "username" ("username"),
  KEY "role_id" ("role_id"),
  CONSTRAINT "users_ibfk_1" FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON DELETE SET NULL
);



/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;