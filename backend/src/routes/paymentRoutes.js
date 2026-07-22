import { Router } from 'express';
import { createRazorpayOrder, verifyPayment, getPaymentHistory } from '../controllers/paymentController.js';
import userAuth from '../middleware/userAuth.js';
import auth from '../middleware/auth.js';

const router = Router();

// Customer
router.post('/create-order', userAuth, createRazorpayOrder);
router.post('/verify', userAuth, verifyPayment);

// Admin
router.get('/history', auth, getPaymentHistory);

export default router;
