const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const app = require('./app');
const connectDB = require('./config/db');
const seedInitialData = require('./utils/seeder');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const requiredEnvVars = ['JWT_SECRET', 'MANAGER_PASSWORD'];
    const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]?.trim());
    if (missingEnvVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    }

    // Connect to MongoDB
    await connectDB();

    // Run initial data seeder
    await seedInitialData();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` Shop Backend API running on http://localhost:${PORT}`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
