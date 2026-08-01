import mongoose from 'mongoose';
import config from './index.js';

const connectDB = async () => {
  try {
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of buffering forever
      socketTimeoutMS: 45000,         // Close sockets after 45 seconds of inactivity
    };

    console.log('🔌 Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(config.mongoUri, options);
    
    // Log info safely
    const parsedHost = conn.connection.host || 'unknown-host';
    console.log(`✓ Database Name: ${conn.connection.name}`);
    console.log(`✓ Mongoose Version: ${mongoose.version}`);
    console.log(`✅ MongoDB Connected: ${parsedHost}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    throw error; // Propagate error so server startup knows it failed
  }
};

export default connectDB;
