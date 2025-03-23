const express = require('express');
const router = express.Router();
const instituteController = require('../controllers/instituteController');
const { protect } = require('../middleware/auth');

// Get institute details
router.get('/', protect, instituteController.getInstitute);

// Update institute details
router.put('/', protect, instituteController.updateInstitute);

// Delete institute
router.delete('/', protect, instituteController.deleteInstitute);

// Upload logo
router.post('/upload/logo', protect, instituteController.uploadLogo);

// Upload director picture
router.post('/upload/director-picture', protect, instituteController.uploadDirectorPicture);

module.exports = router; 