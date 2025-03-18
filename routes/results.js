const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const { protect, authorize } = require('../middleware/auth');

// Submit exam result
router.post('/submit', protect, async (req, res) => {
  try {
    const result = await Result.create({
      ...req.body,
      userId: req.user._id,
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting exam result' });
  }
});

// Get results for a specific exam
router.get('/exam/:examId', protect, async (req, res) => {
  try {
    const results = await Result.find({ examId: req.params.examId })
      .populate('userId', 'name email')
      .populate('examId', 'title');
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exam results' });
  }
});

// Get results for a specific user
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const results = await Result.find({ userId: req.params.userId })
      .populate('examId', 'title description')
      .sort('-submittedAt');
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user results' });
  }
});

// Get specific result
router.get('/:id', protect, async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('examId', 'title description')
      .populate('answers.questionId', 'questionText options');

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    // Check if user is authorized to view this result
    if (
      result.userId._id.toString() !== req.user._id.toString() &&
      !['teacher', 'admin'].includes(req.user.role)
    ) {
      return res
        .status(403)
        .json({ message: 'Not authorized to view this result' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching result' });
  }
});

// Get exam statistics (teachers and admins only)
router.get(
  '/stats/:examId',
  protect,
  authorize('teacher', 'admin'),
  async (req, res) => {
    try {
      const results = await Result.find({ examId: req.params.examId });

      const stats = {
        totalAttempts: results.length,
        averageMarks:
          results.reduce((acc, curr) => acc + curr.obtainedMarks, 0) /
          results.length,
        highestMarks: Math.max(...results.map((r) => r.obtainedMarks)),
        lowestMarks: Math.min(...results.map((r) => r.obtainedMarks)),
        passRate:
          (results.filter((r) => r.isPassed).length / results.length) * 100,
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching exam statistics' });
    }
  }
);

module.exports = router;
