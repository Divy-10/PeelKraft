import Media from '../models/Media.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { asyncHandler, getPaginationParams } from '../utils/helpers.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinaryService.js';
import path from 'path';

// @desc    Upload media (admin)
// @route   POST /api/media/upload
export const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded');

  const folder = req.body.folder || 'general';
  const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');

  let resourceType = 'image';
  if (['mp4', 'webm', 'mov'].includes(ext)) resourceType = 'video';
  else if (ext === 'pdf') resourceType = 'raw';

  const result = await uploadToCloudinary(req.file.buffer, folder, resourceType, req.file.originalname);

  let fileType = 'image';
  if (['mp4', 'webm', 'mov'].includes(ext)) fileType = 'video';
  else if (ext === 'pdf') fileType = 'pdf';

  const media = await Media.create({
    filename: req.file.originalname.replace(path.extname(req.file.originalname), ''),
    originalName: req.file.originalname,
    url: result.secure_url,
    publicId: result.public_id,
    type: fileType,
    format: result.format || ext,
    size: result.bytes || req.file.size,
    width: result.width || 0,
    height: result.height || 0,
    folder,
    uploadedBy: req.admin._id,
  });

  res.status(201).json(new ApiResponse(201, 'File uploaded', media));
});

// @desc    Get all media (admin)
// @route   GET /api/media
export const getMedia = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);

  const filter = {};
  if (req.query.type) filter.type = req.query.type;
  if (req.query.folder) filter.folder = req.query.folder;

  const [media, total] = await Promise.all([
    Media.find(filter)
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Media.countDocuments(filter),
  ]);

  const pagination = { page, limit, total, pages: Math.ceil(total / limit) };
  res.json(ApiResponse.paginated(media, pagination));
});

// @desc    Delete media (admin)
// @route   DELETE /api/media/:id
export const deleteMedia = asyncHandler(async (req, res) => {
  const media = await Media.findById(req.params.id);
  if (!media) throw ApiError.notFound('Media not found');

  // Delete from Cloudinary
  const resourceType = media.type === 'video' ? 'video' : media.type === 'pdf' ? 'raw' : 'image';
  await deleteFromCloudinary(media.publicId, resourceType);

  await Media.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse(200, 'Media deleted'));
});

// @desc    Get folders (admin)
// @route   GET /api/media/folders
export const getFolders = asyncHandler(async (req, res) => {
  const folders = await Media.distinct('folder');
  res.json(new ApiResponse(200, 'Folders fetched', folders));
});

// @desc    Create folder (admin)
// @route   POST /api/media/folders
export const createFolder = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) throw ApiError.badRequest('Folder name is required');
  res.json(new ApiResponse(200, 'Folder created', { name }));
});
