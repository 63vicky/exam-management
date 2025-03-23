const express = require('express');
const router = express.Router();
const { getSubAdminStats, updateSubAdminStats } = require('../controllers/subAdminStatsController');
const { protect } = require('../middleware/auth');

// Get stats for a specific sub-admin
router.get('/:subAdminId', protect, getSubAdminStats);

// Update stats for a sub-admin
router.put('/:subAdminId', protect, updateSubAdminStats);

module.exports = router; 