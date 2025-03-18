const mongoose = require('mongoose');
const PaperSchema = new mongoose.Schema(
  {
    name: String,
    type: String,
    instructions: String,
    duration: Number,
    startDateTime: Date,
    endDateTime: Date,
    passingPercentage: Number,
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    userGroup: [String],
    negativeMarks: Number,
    maxTabSwitch: Number,
  },
  { timestamps: true }
);
module.exports = mongoose.model('Paper', PaperSchema);
