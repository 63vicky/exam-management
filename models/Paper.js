const mongoose = require('mongoose');

const paperSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['exam', 'quiz', 'test', 'assignment', 'mid-term', 'final']
  },
  passingPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  defaultMarks: {
    type: Number,
    required: true,
    min: 0
  },
  negativeMarks: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  maxTabSwitch: {
    type: Number,
    required: true,
    min: 0
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  instructions: {
    type: String,
    trim: true
  },
  questionAddMethod: {
    type: String,
    required: true,
    enum: ['automatic', 'manual']
  },
  viewCorrectAnswers: {
    type: Boolean,
    default: false
  },
  emailNotify: {
    type: Boolean,
    default: false
  },
  directLogin: {
    type: Boolean,
    default: false
  },
  randomQuestions: {
    type: Boolean,
    default: false
  },
  randomOptions: {
    type: Boolean,
    default: false
  },
  proctored: {
    type: Boolean,
    default: false
  },
  showResult: {
    type: Boolean,
    default: false
  },
  customExeOnly: {
    type: Boolean,
    default: false
  },
  fileUpload: {
    type: Boolean,
    default: false
  },
  userGroups: [{
    type: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Paper', paperSchema);
