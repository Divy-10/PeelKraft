import multer from 'multer';
import path from 'path';
import ApiError from '../utils/ApiError.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp|svg/;
  const allowedVideoTypes = /mp4|webm|mov/;
  const allowedDocTypes = /pdf/;

  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');

  if (
    allowedImageTypes.test(ext) ||
    allowedVideoTypes.test(ext) ||
    allowedDocTypes.test(ext)
  ) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(
        'Invalid file type. Allowed: images (jpg, png, gif, webp, svg), videos (mp4, webm, mov), documents (pdf)'
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export default upload;
