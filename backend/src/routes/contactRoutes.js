import { Router } from 'express';
import { submitContact, getContacts, getContactById, replyToContact, deleteContact } from '../controllers/contactController.js';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import { contactLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/', contactLimiter, submitContact);
router.get('/', auth, roleCheck('superadmin', 'admin'), getContacts);
router.get('/:id', auth, roleCheck('superadmin', 'admin'), getContactById);
router.put('/:id/reply', auth, roleCheck('superadmin', 'admin'), replyToContact);
router.delete('/:id', auth, roleCheck('superadmin', 'admin'), deleteContact);

export default router;
