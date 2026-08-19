import app from './src/app.js';
import connectDB from './src/config/db.js';
import config from './src/config/index.js';
import Admin from './src/models/Admin.js';
import { seedDatabase } from './src/seed.js';
import { verifySMTP } from './src/services/emailService.js';
import mongoose from 'mongoose';

// Handle Uncaught Exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

let server;

const startServer = async () => {
  try {
    // 1. Connect to MongoDB Atlas first
    await connectDB();

    // 2. Auto-seed if database is uninitialized (only runs if connection succeeds)
    console.log('🔍 Checking database initialization...');
    const adminCount = await Admin.countDocuments();
    
    if (adminCount === 0) {
      if (process.env.NODE_ENV === 'production') {
        console.log('⚠️ Database is empty, but automatic seeding is disabled in production.');
      } else {
        console.log('⚠️ Database is empty. Running automatic seed...');
        await seedDatabase(false);
      }
    } else {
      console.log('✅ Database is already initialized.');
    }

    // 3. Start server after successful DB connection and seeding check
    server = app.listen(config.port, async () => {
      console.log(`\n🚀 PeelKraft API Server running on port ${config.port}`);
      console.log(`📍 Environment: ${config.nodeEnv}`);
      console.log(`🌐 Frontend URL: ${config.frontendUrl}`);
      console.log(`🔑 Razorpay Key ID: ${config.razorpay.keyId ? config.razorpay.keyId.substring(0, 8) + '...' : 'Not Configured'}`);
      console.log(`🔒 Razorpay Mode: ${config.razorpay.keyId && config.razorpay.keyId.startsWith('rzp_live') ? 'LIVE Mode 🟢' : 'TEST Mode 🔴'}`);
      console.log(`💚 Health: http://localhost:${config.port}/api/health\n`);

      // Verify SMTP connection safely
      await verifySMTP();
    });
  } catch (error) {
    console.error('\n❌ Failed to start server due to connection error:\n', error);
    process.exit(1);
  }
};

startServer();

// Handle Unhandled Rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Graceful shutdown signals
const gracefulShutdown = (signal) => {
  console.log(`\n👋 ${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      console.log('💥 Process terminated. Closing database connection...');
      await mongoose.connection.close();
      console.log('✓ Database connection closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
