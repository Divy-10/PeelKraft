import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import User from '../models/User.js';
import PendingUser from '../models/PendingUser.js';
import config from '../config/index.js';
import ApiError from '../utils/ApiError.js';
import { generateOTP, hashOTP, verifyOTP } from '../services/otpService.js';
import { 
  sendEmail, 
  getVerificationEmailTemplate, 
  getWelcomeEmailTemplate, 
  getForgotPasswordTemplate, 
  getPasswordResetConfirmationTemplate 
} from '../services/emailService.js';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const getCountryName = (countryCode) => {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode) || countryCode;
  } catch {
    return countryCode;
  }
};

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: 'user' }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
};

// Register
export const registerUser = async (req, res, next) => {
  try {
    const { fullName, email, password, mobileNumber, country, gender, birthDate } = req.body;

    if (!fullName || !email || !password || !mobileNumber || !country || !gender || !birthDate) {
      throw ApiError.badRequest('Full Name, email, password, mobile number, country, gender, and birth date are required.');
    }

    // Validate and parse phone number using country code
    const phoneNumberObj = parsePhoneNumberFromString(mobileNumber, country.toUpperCase());
    if (!phoneNumberObj || !phoneNumberObj.isValid()) {
      throw ApiError.badRequest('Please enter a valid phone number.');
    }

    const normalizedNumber = phoneNumberObj.number; // e.g. "+919876543210"

    // Validate gender
    const allowedGenders = ['Male', 'Female', 'Other', 'Prefer not to say'];
    if (!allowedGenders.includes(gender)) {
      throw ApiError.badRequest('Please select a valid gender.');
    }

    // Validate birthDate
    const bDate = new Date(birthDate);
    if (isNaN(bDate.getTime())) {
      throw ApiError.badRequest('Please enter a valid birth date.');
    }
    if (bDate > new Date()) {
      throw ApiError.badRequest('Birth date cannot be in the future.');
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      throw ApiError.badRequest('An account with this email already exists.');
    }

    // Check duplicate mobile (check normalized format AND raw national format for backward compatibility)
    const existingMobile = await User.findOne({
      $or: [
        { mobileNumber: normalizedNumber },
        { mobileNumber: phoneNumberObj.nationalNumber }
      ]
    });
    if (existingMobile) {
      throw ApiError.badRequest('This phone number is already registered.');
    }

    // Clear any previous pending registration for the same email
    await PendingUser.deleteMany({ email: email.toLowerCase() });

    // Hash password
    const salt = await bcryptjs.genSalt(12);
    const passwordHash = await bcryptjs.hash(password, salt);

    // Generate secure 6-digit OTP
    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const countryName = getCountryName(country.toUpperCase());
    const phoneDetails = {
      country: country.toUpperCase(),
      countryName,
      dialCode: `+${phoneNumberObj.countryCallingCode}`,
      nationalNumber: phoneNumberObj.nationalNumber,
      internationalNumber: normalizedNumber
    };

    // Create Pending User
    await PendingUser.create({
      name: fullName.trim(),
      email: email.toLowerCase(),
      mobileNumber: normalizedNumber,
      phoneDetails,
      gender,
      birthDate: bDate,
      passwordHash,
      otpHash,
      otpExpiresAt,
      otpResentAt: new Date(),
      resendCount: 0,
    });

    // Send Verification Email
    await sendEmail({
      to: email.toLowerCase(),
      subject: 'Verify Your Email Address - PeelKraft',
      html: getVerificationEmailTemplate(otp),
    });

    res.status(201).json({
      success: true,
      message: 'Verification OTP has been sent to your email.',
    });
  } catch (error) {
    next(error);
  }
};

// Verify Email
export const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw ApiError.badRequest('Email and OTP are required.');
    }

    const pendingUser = await PendingUser.findOne({ email: email.toLowerCase() });
    if (!pendingUser) {
      throw ApiError.badRequest('No pending registration found for this email, or verification expired.');
    }

    // Validate expiration
    if (pendingUser.otpExpiresAt < Date.now()) {
      throw ApiError.badRequest('Verification code has expired. Please request a new one.');
    }

    // Verify OTP hash
    if (!verifyOTP(otp, pendingUser.otpHash)) {
      throw ApiError.badRequest('Invalid verification code.');
    }

    // Split name
    const nameParts = pendingUser.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create active user
    const user = await User.create({
      firstName,
      lastName,
      email: pendingUser.email,
      password: pendingUser.passwordHash,
      phone: pendingUser.phone || '',
      mobileNumber: pendingUser.mobileNumber || '',
      phoneDetails: pendingUser.phoneDetails,
      gender: pendingUser.gender,
      birthDate: pendingUser.birthDate,
      isVerified: true,
    });

    // Delete pending record
    await PendingUser.deleteOne({ _id: pendingUser._id });

    // Send Welcome Email
    await sendEmail({
      to: user.email,
      subject: 'Welcome to PeelKraft!',
      html: getWelcomeEmailTemplate(user.fullName),
    }).catch(console.error);

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        mobileNumber: user.mobileNumber,
        phoneDetails: user.phoneDetails,
        gender: user.gender,
        birthDate: user.birthDate,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Resend OTP
export const resendEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw ApiError.badRequest('Email is required.');
    }

    const pendingUser = await PendingUser.findOne({ email: email.toLowerCase() });
    if (!pendingUser) {
      throw ApiError.badRequest('No pending registration found. Please register first.');
    }

    const now = Date.now();
    const timeDiff = now - pendingUser.otpResentAt.getTime();

    // 1. Enforce 60-second cooldown
    if (timeDiff < 60 * 1000) {
      const waitSeconds = Math.ceil((60 * 1000 - timeDiff) / 1000);
      throw ApiError.badRequest(`Please wait ${waitSeconds} seconds before requesting another code.`);
    }

    // 2. Enforce max 5 resend requests/hour
    const oneHour = 60 * 60 * 1000;
    if (timeDiff > oneHour) {
      // Reset resendCount if more than an hour has passed since last request
      pendingUser.resendCount = 0;
    }

    if (pendingUser.resendCount >= 5) {
      throw ApiError.forbidden('Maximum OTP limit exceeded. Please try again after an hour.');
    }

    // Generate new OTP
    const otp = generateOTP();
    pendingUser.otpHash = hashOTP(otp);
    pendingUser.otpExpiresAt = new Date(now + 15 * 60 * 1000); // Reset expiry to 15 mins
    pendingUser.otpResentAt = new Date(now);
    pendingUser.resendCount += 1;

    await pendingUser.save();

    // Send new verification email
    await sendEmail({
      to: pendingUser.email,
      subject: 'Your New Verification Code - PeelKraft',
      html: getVerificationEmailTemplate(otp),
    });

    res.json({
      success: true,
      message: 'A new verification code has been sent to your email.',
    });
  } catch (error) {
    next(error);
  }
};

// Login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw ApiError.badRequest('Email and password are required.');
    }

    let user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      // Check if there is a pending registration
      const pending = await PendingUser.findOne({ email: email.toLowerCase() });
      if (pending) {
        const isMatch = await bcryptjs.compare(password, pending.passwordHash);
        if (isMatch) {
          throw ApiError.unauthorized('Please verify your email address before logging in.');
        }
      }
      throw ApiError.unauthorized('Invalid email or password.');
    }

    if (user.status === 'blocked') {
      throw ApiError.forbidden('Your account has been blocked. Contact support.');
    }

    // Make sure user is verified
    if (!user.isVerified) {
      throw ApiError.unauthorized('Please verify your email address before logging in.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        mobileNumber: user.mobileNumber,
        phoneDetails: user.phoneDetails,
        gender: user.gender,
        birthDate: user.birthDate,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get Profile
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// Update Profile
export const updateUserProfile = async (req, res, next) => {
  try {
    const { fullName, mobileNumber, country, gender, birthDate } = req.body;

    if (!fullName || !mobileNumber || !country || !gender || !birthDate) {
      throw ApiError.badRequest('Full Name, mobile number, country, gender, and birth date are required.');
    }

    // Validate using libphonenumber-js
    const phoneNumberObj = parsePhoneNumberFromString(mobileNumber, country.toUpperCase());
    if (!phoneNumberObj || !phoneNumberObj.isValid()) {
      throw ApiError.badRequest('Please enter a valid phone number.');
    }

    const normalizedNumber = phoneNumberObj.number;

    // Validate gender
    const allowedGenders = ['Male', 'Female', 'Other', 'Prefer not to say'];
    if (!allowedGenders.includes(gender)) {
      throw ApiError.badRequest('Please select a valid gender.');
    }

    // Validate birthDate
    const bDate = new Date(birthDate);
    if (isNaN(bDate.getTime())) {
      throw ApiError.badRequest('Please enter a valid birth date.');
    }
    if (bDate > new Date()) {
      throw ApiError.badRequest('Birth date cannot be in the future.');
    }

    // Check if new mobile number is already registered to someone else (normalized OR national for legacy)
    const existing = await User.findOne({
      _id: { $ne: req.user._id },
      $or: [
        { mobileNumber: normalizedNumber },
        { mobileNumber: phoneNumberObj.nationalNumber }
      ]
    });
    if (existing) {
      throw ApiError.badRequest('This phone number is already registered.');
    }

    // Split fullName
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const user = await User.findById(req.user._id);
    if (!user) {
      throw ApiError.notFound('User not found.');
    }

    const countryName = getCountryName(country.toUpperCase());

    user.firstName = firstName;
    user.lastName = lastName;
    user.mobileNumber = normalizedNumber;
    user.phoneDetails = {
      country: country.toUpperCase(),
      countryName,
      dialCode: `+${phoneNumberObj.countryCallingCode}`,
      nationalNumber: phoneNumberObj.nationalNumber,
      internationalNumber: normalizedNumber
    };
    user.gender = gender;
    user.birthDate = bDate;

    await user.save();

    res.json({ success: true, data: user, message: 'Profile updated.' });
  } catch (error) {
    next(error);
  }
};

// Change Password
export const changeUserPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw ApiError.badRequest('Current password is incorrect.');
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
};

// Add Address
export const addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { isDefault } = req.body;

    // If this is default, unset other defaults
    if (isDefault) {
      user.addresses.forEach((addr) => { addr.isDefault = false; });
    }

    // If first address, make it default
    if (user.addresses.length === 0) {
      req.body.isDefault = true;
    }

    user.addresses.push(req.body);
    await user.save();

    res.status(201).json({ success: true, data: user.addresses, message: 'Address added.' });
  } catch (error) {
    next(error);
  }
};

// Update Address
export const updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.addressId);

    if (!addr) {
      throw ApiError.notFound('Address not found.');
    }

    if (req.body.isDefault) {
      user.addresses.forEach((a) => { a.isDefault = false; });
    }

    Object.assign(addr, req.body);
    await user.save();

    res.json({ success: true, data: user.addresses, message: 'Address updated.' });
  } catch (error) {
    next(error);
  }
};

// Delete Address
export const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.pull({ _id: req.params.addressId });
    await user.save();

    res.json({ success: true, data: user.addresses, message: 'Address removed.' });
  } catch (error) {
    next(error);
  }
};

// Forgot Password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if email exists for security
      return res.json({ success: true, message: 'If that email exists, a password reset link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`;

    // Send Forgot Password Email using Resend
    await sendEmail({
      to: user.email,
      subject: 'Reset Your Password - PeelKraft',
      html: getForgotPasswordTemplate(resetUrl),
    });

    res.json({ success: true, message: 'If that email exists, a password reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};

// Reset Password
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw ApiError.badRequest('Invalid or expired reset token.');
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send Confirmation Email using Resend
    await sendEmail({
      to: user.email,
      subject: 'Your Password Has Been Reset - PeelKraft',
      html: getPasswordResetConfirmationTemplate(),
    }).catch(console.error);

    res.json({ success: true, message: 'Password has been reset successfully. Please login.' });
  } catch (error) {
    next(error);
  }
};
