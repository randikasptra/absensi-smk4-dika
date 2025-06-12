const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validateUser } = require('../utils/validators');

router.use(protect);

router.get('/', roleMiddleware(['admin']), userController.getAll);
router.get('/:id', roleMiddleware(['admin']), userController.getById);
router.get('/:userId/guru', userController.getGuruByUserId);
router.get('/:userId/siswa', userController.getSiswaByUserId);
router.put('/:id', roleMiddleware(['admin']), ...validateUser, userController.update);
router.delete('/:id', roleMiddleware(['admin']), userController.delete);

module.exports = router;