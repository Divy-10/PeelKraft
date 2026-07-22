import { Router } from 'express';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlistController.js';
import userAuth from '../middleware/userAuth.js';

const router = Router();

router.get('/', userAuth, getWishlist);
router.post('/', userAuth, addToWishlist);
router.delete('/:productId', userAuth, removeFromWishlist);

export default router;
