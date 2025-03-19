const express = require('express');
const router = express.Router();
const paperController = require('../controllers/paperController');
const { protect } = require('../middleware/auth');

// Apply protect middleware to all routes
router.use(protect);

// Paper routes
router.post('/', paperController.createPaper);
router.get('/', paperController.getAllPapers);
router.get('/:id', paperController.getPaperById);
router.put('/:id', paperController.updatePaper);
router.delete('/:id', paperController.deletePaper);
router.patch('/:id/status', paperController.updatePaperStatus);

module.exports = router; 