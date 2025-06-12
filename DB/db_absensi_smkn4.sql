CREATE DATABASE IF NOT EXISTS db_absensi_smkn4;
USE db_absensi_smkn4;

-- Tabel users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nama_lengkap VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    role ENUM('admin', 'guru', 'siswa') NOT NULL
);

-- Tabel kelas
CREATE TABLE IF NOT EXISTS kelas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_kelas VARCHAR(20) NOT NULL,
    jurusan VARCHAR(50) NOT NULL,
    tahun_ajaran VARCHAR(20) NOT NULL
);

-- Tabel guru
CREATE TABLE IF NOT EXISTS guru (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    nip VARCHAR(20) NOT NULL,
    jenis_kelamin ENUM('L', 'P') NOT NULL,
    alamat TEXT,
    no_telp VARCHAR(15),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel siswa
CREATE TABLE IF NOT EXISTS siswa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    nis VARCHAR(20) NOT NULL,
    kelas_id INT NOT NULL,
    jenis_kelamin ENUM('L', 'P') NOT NULL,
    alamat TEXT,
    no_telp VARCHAR(15),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE CASCADE
);

-- Tabel mata_pelajaran
CREATE TABLE IF NOT EXISTS mata_pelajaran (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    kode VARCHAR(20) NOT NULL,
    guru_id INT,
    FOREIGN KEY (guru_id) REFERENCES guru(id) ON DELETE SET NULL
);

-- Tabel jadwal
CREATE TABLE IF NOT EXISTS jadwal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hari ENUM('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu') NOT NULL,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    mata_pelajaran_id INT NOT NULL,
    kelas_id INT NOT NULL,
    FOREIGN KEY (mata_pelajaran_id) REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
    FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE CASCADE
);

-- Tabel absensi
CREATE TABLE IF NOT EXISTS absensi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jadwal_id INT NOT NULL,
    tanggal DATE NOT NULL,
    FOREIGN KEY (jadwal_id) REFERENCES jadwal(id) ON DELETE CASCADE
);

-- Tabel detail_absensi
CREATE TABLE IF NOT EXISTS detail_absensi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    absensi_id INT NOT NULL,
    siswa_id INT NOT NULL,
    status ENUM('hadir', 'izin', 'sakit', 'alpa') NOT NULL,
    keterangan TEXT,
    FOREIGN KEY (absensi_id) REFERENCES absensi(id) ON DELETE CASCADE,
    FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS rekap_absensi_semester (
  id INT AUTO_INCREMENT PRIMARY KEY,
  semester VARCHAR(10) NOT NULL,
  tahun_ajaran VARCHAR(20) NOT NULL,
  kelas_id INT NOT NULL,
  mata_pelajaran_id INT NOT NULL,
  siswa_id INT NOT NULL,
  total_pertemuan INT NOT NULL DEFAULT 0,
  total_hadir INT NOT NULL DEFAULT 0,
  total_sakit INT NOT NULL DEFAULT 0,
  total_izin INT NOT NULL DEFAULT 0,
  total_alpa INT NOT NULL DEFAULT 0,
  persentase_kehadiran DECIMAL(5,2) NOT NULL DEFAULT 0,
  periode_mulai DATE NOT NULL,
  periode_selesai DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE CASCADE,
  FOREIGN KEY (mata_pelajaran_id) REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
  FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE CASCADE,
  UNIQUE KEY unique_rekap_semester (semester, tahun_ajaran, kelas_id, mata_pelajaran_id, siswa_id)
);
CREATE TABLE rekap_absensi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tanggal DATE NOT NULL,
  jadwal_id INT NOT NULL,
  kelas_id INT NOT NULL,
  mata_pelajaran_id INT NOT NULL,
  guru_id INT NOT NULL,
  total_siswa INT NOT NULL DEFAULT 0,
  total_hadir INT NOT NULL DEFAULT 0,
  total_sakit INT NOT NULL DEFAULT 0,
  total_izin INT NOT NULL DEFAULT 0,
  total_alpa INT NOT NULL DEFAULT 0,
  persentase_kehadiran DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (jadwal_id) REFERENCES jadwal(id) ON DELETE CASCADE,
  FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE CASCADE,
  FOREIGN KEY (mata_pelajaran_id) REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
  FOREIGN KEY (guru_id) REFERENCES guru(id) ON DELETE CASCADE,
  UNIQUE KEY unique_rekap (tanggal, jadwal_id)
);
