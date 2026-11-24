const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const app = require('./app');
const connectDB = require('./config/db');
const seedInitialData = require('./utils/seeder');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Run initial data seeder
    await seedInitialData();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` Shop Backend API running on http://localhost:${PORT}`);
      console.log(` Manager Email: ${process.env.MANAGER_EMAIL || 'manager@shop.com'}`);
      console.log(` MongoDB URI:   ${process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shop_db'}`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
