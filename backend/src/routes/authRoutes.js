import { Router } from 'express';
import { login, register, getProfile, updateProfile, changePassword, getAdmins, deleteAdmin } from '../controllers/authController.js';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/login', authLimiter, login);
router.post('/register', auth, roleCheck('superadmin'), register);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.post('/change-password', auth, changePassword);
router.get('/admins', auth, roleCheck('superadmin'), getAdmins);
router.delete('/admins/:id', auth, roleCheck('superadmin'), deleteAdmin);

export default router;
