const express = require('express');
const router = express.Router();
const {
  getSubAdminStats,
  updateSubAdminStats,
  getPassFailStats,
} = require('../controllers/subAdminStatsController');
const { protect } = require('../middleware/auth');

// Get stats for a specific sub-admin
router.get('/:subAdminId', protect, getSubAdminStats);

// Update stats for a sub-admin
router.put('/:subAdminId', protect, updateSubAdminStats);

// Get pass/fail statistics
router.get('/stats/pass-fail', protect, getPassFailStats);

module.exports = router;
