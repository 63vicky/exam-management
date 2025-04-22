const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide exam title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide exam description'],
  },
  subject: {
    type: String,
    required: [true, 'Please provide subject'],
  },
  chapter: {
    type: String,
    required: [true, 'Please provide chapter'],
  },
  class: {
    type: String,
    required: [true, 'Please provide class'],
  },
  totalMarks: {
    type: Number,
    required: [true, 'Please provide total marks'],
  },
  passingMarks: {
    type: Number,
    required: [true, 'Please provide passing marks'],
  },
  maxAttempts: {
    type: Number,
    default: 5,
    required: [true, 'Please provide maximum attempts allowed'],
  },
  timeLimit: {
    type: Number, // in minutes
    required: [true, 'Please provide time limit in minutes'],
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide start date'],
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide end date'],
  },
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
    },
  ],
  status: {
    type: String,
    enum: ['draft', 'published', 'completed'],
    default: 'draft',
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

module.exports = mongoose.model('Exam', examSchema);
