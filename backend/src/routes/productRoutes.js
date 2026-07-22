import { Router } from 'express';
import { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct, getFeaturedProducts, trackAmazonClick } from '../controllers/productController.js';
import auth, { optionalAuth } from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';

const router = Router();

// Public routes
router.get('/featured', getFeaturedProducts);
router.get('/', optionalAuth, getProducts);
router.get('/:slug', getProductBySlug);
router.post('/:id/amazon-click', trackAmazonClick);

// Admin routes
router.post('/', auth, roleCheck('superadmin', 'admin', 'editor'), createProduct);
router.put('/:id', auth, roleCheck('superadmin', 'admin', 'editor'), updateProduct);
router.delete('/:id', auth, roleCheck('superadmin', 'admin'), deleteProduct);

export default router;
