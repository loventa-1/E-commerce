const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const itemRoutes = require('./routes/itemRoutes');
const orderRoutes = require('./routes/orderRoutes');
const webRoutes = require('./routes/webRoutes');
const stripeRoutes = require('./routes/stripeRoutes');
const { receiveWebhook } = require('./controllers/stripeController');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(cors());
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), receiveWebhook);
// Support device photo uploads up to 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded device images statically
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Web views
app.use('/', webRoutes);

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Shop Backend API - Sprint 01',
    version: '1.0.0',
    endpoints: {
      items: 'http://localhost:5000/api/items',
      categories: 'http://localhost:5000/api/categories',
      orders: 'http://localhost:5000/api/orders',
      auth: 'http://localhost:5000/api/auth/login',
      health: 'http://localhost:5000/api/health'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Shop Backend API'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stripe', stripeRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
