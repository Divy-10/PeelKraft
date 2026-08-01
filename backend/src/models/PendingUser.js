import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const pendingUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    otpHash: {
      type: String,
      required: [true, 'OTP hash is required'],
    },
    otpExpiresAt: {
      type: Date,
      required: true,
    },
    otpResentAt: {
      type: Date,
      default: Date.now,
    },
    resendCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password helper for instances where we set it manually
pendingUserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcryptjs.compare(candidatePassword, this.passwordHash);
};

// Index to automatically expire documents when otpExpiresAt is reached
pendingUserSchema.index({ otpExpiresAt: 1 }, { expireAfterSeconds: 0 });

const PendingUser = mongoose.model('PendingUser', pendingUserSchema);
export default PendingUser;
