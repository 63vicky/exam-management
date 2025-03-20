const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const { protect, authorize } = require('../middleware/auth');

// Get all questions
router.get('/', protect, async (req, res) => {
  try {
    const questions = await Question.find()
      .populate('createdBy', 'name email')
      .populate('examId', 'title');
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching questions' });
  }
});

// Get all questions for an exam
router.get('/exam/:examId', protect, async (req, res) => {
  try {
    const questions = await Question.find({
      examId: req.params.examId,
    }).populate('createdBy', 'name email');
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching questions' });
  }
});

// Get single question
router.get('/:id', protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('examId', 'title');
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching question' });
  }
});

// Create question (teachers and admins only)
router.post('/', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const question = await Question.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: 'Error creating question', error });
  }
});

// Update question (teachers and admins only)
router.put('/:id', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is the creator or admin
    if (
      question.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res
        .status(403)
        .json({ message: 'Not authorized to update this question' });
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ message: 'Error updating question' });
  }
});

// Delete question (teachers and admins only)
router.delete(
  '/:id',
  protect,
  authorize('teacher', 'admin'),
  async (req, res) => {
    try {
      const question = await Question.findById(req.params.id);
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }

      // Check if user is the creator or admin
      if (
        question.createdBy.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin'
      ) {
        return res
          .status(403)
          .json({ message: 'Not authorized to delete this question' });
      }

      await question.deleteOne();
      res.json({ message: 'Question deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting question' });
    }
  }
);

// Bulk create questions
router.post(
  '/bulk',
  protect,
  authorize('teacher', 'admin'),
  async (req, res) => {
    try {
      const { examId, questions } = req.body;

      const questionsToCreate = questions.map((question) => ({
        ...question,
        examId,
        createdBy: req.user._id,
      }));

      const createdQuestions = await Question.insertMany(questionsToCreate);
      res.status(201).json(createdQuestions);
    } catch (error) {
      res.status(500).json({ message: 'Error creating questions in bulk' });
    }
  }
);

// Update question status
router.patch('/:id/status', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is the creator or admin
    if (
      question.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res
        .status(403)
        .json({ message: 'Not authorized to update this question' });
    }

    question.status = status;
    await question.save();
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Error updating question status' });
  }
});

module.exports = router;
