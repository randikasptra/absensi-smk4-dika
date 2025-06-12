const express = require('express');
const router = express.Router();
const guruController = require('../controllers/guruController');
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validateGuru } = require('../utils/validators');

router.use(protect);

router.get('/', roleMiddleware(['admin']), guruController.getAllGuru);
router.get('/:id', roleMiddleware(['admin', 'guru']), guruController.getGuruById);
router.post('/', roleMiddleware(['admin']), validateGuru, guruController.createGuru);
router.put('/:id', roleMiddleware(['admin']), validateGuru, guruController.updateGuru);
router.delete('/:id', roleMiddleware(['admin']), guruController.deleteGuru);

module.exports = router;