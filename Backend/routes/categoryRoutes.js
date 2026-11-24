const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect, managerOnly } = require('../middleware/authMiddleware');

router.route('/')
  .get(getCategories)
  .post(protect, managerOnly, createCategory);

router.route('/:id')
  .get(getCategoryById)
  .put(protect, managerOnly, updateCategory)
  .delete(protect, managerOnly, deleteCategory);

module.exports = router;

