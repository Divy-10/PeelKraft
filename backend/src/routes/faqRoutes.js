import { Router } from 'express';
import { getFaqs, createFaq, updateFaq, deleteFaq, reorderFaqs } from '../controllers/faqController.js';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';

const router = Router();

router.get('/', getFaqs);
router.post('/', auth, roleCheck('superadmin', 'admin', 'editor'), createFaq);
router.put('/reorder', auth, roleCheck('superadmin', 'admin'), reorderFaqs);
router.put('/:id', auth, roleCheck('superadmin', 'admin', 'editor'), updateFaq);
router.delete('/:id', auth, roleCheck('superadmin', 'admin'), deleteFaq);

export default router;
