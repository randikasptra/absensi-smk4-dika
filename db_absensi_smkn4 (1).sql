-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 11, 2025 at 03:27 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_absensi_smkn4`
--

-- --------------------------------------------------------

--
-- Table structure for table `absensi`
--

CREATE TABLE `absensi` (
  `id` int(11) NOT NULL,
  `jadwal_id` int(11) NOT NULL,
  `tanggal` date NOT NULL,
  `minggu` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `absensi`
--

INSERT INTO `absensi` (`id`, `jadwal_id`, `tanggal`, `minggu`) VALUES
(1, 2, '2025-06-10', 1),
(2, 2, '2025-06-10', 1),
(3, 2, '2025-06-10', 1),
(4, 1, '2025-07-15', 1);

-- --------------------------------------------------------

--
-- Table structure for table `detail_absensi`
--

CREATE TABLE `detail_absensi` (
  `id` int(11) NOT NULL,
  `absensi_id` int(11) NOT NULL,
  `siswa_id` int(11) NOT NULL,
  `status` enum('hadir','izin','sakit','alpa') NOT NULL,
  `keterangan` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `detail_absensi`
--

INSERT INTO `detail_absensi` (`id`, `absensi_id`, `siswa_id`, `status`, `keterangan`) VALUES
(1, 1, 1, 'hadir', NULL),
(2, 1, 2, 'hadir', NULL),
(3, 1, 1, 'hadir', NULL),
(4, 1, 2, 'hadir', NULL),
(5, 1, 1, 'izin', NULL),
(6, 1, 2, 'sakit', NULL),
(7, 1, 1, 'hadir', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `guru`
--

CREATE TABLE `guru` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `nip` varchar(20) NOT NULL,
  `jenis_kelamin` enum('L','P') NOT NULL,
  `alamat` text DEFAULT NULL,
  `no_telp` varchar(15) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `guru`
--

INSERT INTO `guru` (`id`, `user_id`, `nip`, `jenis_kelamin`, `alamat`, `no_telp`) VALUES
(1, 2, '198501152010011001', 'P', 'Tasikmalaya', '081235551432'),
(2, 3, '198501152010011002', 'P', 'Tasikmalaya', '081235553345'),
(3, 4, '198501152010011003', 'L', 'Tasikmalaya', '081235552243');

-- --------------------------------------------------------

--
-- Table structure for table `jadwal`
--

CREATE TABLE `jadwal` (
  `id` int(11) NOT NULL,
  `hari` enum('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu') NOT NULL,
  `jam_mulai` time NOT NULL,
  `jam_selesai` time NOT NULL,
  `mata_pelajaran_id` int(11) NOT NULL,
  `kelas_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `jadwal`
--

INSERT INTO `jadwal` (`id`, `hari`, `jam_mulai`, `jam_selesai`, `mata_pelajaran_id`, `kelas_id`) VALUES
(1, 'Senin', '12:55:00', '13:55:00', 1, 1),
(2, 'Selasa', '12:56:00', '12:56:00', 2, 1),
(3, 'Rabu', '12:56:00', '13:56:00', 3, 1),
(4, 'Kamis', '12:57:00', '13:57:00', 4, 2),
(5, 'Jumat', '12:57:00', '13:57:00', 5, 2),
(6, 'Sabtu', '12:58:00', '13:58:00', 6, 2),
(7, 'Senin', '12:59:00', '13:59:00', 6, 3),
(8, 'Selasa', '12:59:00', '13:59:00', 5, 3),
(9, 'Rabu', '12:59:00', '13:00:00', 4, 3),
(10, 'Senin', '08:00:00', '10:00:00', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `kelas`
--

CREATE TABLE `kelas` (
  `id` int(11) NOT NULL,
  `nama_kelas` varchar(20) NOT NULL,
  `jurusan` varchar(50) NOT NULL,
  `tahun_ajaran` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kelas`
--

INSERT INTO `kelas` (`id`, `nama_kelas`, `jurusan`, `tahun_ajaran`) VALUES
(1, 'X-A', 'TKJ', '2025/2026'),
(2, 'X-B', 'TKJ', '2025/2026'),
(3, 'X-C', 'TKJ', '2025/2026');

-- --------------------------------------------------------

--
-- Table structure for table `mata_pelajaran`
--

CREATE TABLE `mata_pelajaran` (
  `id` int(11) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `kode` varchar(20) NOT NULL,
  `guru_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mata_pelajaran`
--

INSERT INTO `mata_pelajaran` (`id`, `nama`, `kode`, `guru_id`) VALUES
(1, 'TEKNIK JARINGAN KOMPUTER', 'TKJ01', 3),
(2, 'REKAYASA PERANGKAT LUNAK', 'RPL01', 2),
(3, 'PEMOGRAMAN WEB', 'PW01', 1),
(4, 'MATEMATIKA', 'MTK01', 1),
(5, 'PANCASILA', 'PN01', 2),
(6, 'PENDIDIKAN AGAMA ISLAM', 'PAI01', 3);

-- --------------------------------------------------------

--
-- Table structure for table `rekap_absensi`
--

CREATE TABLE `rekap_absensi` (
  `id` int(11) NOT NULL,
  `tanggal` date NOT NULL,
  `jadwal_id` int(11) NOT NULL,
  `kelas_id` int(11) NOT NULL,
  `mata_pelajaran_id` int(11) NOT NULL,
  `guru_id` int(11) NOT NULL,
  `total_siswa` int(11) NOT NULL DEFAULT 0,
  `total_hadir` int(11) NOT NULL DEFAULT 0,
  `total_sakit` int(11) NOT NULL DEFAULT 0,
  `total_izin` int(11) NOT NULL DEFAULT 0,
  `total_alpa` int(11) NOT NULL DEFAULT 0,
  `persentase_kehadiran` decimal(5,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rekap_absensi`
--

INSERT INTO `rekap_absensi` (`id`, `tanggal`, `jadwal_id`, `kelas_id`, `mata_pelajaran_id`, `guru_id`, `total_siswa`, `total_hadir`, `total_sakit`, `total_izin`, `total_alpa`, `persentase_kehadiran`, `created_at`, `updated_at`) VALUES
(1, '2025-06-10', 2, 1, 2, 2, 2, 2, 0, 0, 0, 100.00, '2025-06-10 07:10:51', '2025-06-10 07:10:51');

-- --------------------------------------------------------

--
-- Table structure for table `rekap_absensi_semester`
--

CREATE TABLE `rekap_absensi_semester` (
  `id` int(11) NOT NULL,
  `semester` varchar(10) NOT NULL,
  `tahun_ajaran` varchar(20) NOT NULL,
  `kelas_id` int(11) NOT NULL,
  `mata_pelajaran_id` int(11) NOT NULL,
  `siswa_id` int(11) NOT NULL,
  `total_pertemuan` int(11) NOT NULL DEFAULT 0,
  `total_hadir` int(11) NOT NULL DEFAULT 0,
  `total_sakit` int(11) NOT NULL DEFAULT 0,
  `total_izin` int(11) NOT NULL DEFAULT 0,
  `total_alpa` int(11) NOT NULL DEFAULT 0,
  `persentase_kehadiran` decimal(5,2) NOT NULL DEFAULT 0.00,
  `periode_mulai` date NOT NULL,
  `periode_selesai` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rekap_absensi_semester`
--

INSERT INTO `rekap_absensi_semester` (`id`, `semester`, `tahun_ajaran`, `kelas_id`, `mata_pelajaran_id`, `siswa_id`, `total_pertemuan`, `total_hadir`, `total_sakit`, `total_izin`, `total_alpa`, `persentase_kehadiran`, `periode_mulai`, `periode_selesai`, `created_at`, `updated_at`) VALUES
(1, '1', '2025', 1, 2, 2, 0, 0, 0, 0, 0, 0.00, '2025-07-01', '2025-12-31', '2025-06-10 07:11:23', '2025-06-10 09:11:05'),
(2, '1', '2025', 1, 2, 1, 0, 0, 0, 0, 0, 0.00, '2025-07-01', '2025-12-31', '2025-06-10 07:11:23', '2025-06-10 09:11:05'),
(5, '1', '2025', 1, 4, 2, 0, 0, 0, 0, 0, 0.00, '2025-07-01', '2025-12-31', '2025-06-10 11:41:14', '2025-06-10 11:41:14'),
(6, '1', '2025', 1, 4, 1, 0, 0, 0, 0, 0, 0.00, '2025-07-01', '2025-12-31', '2025-06-10 11:41:14', '2025-06-10 11:41:14');

-- --------------------------------------------------------

--
-- Table structure for table `siswa`
--

CREATE TABLE `siswa` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `nis` varchar(20) NOT NULL,
  `kelas_id` int(11) NOT NULL,
  `jenis_kelamin` enum('L','P') NOT NULL,
  `alamat` text DEFAULT NULL,
  `no_telp` varchar(15) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `siswa`
--

INSERT INTO `siswa` (`id`, `user_id`, `nis`, `kelas_id`, `jenis_kelamin`, `alamat`, `no_telp`) VALUES
(1, 5, '2023001', 1, 'P', 'Tasikmalaya', '081235551211'),
(2, 6, '2023002', 1, 'L', 'Tasikmalaya', '081235551244'),
(3, 7, '2023003', 2, 'L', 'Tasikamalaya', '081235553346'),
(4, 8, '2023004', 2, 'P', 'Tasikmalaya', '081235552246'),
(5, 9, '2023005', 3, 'L', 'Tasikmalaya', '081235551421'),
(6, 10, '2023006', 3, 'P', 'Tasikmalaya', '081235553355');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `role` enum('admin','guru','siswa') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `nama_lengkap`, `email`, `role`) VALUES
(1, 'dika', '$2b$10$IeVNVcZ/rI5yrpBiXI/9r.JhqX7H.ePGaaqx1dZxStsVTO.DCBGEW', 'Dika Marasidik', 'dika@example.com', 'admin'),
(2, 'yanti', '$2b$10$fWLKwMOaaihZGRBpq3raAuprDfOuHsgtoePnoVygnQNM8/k1LPp0S', 'Yanti Susanti', 'yanti1233@gamil.com', 'guru'),
(3, 'noneng', '$2b$10$NKCv3Nw7nRDTNoiZAGFFBeQw6KQ34R04DcJbW5bggqKHSdKbx1SUu', 'Noneng Cartika', 'noneng@example.com', 'guru'),
(4, 'didi', '$2b$10$jdjVIe/zr267cNUSFNPTCejygr1VK5UtPDSj5eQzKtryNuPbyaPsm', 'Didi Wahyudin', 'didi@example.com', 'guru'),
(5, 'rina', '$2b$10$cnYaS5aFFZ4ssGfR3SJl6uuIGVIyJREnWzcvJYk7Kb0/1wJUndqI6', 'Rina Nurani', 'rina1233@gamil.com', 'siswa'),
(6, 'dedi', '$2b$10$0ajz77G.wjcibSP2F7/AxuZjqeZcXl3r9s8w12B1ORslwvj/icdoe', 'Dedi kurnia', 'dedi@gmail.com', 'siswa'),
(7, 'iman', '$2b$10$adCU/N8Rou1knE10nikZAuAy7jZWwwvJSf.cunzenY8T4kURMzIky', 'Iman Satrio', 'iman@example.com', 'siswa'),
(8, 'lilis', '$2b$10$bBt4XEHvaUS2ACCs.1XA5.7FMNyKfXJxjr31bSkcrFdn70svQBeeC', 'Lilis sukaesih', 'lilis@gmail.com', 'siswa'),
(9, 'deden', '$2b$10$y5eMpjE70PfRzGXWT1IKM.49nwBS6B15Wk7bUvh3zF5JHV2HRdwN2', 'Deden Sunandar', 'deden@gmail.com', 'siswa'),
(10, 'imas', '$2b$10$vZfLBQg.9xHi4IIsIzPq2urFUfaANEaZU0W4oEISdsu39WP3BcMX6', 'Imas Ningsih', 'imas@gmail.com', 'siswa');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `absensi`
--
ALTER TABLE `absensi`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jadwal_id` (`jadwal_id`);

--
-- Indexes for table `detail_absensi`
--
ALTER TABLE `detail_absensi`
  ADD PRIMARY KEY (`id`),
  ADD KEY `absensi_id` (`absensi_id`),
  ADD KEY `siswa_id` (`siswa_id`);

--
-- Indexes for table `guru`
--
ALTER TABLE `guru`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `jadwal`
--
ALTER TABLE `jadwal`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mata_pelajaran_id` (`mata_pelajaran_id`),
  ADD KEY `kelas_id` (`kelas_id`);

--
-- Indexes for table `kelas`
--
ALTER TABLE `kelas`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `mata_pelajaran`
--
ALTER TABLE `mata_pelajaran`
  ADD PRIMARY KEY (`id`),
  ADD KEY `guru_id` (`guru_id`);

--
-- Indexes for table `rekap_absensi`
--
ALTER TABLE `rekap_absensi`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_rekap` (`tanggal`,`jadwal_id`),
  ADD KEY `jadwal_id` (`jadwal_id`),
  ADD KEY `kelas_id` (`kelas_id`),
  ADD KEY `mata_pelajaran_id` (`mata_pelajaran_id`),
  ADD KEY `guru_id` (`guru_id`);

--
-- Indexes for table `rekap_absensi_semester`
--
ALTER TABLE `rekap_absensi_semester`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_rekap_semester` (`semester`,`tahun_ajaran`,`kelas_id`,`mata_pelajaran_id`,`siswa_id`),
  ADD KEY `kelas_id` (`kelas_id`),
  ADD KEY `mata_pelajaran_id` (`mata_pelajaran_id`),
  ADD KEY `siswa_id` (`siswa_id`);

--
-- Indexes for table `siswa`
--
ALTER TABLE `siswa`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `kelas_id` (`kelas_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `absensi`
--
ALTER TABLE `absensi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `detail_absensi`
--
ALTER TABLE `detail_absensi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `guru`
--
ALTER TABLE `guru`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `jadwal`
--
ALTER TABLE `jadwal`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `kelas`
--
ALTER TABLE `kelas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `mata_pelajaran`
--
ALTER TABLE `mata_pelajaran`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `rekap_absensi`
--
ALTER TABLE `rekap_absensi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `rekap_absensi_semester`
--
ALTER TABLE `rekap_absensi_semester`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `siswa`
--
ALTER TABLE `siswa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `absensi`
--
ALTER TABLE `absensi`
  ADD CONSTRAINT `absensi_ibfk_1` FOREIGN KEY (`jadwal_id`) REFERENCES `jadwal` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `detail_absensi`
--
ALTER TABLE `detail_absensi`
  ADD CONSTRAINT `detail_absensi_ibfk_1` FOREIGN KEY (`absensi_id`) REFERENCES `absensi` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `detail_absensi_ibfk_2` FOREIGN KEY (`siswa_id`) REFERENCES `siswa` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `guru`
--
ALTER TABLE `guru`
  ADD CONSTRAINT `guru_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `jadwal`
--
ALTER TABLE `jadwal`
  ADD CONSTRAINT `jadwal_ibfk_1` FOREIGN KEY (`mata_pelajaran_id`) REFERENCES `mata_pelajaran` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `jadwal_ibfk_2` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `mata_pelajaran`
--
ALTER TABLE `mata_pelajaran`
  ADD CONSTRAINT `mata_pelajaran_ibfk_1` FOREIGN KEY (`guru_id`) REFERENCES `guru` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `rekap_absensi`
--
ALTER TABLE `rekap_absensi`
  ADD CONSTRAINT `rekap_absensi_ibfk_1` FOREIGN KEY (`jadwal_id`) REFERENCES `jadwal` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rekap_absensi_ibfk_2` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rekap_absensi_ibfk_3` FOREIGN KEY (`mata_pelajaran_id`) REFERENCES `mata_pelajaran` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rekap_absensi_ibfk_4` FOREIGN KEY (`guru_id`) REFERENCES `guru` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rekap_absensi_semester`
--
ALTER TABLE `rekap_absensi_semester`
  ADD CONSTRAINT `rekap_absensi_semester_ibfk_1` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rekap_absensi_semester_ibfk_2` FOREIGN KEY (`mata_pelajaran_id`) REFERENCES `mata_pelajaran` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rekap_absensi_semester_ibfk_3` FOREIGN KEY (`siswa_id`) REFERENCES `siswa` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `siswa`
--
ALTER TABLE `siswa`
  ADD CONSTRAINT `siswa_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `siswa_ibfk_2` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
