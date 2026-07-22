import cloudinary from '../config/cloudinary.js';
import config from '../config/index.js';
import fs from 'fs';
import path from 'path';

/**
 * Save file locally as fallback when Cloudinary is unconfigured or fails
 */
const saveFileLocally = (fileBuffer, folder = 'uploads', originalName = 'upload.png') => {
  try {
    const ext = path.extname(originalName) || '.png';
    const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    
    // Target directories
    const backendUploadDir = path.join(process.cwd(), 'uploads');
    const frontendUploadDir = path.join(process.cwd(), '../frontend/public/uploads');

    if (!fs.existsSync(backendUploadDir)) fs.mkdirSync(backendUploadDir, { recursive: true });
    if (!fs.existsSync(frontendUploadDir)) fs.mkdirSync(frontendUploadDir, { recursive: true });

    fs.writeFileSync(path.join(backendUploadDir, filename), fileBuffer);
    fs.writeFileSync(path.join(frontendUploadDir, filename), fileBuffer);

    return {
      secure_url: `/uploads/${filename}`,
      public_id: `local_${filename}`,
      format: ext.replace('.', ''),
      bytes: fileBuffer.length,
      width: 800,
      height: 800,
    };
  } catch (err) {
    console.error('Local save file error:', err);
    throw err;
  }
};

/**
 * Upload a file buffer to Cloudinary with local fallback
 */
const uploadToCloudinary = (fileBuffer, folder = 'peelkraft', resourceType = 'image', originalName = 'upload.png') => {
  // If demo credentials, fallback immediately to local upload
  if (!config.cloudinary.cloudName || config.cloudinary.cloudName === 'demo') {
    return Promise.resolve(saveFileLocally(fileBuffer, folder, originalName));
  }

  return new Promise((resolve) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `peelkraft/${folder}`,
        resource_type: resourceType,
        quality: 'auto',
        fetch_format: 'auto',
      },
      (error, result) => {
        if (error) {
          console.warn('Cloudinary upload error, falling back to local storage:', error.message);
          resolve(saveFileLocally(fileBuffer, folder, originalName));
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete a file from Cloudinary
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    if (publicId && publicId.startsWith('local_')) {
      const filename = publicId.replace('local_', '');
      const backendFile = path.join(process.cwd(), 'uploads', filename);
      const frontendFile = path.join(process.cwd(), '../frontend/public/uploads', filename);
      if (fs.existsSync(backendFile)) fs.unlinkSync(backendFile);
      if (fs.existsSync(frontendFile)) fs.unlinkSync(frontendFile);
      return { result: 'ok' };
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return { result: 'ok' };
  }
};

/**
 * Upload multiple files
 */
const uploadMultiple = async (files, folder = 'peelkraft') => {
  const uploadPromises = files.map((file) =>
    uploadToCloudinary(file.buffer, folder, 'image', file.originalname)
  );
  return Promise.all(uploadPromises);
};

export { uploadToCloudinary, deleteFromCloudinary, uploadMultiple };
