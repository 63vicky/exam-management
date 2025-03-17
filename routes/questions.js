const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const auth = require('../middleware/auth');

// Create Question
router.post('/questions', auth, async (req, res) => {
  const { text, options, answer } = req.body;
  try {
    const question = await Question.create({ text, options, answer });
    res.status(201).json(question);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
