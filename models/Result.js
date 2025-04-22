const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  attemptNumber: {
    type: Number,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  answers: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true,
      },
      selectedAnswer: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
      },
      isCorrect: {
        type: Boolean,
        required: true,
      },
      marks: {
        type: Number,
        required: true,
      },
    },
  ],
  totalMarks: {
    type: Number,
    required: true,
  },
  obtainedMarks: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  isPassed: {
    type: Boolean,
    required: true,
  },
  rating: {
    type: String,
    enum: ['Excellent', 'Good', 'Average', 'Poor', 'Failed'],
    required: true,
  },
  feedback: {
    type: String,
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'timeout'],
    default: 'in-progress',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient querying of user's attempts for an exam
resultSchema.index({ examId: 1, userId: 1, attemptNumber: 1 });

module.exports = mongoose.model('Result', resultSchema);
