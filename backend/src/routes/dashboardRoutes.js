import { Router } from 'express';
import { getStats, getCharts } from '../controllers/dashboardController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/stats', auth, getStats);
router.get('/charts', auth, getCharts);

export default router;
