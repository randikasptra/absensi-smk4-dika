const express = require('express');
const router = express.Router();
const absensiController = require('../controllers/absensiController');
const { validate } = require('../middleware/validator');
const {
  createAbsensiSchema,
  updateDetailSchema,
  getRekapSchema,
  generateReportSchema
} = require('../validations/absensiValidation');

// POST /absensi - Membuat absensi baru
router.post(
  '/',
  validate(createAbsensiSchema),
  absensiController.create
);

// PUT /absensi/detail/:id - Mengupdate detail absensi
router.put(
  '/detail/:id',
  validate(updateDetailSchema),
  absensiController.updateDetail
);

// GET /absensi/rekap - Mendapatkan rekap absensi
router.get(
  '/rekap',
  validate(getRekapSchema),
  absensiController.getRekap
);

// POST /absensi/laporan - Generate laporan PDF
router.post(
  '/laporan',
  validate(generateReportSchema),
  absensiController.generateLaporan
);

// GET /absensi/:id - Get absensi by ID
router.get(
  '/:id',
  absensiController.getById
);



module.exports = router;