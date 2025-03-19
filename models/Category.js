const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Sub category name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  questionCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  questionCount: {
    type: Number,
    default: 0
  },
  subCategories: [subCategorySchema]
}, {
  timestamps: true
});

// Index for faster queries
categorySchema.index({ name: 1 });
categorySchema.index({ 'subCategories.name': 1 });

module.exports = mongoose.model('Category', categorySchema); 