const express = require('express');
const router = express.Router();
const mapelController = require('../controllers/mapelController');
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Apply auth middleware to all routes
router.use(protect);

// Public routes (after auth)
router.get('/', mapelController.getAll);
// Specific route must come before generic route
router.get('/guru/:guruId', mapelController.getByGuru);
router.get('/:id', mapelController.getById);

// Admin only routes
router.post('/', roleMiddleware(['admin']), mapelController.create);
router.put('/:id', roleMiddleware(['admin']), mapelController.update);
router.delete('/:id', roleMiddleware(['admin']), mapelController.delete);

module.exports = router;