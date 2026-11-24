const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  verifyOrderStatus
} = require('../controllers/orderController');
const { protect, managerOnly } = require('../middleware/authMiddleware');

router.route('/')
  .post(createOrder)
  .get(protect, managerOnly, getOrders);

router.get('/:id/status', verifyOrderStatus);

router.route('/:id')
  .get(protect, managerOnly, getOrderById)
  .patch(protect, managerOnly, updateOrder);

module.exports = router;

