const express = require('express');
const router = express.Router();
const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
} = require('../controllers/itemController');
const { protect, managerOnly, optionalAuth } = require('../middleware/authMiddleware');

router.route('/')
  .get(optionalAuth, getItems)
  .post(protect, managerOnly, createItem);

router.route('/:id')
  .get(optionalAuth, getItemById)
  .put(protect, managerOnly, updateItem)
  .delete(protect, managerOnly, deleteItem);

module.exports = router;

