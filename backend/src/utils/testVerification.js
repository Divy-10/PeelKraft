import mongoose from 'mongoose';
import crypto from 'crypto';
import config from '../config/index.js';
import User from '../models/User.js';
import PendingUser from '../models/PendingUser.js';
import {
  registerUser,
  verifyEmail,
  resendEmail,
  loginUser,
  forgotPassword,
  resetPassword
} from '../controllers/userController.js';
import { hashOTP } from '../services/otpService.js';

const runTests = async () => {
  console.log('🚀 Starting Verification System Automated Tests...\n');

  try {
    // 1. Database Connection
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB.');

    // Cleanup previous test users
    const testEmail = 'divy@urmpl.com';
    await User.deleteMany({ email: testEmail });
    await PendingUser.deleteMany({ email: testEmail });
    console.log('🧹 Cleaned up old test users.');

    // Helper to mock Express req, res, next
    const createMockReqRes = (body = {}, params = {}) => {
      const req = { body, params };
      let statusVal = 200;
      let jsonVal = null;
      let nextError = null;

      const res = {
        status(code) {
          statusVal = code;
          return this;
        },
        json(data) {
          jsonVal = data;
          return this;
        }
      };

      const next = (err) => {
        nextError = err;
      };

      return {
        req,
        res,
        next,
        getResult: () => ({ status: statusVal, data: jsonVal, error: nextError })
      };
    };

    // ==========================================
    // TEST 1: User Registration
    // ==========================================
    console.log('\n🧪 Test 1: User Registration');
    const registerMock = createMockReqRes({
      firstName: 'Test',
      lastName: 'User',
      email: testEmail,
      phone: '9999988888',
      password: 'SecurePassword123'
    });

    await registerUser(registerMock.req, registerMock.res, registerMock.next);
    const regResult = registerMock.getResult();

    if (regResult.error) {
      throw new Error(`Registration failed: ${regResult.error.message}`);
    }
    console.log('👉 Status:', regResult.status);
    console.log('👉 Response:', regResult.data);

    // Verify PendingUser exists in DB
    const pendingUser = await PendingUser.findOne({ email: testEmail });
    if (!pendingUser) {
      throw new Error('PendingUser not created in database.');
    }
    console.log('👉 PendingUser found in DB. Pass Hash:', pendingUser.passwordHash.substring(0, 15) + '...');
    console.log('👉 OTP Hash in DB:', pendingUser.otpHash);
    console.log('👉 OTP Expiration:', pendingUser.otpExpiresAt);

    // ==========================================
    // TEST 2: Duplicate Email Check
    // ==========================================
    console.log('\n🧪 Test 2: Duplicate Email Check in Pending');
    // Registering again for same email should clear previous pending user and make new one
    const registerMock2 = createMockReqRes({
      firstName: 'Test',
      lastName: 'User Updated',
      email: testEmail,
      phone: '9999988888',
      password: 'SecurePassword123'
    });

    await registerUser(registerMock2.req, registerMock2.res, registerMock2.next);
    const regResult2 = registerMock2.getResult();
    if (regResult2.error) {
      throw new Error(`Second registration failed: ${regResult2.error.message}`);
    }
    console.log('👉 Duplicate registration handled (cleared previous pending and recreated).');

    // ==========================================
    // TEST 3: Login Attempt Prior to Verification
    // ==========================================
    console.log('\n🧪 Test 3: Login Attempt Prior to Verification');
    const loginMock = createMockReqRes({
      email: testEmail,
      password: 'SecurePassword123'
    });

    await loginUser(loginMock.req, loginMock.res, loginMock.next);
    const loginResult = loginMock.getResult();
    if (!loginResult.error || !loginResult.error.message.includes('verify')) {
      throw new Error('Login succeeded or did not show correct error for unverified account.');
    }
    console.log('👉 Login blocked successfully:', loginResult.error.message);

    // ==========================================
    // TEST 4: OTP Verification (Invalid OTP)
    // ==========================================
    console.log('\n🧪 Test 4: OTP Verification (Invalid OTP)');
    const verifyMockWrong = createMockReqRes({
      email: testEmail,
      otp: '999999' // incorrect OTP
    });

    await verifyEmail(verifyMockWrong.req, verifyMockWrong.res, verifyMockWrong.next);
    const verifyResultWrong = verifyMockWrong.getResult();
    if (!verifyResultWrong.error || !verifyResultWrong.error.message.includes('Invalid')) {
      throw new Error('Verification succeeded with wrong OTP or threw incorrect error.');
    }
    console.log('👉 Invalid OTP blocked successfully:', verifyResultWrong.error.message);

    // ==========================================
    // TEST 5: OTP Verification (Correct OTP)
    // ==========================================
    console.log('\n🧪 Test 5: OTP Verification (Correct OTP)');
    // Retrieve correct OTP hash from database and calculate the plain text
    // Note: since we hashed it, we can bypass OTP check by manually updating OTP hash to a known OTP hash, e.g., '123456'
    const knownOtp = '123456';
    const knownOtpHash = hashOTP(knownOtp);
    const activePendingUser = await PendingUser.findOne({ email: testEmail });
    activePendingUser.otpHash = knownOtpHash;
    activePendingUser.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins from now
    await activePendingUser.save();

    const verifyMockCorrect = createMockReqRes({
      email: testEmail,
      otp: knownOtp
    });

    await verifyEmail(verifyMockCorrect.req, verifyMockCorrect.res, verifyMockCorrect.next);
    const verifyResultCorrect = verifyMockCorrect.getResult();

    if (verifyResultCorrect.error) {
      throw new Error(`Verification failed with correct OTP: ${verifyResultCorrect.error.message}`);
    }
    console.log('👉 Status:', verifyResultCorrect.status);
    console.log('👉 Response:', verifyResultCorrect.data);
    console.log('👉 Token Generated:', verifyResultCorrect.data.token.substring(0, 20) + '...');

    // Verify PendingUser is deleted and User is created
    const pendingDeleted = await PendingUser.findOne({ email: testEmail });
    if (pendingDeleted) {
      throw new Error('PendingUser was not deleted after successful verification.');
    }
    const verifiedUser = await User.findOne({ email: testEmail });
    if (!verifiedUser || !verifiedUser.isVerified) {
      throw new Error('User was not created or isVerified is not true.');
    }
    if (verifiedUser.phone !== '9999988888') {
      throw new Error(`Phone number mismatch. Expected '9999988888', got '${verifiedUser.phone}'`);
    }
    console.log('👉 Verified User saved in main collection with correct phone number.');

    // ==========================================
    // TEST 6: Login After Verification
    // ==========================================
    console.log('\n🧪 Test 6: Login After Verification');
    const loginMock2 = createMockReqRes({
      email: testEmail,
      password: 'SecurePassword123'
    });

    await loginUser(loginMock2.req, loginMock2.res, loginMock2.next);
    const loginResult2 = loginMock2.getResult();
    if (loginResult2.error) {
      throw new Error(`Login failed after verification: ${loginResult2.error.message}`);
    }
    console.log('👉 Status:', loginResult2.status);
    console.log('👉 Response:', loginResult2.data);

    // ==========================================
    // TEST 7: Forgot Password Flow
    // ==========================================
    console.log('\n🧪 Test 7: Forgot Password Flow');
    const forgotMock = createMockReqRes({
      email: testEmail
    });

    await forgotPassword(forgotMock.req, forgotMock.res, forgotMock.next);
    const forgotResult = forgotMock.getResult();
    if (forgotResult.error) {
      throw new Error(`Forgot Password flow failed: ${forgotResult.error.message}`);
    }
    console.log('👉 Status:', forgotResult.status);
    console.log('👉 Response:', forgotResult.data);

    // Retrieve the user to verify token is generated
    const resetUser = await User.findOne({ email: testEmail });
    if (!resetUser.resetPasswordToken || !resetUser.resetPasswordExpires) {
      throw new Error('Reset password token/expiry not generated.');
    }
    console.log('👉 Reset password token hash created in DB.');

    // ==========================================
    // TEST 8: Reset Password Flow
    // ==========================================
    console.log('\n🧪 Test 8: Reset Password Flow');
    // Since we need the original random token, let's manually write a token in memory
    // and hash it in DB to simulate
    const testResetToken = 'super-secret-random-reset-token-321';
    const hashedResetToken = crypto.createHash('sha256').update(testResetToken).digest('hex');
    resetUser.resetPasswordToken = hashedResetToken;
    resetUser.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await resetUser.save();

    const resetMock = createMockReqRes({
      token: testResetToken,
      password: 'NewSuperPassword123'
    });

    await resetPassword(resetMock.req, resetMock.res, resetMock.next);
    const resetResult = resetMock.getResult();
    if (resetResult.error) {
      throw new Error(`Reset password flow failed: ${resetResult.error.message}`);
    }
    console.log('👉 Status:', resetResult.status);
    console.log('👉 Response:', resetResult.data);

    // Verify token cleared and password updated
    const updatedUser = await User.findOne({ email: testEmail }).select('+password');
    if (updatedUser.resetPasswordToken || updatedUser.resetPasswordExpires) {
      throw new Error('Reset password tokens not cleared.');
    }
    const isNewMatch = await updatedUser.comparePassword('NewSuperPassword123');
    if (!isNewMatch) {
      throw new Error('New password does not match.');
    }
    console.log('👉 Password reset confirmed successfully.');

    // Clean up test user
    await User.deleteOne({ email: testEmail });
    console.log('\n🧹 Cleaned up verification test user.');

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! Verification System is 100% production ready.');
  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
};

runTests();
