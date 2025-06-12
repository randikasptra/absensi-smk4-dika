const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Tambahkan route untuk register yang hanya bisa diakses admin
router.post('/register', protect, roleMiddleware(['admin']), authController.register);
router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);

module.exports = router;