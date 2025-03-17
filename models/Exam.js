const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questionPool: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
    },
  ],
  totalQuestions: { type: Number, required: true },
  maxAttempts: { type: Number, default: 5 },
  durationPerQuestion: { type: Number, default: 1 }, // Minutes per question
  duration: { type: Number, required: true }, // Calculated automatically
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

// Auto-calculate duration based on totalQuestions and durationPerQuestion
ExamSchema.pre('save', function (next) {
  this.duration = this.totalQuestions * this.durationPerQuestion;
  next();
});

module.exports = mongoose.model('Exam', ExamSchema);
