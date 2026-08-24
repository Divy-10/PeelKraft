import { Router } from 'express';
import { subscribe, unsubscribe, getSubscribers, exportSubscribers, deleteSubscriber } from '../controllers/newsletterController.js';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import { newsletterLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/', newsletterLimiter, subscribe);
router.post('/unsubscribe', unsubscribe);
router.get('/unsubscribe', unsubscribe);
router.get('/', auth, roleCheck('superadmin', 'admin'), getSubscribers);
router.get('/export', auth, roleCheck('superadmin', 'admin'), exportSubscribers);
router.delete('/:id', auth, roleCheck('superadmin', 'admin'), deleteSubscriber);

export default router;
