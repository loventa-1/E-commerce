const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController');
const { protect, managerOnly } = require('../middleware/authMiddleware');

router.post('/login', login);
router.get('/me', protect, managerOnly, getMe);

module.exports = router;

