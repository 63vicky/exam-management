const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  startExamAttempt,
  submitExamAttempt,
  getBestResult,
  getUserAttempts,
} = require('../controllers/examAttemptController');

// All routes require authentication
router.use(protect);

// Start a new exam attempt
router.post('/start/:examId', startExamAttempt);

// Submit exam attempt
router.post('/submit/:resultId', submitExamAttempt);

// Get user's best result for an exam
router.get('/best/:examId/:userId', getBestResult);

// Get all attempts for a user in an exam
router.get('/attempts/:examId/:userId', getUserAttempts);

module.exports = router;
