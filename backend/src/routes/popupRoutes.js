import { Router } from 'express';
import {
  getActivePopup,
  incrementView,
  incrementClick,
  incrementCopy,
  incrementClose,
  getAllPopups,
  createPopup,
  updatePopup,
  deletePopup,
  duplicatePopup,
  toggleStatus,
  getAnalytics,
} from '../controllers/popupController.js';
import auth from '../middleware/auth.js';

const router = Router();

// Public / Visitor routes
router.get('/active', getActivePopup);
router.post('/:id/view', incrementView);
router.post('/:id/click', incrementClick);
router.post('/:id/copy', incrementCopy);
router.post('/:id/close', incrementClose);

// Admin routes (Protected)
router.get('/', auth, getAllPopups);
router.post('/', auth, createPopup);
router.put('/:id', auth, updatePopup);
router.delete('/:id', auth, deletePopup);
router.post('/:id/duplicate', auth, duplicatePopup);
router.patch('/:id/status', auth, toggleStatus);
router.get('/analytics/overview', auth, getAnalytics);

export default router;
