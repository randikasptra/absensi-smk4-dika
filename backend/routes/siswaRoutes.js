const express = require('express');
const router = express.Router();
const siswaController = require('../controllers/siswaController');
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validateSiswa } = require('../utils/validators');

router.use(protect);

router.get('/', roleMiddleware(['admin', 'guru']), siswaController.getAllSiswa);
router.get('/kelas/:kelasId', roleMiddleware(['admin', 'guru']), siswaController.getSiswaByKelas);
router.get('/:id', roleMiddleware(['admin', 'guru', 'siswa']), siswaController.getSiswaById);
router.post('/', roleMiddleware(['admin']), validateSiswa, siswaController.createSiswa);
router.put('/:id', roleMiddleware(['admin']), validateSiswa, siswaController.updateSiswa);
router.delete('/:id', roleMiddleware(['admin']), siswaController.deleteSiswa);

module.exports = router;