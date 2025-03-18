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
  duration: {
    type: Number,
    required: [true, 'Please provide exam duration in minutes'],
  },
  startTime: {
    type: Date,
    required: [true, 'Please provide exam start time'],
  },
  endTime: {
    type: Date,
    required: [true, 'Please provide exam end time'],
  },
  totalMarks: {
    type: Number,
    required: [true, 'Please provide total marks'],
  },
  passingMarks: {
    type: Number,
    required: [true, 'Please provide passing marks'],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    required: [true, 'Please provide subject name'],
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'completed'],
    default: 'draft',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Exam', examSchema);
