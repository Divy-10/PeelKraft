import { Router } from 'express';
import { getBlogs, getBlogBySlug, getRelatedBlogs, getTags, getBlogCategories, createBlog, updateBlog, deleteBlog } from '../controllers/blogController.js';
import auth, { optionalAuth } from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';

const router = Router();

// Public routes
router.get('/tags', getTags);
router.get('/categories', getBlogCategories);
router.get('/', optionalAuth, getBlogs);
router.get('/:slug', getBlogBySlug);
router.get('/:slug/related', getRelatedBlogs);

// Admin routes
router.post('/', auth, roleCheck('superadmin', 'admin', 'editor'), createBlog);
router.put('/:id', auth, roleCheck('superadmin', 'admin', 'editor'), updateBlog);
router.delete('/:id', auth, roleCheck('superadmin', 'admin'), deleteBlog);

export default router;
