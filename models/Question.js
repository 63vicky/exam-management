const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
  },
  questionText: {
    type: String,
    required: [true, 'Please provide question text'],
  },
  questionType: {
    type: String,
    enum: [
      'multiple-choice-single',
      'multiple-choice-multiple',
      'true-false',
      'short-answer',
      'essay',
    ],
    required: true,
  },
  options: [
    {
      text: {
        type: String,
        required: function () {
          return [
            'multiple-choice-single',
            'multiple-choice-multiple',
            'true-false',
          ].includes(this.questionType);
        },
      },
      isCorrect: {
        type: Boolean,
        required: function () {
          return [
            'multiple-choice-single',
            'multiple-choice-multiple',
            'true-false',
          ].includes(this.questionType);
        },
      },
    },
  ],
  marks: {
    type: Number,
    required: [true, 'Please provide marks for this question'],
  },
  explanation: {
    type: String,
  },
  mainCategory: {
    type: String,
    required: [true, 'Please provide main category'],
  },
  subCategory: {
    type: String,
    required: [true, 'Please provide sub category'],
  },
  level: {
    type: String,
    enum: ['top-simple', 'top-medium', 'top-hard'],
    required: [true, 'Please provide difficulty level'],
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Question', questionSchema);
