import { Router } from 'express';
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';

const router = Router();

router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', auth, roleCheck('superadmin', 'admin'), createCategory);
router.put('/:id', auth, roleCheck('superadmin', 'admin'), updateCategory);
router.delete('/:id', auth, roleCheck('superadmin', 'admin'), deleteCategory);

export default router;
