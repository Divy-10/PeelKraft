import { Router } from 'express';
import { uploadMedia, getMedia, deleteMedia, getFolders, createFolder } from '../controllers/mediaController.js';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import upload from '../middleware/upload.js';

const router = Router();

router.post('/upload', auth, roleCheck('superadmin', 'admin', 'editor'), upload.single('file'), uploadMedia);
router.get('/', auth, getMedia);
router.get('/folders', auth, getFolders);
router.post('/folders', auth, roleCheck('superadmin', 'admin'), createFolder);
router.delete('/:id', auth, roleCheck('superadmin', 'admin'), deleteMedia);

export default router;
