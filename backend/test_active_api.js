import mongoose from 'mongoose';
import Coupon from './src/models/Coupon.js';

const MONGODB_URI = 'mongodb://localhost:27017/peelkraft';

const run = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    const now = new Date();
    console.log('Current server date (now):', now.toString(), 'UTC:', now.toISOString());

    // 1. Direct query
    const coupons = await Coupon.find({
      isActive: true,
      startDate: { $lte: now },
      expiryDate: { $gt: now },
    });
    console.log('Query returned count:', coupons.length);
    if (coupons.length > 0) {
      console.log('First coupon details:', coupons[0]);
    } else {
      // Find all active coupons ignoring dates
      const allActive = await Coupon.find({ isActive: true });
      console.log('All active coupons (ignoring date bounds):', allActive.length);
      allActive.forEach(c => {
        console.log(`- Code: ${c.code}, startDate: ${c.startDate.toISOString()}, expiryDate: ${c.expiryDate.toISOString()}`);
        console.log(`  startDate <= now: ${c.startDate <= now}, expiryDate > now: ${c.expiryDate > now}`);
      });
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
};

run();
