const express = require('express');
const router = express.Router();
const jadwalController = require('../controllers/jadwalController');
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Apply auth middleware to all routes
router.use(protect);

// Public routes (after auth)
router.get('/', jadwalController.getAll);
router.get('/:id', jadwalController.getById);
router.get('/kelas/:kelasId', jadwalController.getByKelas);
// Tambahkan route ini setelah route getByKelas
router.get('/guru/:guruId', jadwalController.getByGuru);

// Admin only routes
router.post('/', roleMiddleware(['admin']), jadwalController.create);
router.put('/:id', roleMiddleware(['admin']), jadwalController.update);
router.delete('/:id', roleMiddleware(['admin']), jadwalController.delete);

module.exports = router;