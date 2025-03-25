const Question = require('../models/Question');
const { validateQuestion } = require('../utils/validation');

// ... existing code ...

// Update question status
exports.updateQuestionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const question = await Question.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    console.error('Error updating question status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update question
exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate the update data
    const { error } = validateQuestion(updateData);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const question = await Question.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 