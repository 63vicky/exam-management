const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAllCategories,
  createMainCategory,
  addSubCategory,
  updateCategoryStatus,
  updateSubCategoryStatus,
  deleteCategory,
  deleteSubCategory
} = require('../controllers/categoryController');

// Get all categories
router.get('/', protect, getAllCategories);

// Create main category
router.post('/main', protect, createMainCategory);

// Add subcategory
router.post('/sub', protect, addSubCategory);

// Update category status
router.patch('/status', protect, updateCategoryStatus);

// Update subcategory status
router.patch('/sub/status', protect, updateSubCategoryStatus);

// Delete category
router.delete('/:categoryId', protect, deleteCategory);

// Delete subcategory
router.delete('/:categoryId/sub/:subCategoryId', protect, deleteSubCategory);

module.exports = router; 