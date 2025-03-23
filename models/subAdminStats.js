const mongoose = require('mongoose');

const subAdminStatsSchema = new mongoose.Schema({
  subAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubAdmin',
    required: true
  },
  questions: {
    active: {
      type: Number,
      default: 0
    },
    deactive: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  papers: {
    active: {
      type: Number,
      default: 0
    },
    deactive: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
subAdminStatsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('SubAdminStats', subAdminStatsSchema); 