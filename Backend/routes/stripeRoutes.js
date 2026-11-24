const express = require('express');
const { stripeConfig } = require('../controllers/stripeController');

const router = express.Router();
router.get('/config', stripeConfig);

module.exports = router;