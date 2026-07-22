import Settings from '../models/Settings.js';
import ApiResponse from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/helpers.js';

// @desc    Get site settings (public)
// @route   GET /api/settings
export const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne().lean();

  if (!settings) {
    settings = await Settings.create({});
  }

  // Remove SMTP credentials for public access
  if (!req.admin) {
    delete settings.smtp;
  }

  res.json(new ApiResponse(200, 'Settings fetched', settings));
});

// @desc    Update site settings (admin)
// @route   PUT /api/settings
export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.findOneAndUpdate({}, req.body, {
    new: true,
    upsert: true,
    runValidators: true,
  });

  res.json(new ApiResponse(200, 'Settings updated', settings));
});
