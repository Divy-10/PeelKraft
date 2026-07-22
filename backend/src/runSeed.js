import connectDB from './config/db.js';
import { seedDatabase } from './seed.js';

const run = async () => {
  try {
    await connectDB();
    await seedDatabase(true);
    console.log('🎉 Manual database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

run();
