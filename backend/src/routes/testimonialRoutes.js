import { Router } from 'express';
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '../controllers/testimonialController.js';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';

const router = Router();

router.get('/', getTestimonials);
router.post('/', auth, roleCheck('superadmin', 'admin'), createTestimonial);
router.put('/:id', auth, roleCheck('superadmin', 'admin'), updateTestimonial);
router.delete('/:id', auth, roleCheck('superadmin', 'admin'), deleteTestimonial);

export default router;
