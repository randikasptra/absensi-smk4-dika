const express = require('express');
const router = express.Router();
const kelasController = require('../controllers/kelasController');
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validateKelas } = require('../utils/validators');

router.use(protect);

router.get('/', roleMiddleware(['admin', 'guru']), kelasController.getAllKelas);
router.get('/:id', roleMiddleware(['admin', 'guru', 'siswa']), kelasController.getKelasById);
router.post('/', roleMiddleware(['admin']), validateKelas, kelasController.createKelas);
router.put('/:id', roleMiddleware(['admin']), validateKelas, kelasController.updateKelas);
router.delete('/:id', roleMiddleware(['admin']), kelasController.deleteKelas);

module.exports = router;