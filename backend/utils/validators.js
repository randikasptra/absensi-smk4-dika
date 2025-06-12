const { body, param, query, validationResult } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Guru validation rules
const validateGuru = [
  body('nip').notEmpty().withMessage('NIP wajib diisi'),
  body('nama_lengkap').notEmpty().withMessage('Nama wajib diisi'),
  body('email').isEmail().withMessage('Format email tidak valid'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password minimal 6 karakter'),
  validate
];

// Siswa validation rules
const validateSiswa = [
  body('nis').notEmpty().withMessage('NIS wajib diisi'),
  body('nama_lengkap').notEmpty().withMessage('Nama wajib diisi'),
  body('kelas_id').notEmpty().withMessage('Kelas wajib diisi'),
  body('email').isEmail().withMessage('Format email tidak valid'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password minimal 6 karakter'),
  validate
];

// Kelas validation rules
// Kelas validation rules
const validateKelas = [
  body('nama_kelas').notEmpty().withMessage('Nama kelas wajib diisi'),
  body('jurusan').notEmpty().withMessage('Jurusan wajib diisi'),
  body('tahun_ajaran').notEmpty().withMessage('Tahun ajaran wajib diisi'),
  validate
];

// Mata Pelajaran validation rules
const validateMataPelajaran = [
  body('nama').notEmpty().withMessage('Nama mata pelajaran wajib diisi'),
  body('guruId').notEmpty().withMessage('Guru pengajar wajib diisi'),
  validate
];

// Jadwal validation rules
const validateJadwal = [
  body('mataPelajaranId').notEmpty().withMessage('Mata pelajaran wajib diisi'),
  body('kelasId').notEmpty().withMessage('Kelas wajib diisi'),
  body('hari').notEmpty().withMessage('Hari wajib diisi'),
  body('jamMulai').notEmpty().withMessage('Jam mulai wajib diisi'),
  body('jamSelesai').notEmpty().withMessage('Jam selesai wajib diisi'),
  validate
];

// Absensi validation rules
const validateAbsensi = [
  body('jadwalId').notEmpty().withMessage('Jadwal wajib diisi'),
  body('tanggal').notEmpty().withMessage('Tanggal wajib diisi'),
  body('detailAbsensi').isArray().withMessage('Detail absensi harus berupa array'),
  body('detailAbsensi.*.siswaId').notEmpty().withMessage('ID siswa wajib diisi'),
  body('detailAbsensi.*.status').isIn(['hadir', 'sakit', 'izin', 'alpha']).withMessage('Status tidak valid'),
  validate
];

// User validation rules
const validateUser = [
  body('email').isEmail().withMessage('Format email tidak valid'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password minimal 6 karakter'),
  body('role').isIn(['admin', 'guru', 'siswa']).withMessage('Role tidak valid'),
  validate
];

module.exports = {
  validateUser,
  validateGuru,
  validateSiswa,
  validateKelas,
  validateMataPelajaran,
  validateJadwal,
  validateAbsensi
};