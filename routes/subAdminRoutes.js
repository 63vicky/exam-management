const express = require('express');
const router = express.Router();
const subAdminController = require('../controllers/subAdminController');
const { protect , authorize} = require('../middleware/auth');



// Get all sub-admins
router.get('/', protect, authorize('admin'),subAdminController.getAllSubAdmins);

// Get single sub-admin
router.get('/:id',protect, authorize('admin'), subAdminController.getSubAdmin);

// Create sub-admin
router.post('/',protect, authorize('admin'), subAdminController.createSubAdmin);

// Update sub-admin
router.put('/:id',protect, authorize('admin'), subAdminController.updateSubAdmin);

// Delete sub-admin
router.delete('/:id',protect, authorize('admin'), subAdminController.deleteSubAdmin);

module.exports = router; 