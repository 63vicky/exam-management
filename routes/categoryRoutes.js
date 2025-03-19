const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');

// Apply protect middleware to all routes
router.use(protect);

// Main category routes
router.get('/', categoryController.getAllCategories);
router.post('/main', categoryController.createMainCategory);
router.post('/sub', categoryController.addSubCategory);
router.patch('/status', categoryController.updateCategoryStatus);
router.patch('/sub/status', categoryController.updateSubCategoryStatus);
router.delete('/:categoryId', categoryController.deleteCategory);

// Sub-category routes
router.delete('/:mainCategoryId/subcategories/:subCategoryId', categoryController.deleteSubCategory);

module.exports = router; 