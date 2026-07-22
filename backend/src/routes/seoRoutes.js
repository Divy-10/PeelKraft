import { Router } from 'express';
import { getSeoByPage, updateSeo, getAllSeo, deleteSeo } from '../controllers/seoController.js';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';

const router = Router();

router.get('/', auth, roleCheck('superadmin', 'admin', 'seo_manager'), getAllSeo);
router.get('/:page', getSeoByPage);
router.put('/:page', auth, roleCheck('superadmin', 'admin', 'seo_manager'), updateSeo);
router.delete('/:page', auth, roleCheck('superadmin', 'admin', 'seo_manager'), deleteSeo);

export default router;
