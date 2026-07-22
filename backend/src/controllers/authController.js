import Admin from '../models/Admin.js';
import generateToken from '../utils/generateToken.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/helpers.js';

// @desc    Login admin
// @route   POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email }).select('+password');
  if (!admin) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (admin.status !== 'active') {
    throw ApiError.forbidden('Account is deactivated. Contact super admin.');
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Update last login
  admin.lastLogin = new Date();
  await admin.save();

  const token = generateToken({ id: admin._id, role: admin.role });

  const adminData = admin.toObject();
  delete adminData.password;

  res.json(new ApiResponse(200, 'Login successful', { admin: adminData, token }));
});

// @desc    Register admin (superadmin only)
// @route   POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    throw ApiError.badRequest('Admin with this email already exists');
  }

  const admin = await Admin.create({ name, email, password, role });
  const adminData = admin.toObject();
  delete adminData.password;

  res.status(201).json(new ApiResponse(201, 'Admin created successfully', adminData));
});

// @desc    Get current admin profile
// @route   GET /api/auth/profile
export const getProfile = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, 'Profile fetched', req.admin));
});

// @desc    Update admin profile
// @route   PUT /api/auth/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;
  const admin = await Admin.findById(req.admin._id);

  if (name) admin.name = name;
  if (avatar) admin.avatar = avatar;

  await admin.save();

  res.json(new ApiResponse(200, 'Profile updated', admin));
});

// @desc    Change password
// @route   POST /api/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const admin = await Admin.findById(req.admin._id).select('+password');

  const isMatch = await admin.comparePassword(currentPassword);
  if (!isMatch) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  admin.password = newPassword;
  await admin.save();

  res.json(new ApiResponse(200, 'Password changed successfully'));
});

// @desc    Get all admins (superadmin only)
// @route   GET /api/auth/admins
export const getAdmins = asyncHandler(async (req, res) => {
  const admins = await Admin.find().sort({ createdAt: -1 });
  res.json(new ApiResponse(200, 'Admins fetched', admins));
});

// @desc    Delete admin (superadmin only)
// @route   DELETE /api/auth/admins/:id
export const deleteAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id);
  if (!admin) throw ApiError.notFound('Admin not found');
  if (admin.role === 'superadmin') throw ApiError.forbidden('Cannot delete super admin');

  await Admin.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse(200, 'Admin deleted'));
});
