const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');

// Create Exam (Admin Only)
router.post('/create', [auth, adminCheck], async (req, res) => {
  const { title, questionPool, totalQuestions, durationPerQuestion } = req.body;

  // Validate question pool has enough questions
  if (questionPool.length < totalQuestions) {
    return res.status(400).json({ error: 'Not enough questions in the pool' });
  }

  const exam = new Exam({
    title,
    questionPool,
    totalQuestions,
    durationPerQuestion: durationPerQuestion || 1,
    createdBy: req.user.id,
  });

  try {
    await exam.save();
    res.status(201).json(exam);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get Exam Questions (for taking the exam)
router.get('/:examId/questions', auth, async (req, res) => {
  const examId = req.params.examId;
  const exam = await Exam.findById(examId).populate('questionPool');
  if (!exam) return res.status(404).json({ error: 'Exam not found' });

  // Check remaining attempts
  const existingAttempts = await Result.countDocuments({
    user: req.user.id,
    exam: examId,
  });
  if (existingAttempts >= exam.maxAttempts) {
    return res.status(403).json({ error: 'Max attempts reached' });
  }

  // Randomize and select questions
  const shuffledQuestions = exam.questionPool.sort(() => 0.5 - Math.random());
  const selectedQuestions = shuffledQuestions.slice(0, exam.totalQuestions);

  res.json(selectedQuestions);
});

// Submit Exam Answers
router.post('/:examId/submit', auth, async (req, res) => {
  const examId = req.params.examId;
  const { answers } = req.body; // Array of { questionId, answer }

  // Validate attempt count
  const existingAttempts = await Result.countDocuments({
    user: req.user.id,
    exam: examId,
  });
  if (existingAttempts >= 5) {
    return res.status(403).json({ error: 'Max attempts reached' });
  }

  // Get exam details and questions
  const exam = await Exam.findById(examId);
  const questionIds = answers.map((a) => a.questionId);
  const questions = await Question.find({ _id: { $in: questionIds } });

  let score = 0;
  questions.forEach((question) => {
    const userAnswer = answers.find(
      (a) => a.questionId.toString() === question._id.toString()
    )?.answer;
    if (userAnswer === question.answer) score++;
  });

  // Save result
  const newAttempt = existingAttempts + 1;
  const result = await Result.create({
    exam: examId,
    user: req.user.id,
    score,
    attemptNumber: newAttempt,
  });

  res.json({ success: true, result });
});

module.exports = router;
