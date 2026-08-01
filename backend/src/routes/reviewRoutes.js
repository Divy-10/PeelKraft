import { Router } from 'express';
import {
  getProductReviews,
  createReview,
  getAllReviews,
  updateReviewStatus,
  toggleFeatured,
  markHelpful,
  deleteReview,
} from '../controllers/reviewController.js';
import { optionalUserAuth } from '../middleware/userAuth.js';
import auth from '../middleware/auth.js';

const router = Router();

// Public / Customer routes
router.get('/product/:productId', getProductReviews);
router.post('/', optionalUserAuth, createReview);
router.post('/:id/helpful', markHelpful);

// Admin routes (Protected)
router.get('/', auth, getAllReviews);
router.put('/:id', auth, updateReviewStatus);
router.patch('/:id/featured', auth, toggleFeatured);
router.delete('/:id', auth, deleteReview);

export default router;
