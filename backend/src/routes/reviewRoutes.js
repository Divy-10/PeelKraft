import { Router } from 'express';
import {
  getProductReviews, createReview,
  getAllReviews, updateReviewStatus, deleteReview,
} from '../controllers/reviewController.js';
import userAuth from '../middleware/userAuth.js';
import auth from '../middleware/auth.js';

const router = Router();

// Public
router.get('/product/:productId', getProductReviews);

// Customer
router.post('/', userAuth, createReview);

// Admin
router.get('/', auth, getAllReviews);
router.put('/:id', auth, updateReviewStatus);
router.delete('/:id', auth, deleteReview);

export default router;
