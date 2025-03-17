const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  score: { type: Number, required: true },
  rating: { type: String },
  attemptNumber: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Auto-calculate rating based on score
ResultSchema.pre('save', function (next) {
  const score = this.score;
  if (score >= 90) this.rating = 'Excellent';
  else if (score >= 75) this.rating = 'Good';
  else if (score >= 60) this.rating = 'Pass';
  else this.rating = 'Fail';
  next();
});

module.exports = mongoose.model('Result', ResultSchema);
