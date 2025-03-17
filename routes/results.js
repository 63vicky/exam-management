const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');

// Get User's Results
router.get('/my-results', auth, async (req, res) => {
  const results = await Result.find({ user: req.user.id })
    .populate('exam')
    .sort({ createdAt: -1 });
  res.json(results);
});

// Get All Results (Admin Only)
router.get('/all', [auth, adminCheck], async (req, res) => {
  const results = await Result.find()
    .populate('user', 'name email')
    .populate('exam', 'title');
  res.json(results);
});

module.exports = router;
