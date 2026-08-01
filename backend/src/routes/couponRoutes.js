import { Router } from 'express';
import { validateCoupon, getActiveCoupons, getAllCoupons, createCoupon, updateCoupon, deleteCoupon } from '../controllers/couponController.js';
import userAuth, { optionalUserAuth } from '../middleware/userAuth.js';
import auth from '../middleware/auth.js';

const router = Router();

// Customer
router.post('/validate', optionalUserAuth, validateCoupon);
router.get('/active', getActiveCoupons);

// Admin
router.get('/', auth, getAllCoupons);
router.post('/', auth, createCoupon);
router.put('/:id', auth, updateCoupon);
router.delete('/:id', auth, deleteCoupon);

export default router;
