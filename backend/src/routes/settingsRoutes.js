import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';

const router = Router();

router.get('/', getSettings);
router.put('/', auth, roleCheck('superadmin'), updateSettings);

export default router;
