import app from './app.js';
import connectDB from './config/db.js';
import config from './config/index.js';
import Admin from './models/Admin.js';
import Product from './models/Product.js';
import { seedDatabase } from './seed.js';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Auto-seed if database is empty
    const adminCount = await Admin.countDocuments();
    const productCount = await Product.countDocuments();
    
    if (adminCount === 0 || productCount === 0) {
      console.log('⚠️ Database is empty. Running automatic seed...');
      await seedDatabase(false);
    } else {
      console.log('✅ Database is already initialized.');
    }

    // Start server
    app.listen(config.port, () => {
      console.log(`\n🚀 PeelKraft API Server running on port ${config.port}`);
      console.log(`📍 Environment: ${config.nodeEnv}`);
      console.log(`🌐 Frontend URL: ${config.frontendUrl}`);
      console.log(`💚 Health: http://localhost:${config.port}/api/health\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
