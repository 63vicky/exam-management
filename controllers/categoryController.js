const Category = require('../models/Category');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
exports.getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  res.status(200).json(categories);
});

// @desc    Create main category
// @route   POST /api/categories/main
// @access  Private
exports.createMainCategory = asyncHandler(async (req, res) => {
  const category = await Category.create({
    name: req.body.name,
    description: req.body.description,
    isActive: true,
    questionCount: 0,
    subCategories: []
  });
  res.status(201).json(category);
});

// @desc    Add sub category
// @route   POST /api/categories/sub
// @access  Private
exports.addSubCategory = asyncHandler(async (req, res) => {
  const { mainCategoryId, name, description } = req.body;
  
  const category = await Category.findById(mainCategoryId);
  if (!category) {
    return res.status(404).json({ message: 'Main category not found' });
  }

  category.subCategories.push({
    name,
    description,
    isActive: true,
    questionCount: 0
  });

  await category.save();
  res.status(201).json(category);
});

// @desc    Update category status
// @route   PATCH /api/categories/status
// @access  Private
exports.updateCategoryStatus = asyncHandler(async (req, res) => {
  const { categoryId, isActive } = req.body;
  
  const category = await Category.findById(categoryId);
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }

  category.isActive = isActive;
  await category.save();
  res.status(200).json(category);
});

// @desc    Update sub category status
// @route   PATCH /api/categories/sub/status
// @access  Private
exports.updateSubCategoryStatus = asyncHandler(async (req, res) => {
  const { categoryId, subCategoryId, isActive } = req.body;
  
  const category = await Category.findById(categoryId);
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }

  const subCategory = category.subCategories.id(subCategoryId);
  if (!subCategory) {
    return res.status(404).json({ message: 'Sub category not found' });
  }

  subCategory.isActive = isActive;
  await category.save();
  res.status(200).json(category);
});

// @desc    Delete category
// @route   DELETE /api/categories/:categoryId
// @access  Private
exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.categoryId);
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }

  await category.deleteOne();
  res.status(200).json({ message: 'Category deleted successfully' });
});

// @desc    Delete sub category
// @route   DELETE /api/categories/:mainCategoryId/subcategories/:subCategoryId
// @access  Private
exports.deleteSubCategory = asyncHandler(async (req, res) => {
  const { mainCategoryId, subCategoryId } = req.params;
  
  const category = await Category.findById(mainCategoryId);
  if (!category) {
    return res.status(404).json({ message: 'Main category not found' });
  }

  const subCategory = category.subCategories.id(subCategoryId);
  if (!subCategory) {
    return res.status(404).json({ message: 'Sub category not found' });
  }

  // Remove the sub category
  subCategory.deleteOne();
  await category.save();

  res.status(200).json({ message: 'Sub category deleted successfully' });
}); 