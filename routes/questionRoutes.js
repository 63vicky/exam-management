const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { authenticate } = require('../middleware/auth');

// Protected routes (require authentication)
router.use(authenticate);

// Get all questions
router.get('/', questionController.getAllQuestions);

// Get a single question
router.get('/:id', questionController.getQuestion);

// Create a new question
router.post('/', questionController.createQuestion);

// Update a question
router.put('/:id', questionController.updateQuestion);

// Update question status
router.patch('/:id/status', questionController.updateQuestionStatus);

// Delete a question
router.delete('/:id', questionController.deleteQuestion);

module.exports = router; 