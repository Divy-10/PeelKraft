import { Router } from 'express';
import {
  registerUser, loginUser, getUserProfile, updateUserProfile,
  changeUserPassword, addAddress, updateAddress, deleteAddress,
  forgotPassword, resetPassword,
} from '../controllers/userController.js';
import userAuth from '../middleware/userAuth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public
router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', resetPassword);

// Protected
router.get('/profile', userAuth, getUserProfile);
router.put('/profile', userAuth, updateUserProfile);
router.post('/change-password', userAuth, changeUserPassword);

// Addresses
router.post('/addresses', userAuth, addAddress);
router.put('/addresses/:addressId', userAuth, updateAddress);
router.delete('/addresses/:addressId', userAuth, deleteAddress);

export default router;
