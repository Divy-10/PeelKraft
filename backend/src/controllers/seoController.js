import SEO from '../models/SEO.js';
import ApiResponse from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/helpers.js';

// @desc    Get SEO data for a page (public)
// @route   GET /api/seo/:page
export const getSeoByPage = asyncHandler(async (req, res) => {
  const seo = await SEO.findOne({ page: req.params.page }).lean();

  if (!seo) {
    return res.json(new ApiResponse(200, 'No SEO data', null));
  }

  res.json(new ApiResponse(200, 'SEO data fetched', seo));
});

// @desc    Update/Create SEO for a page (admin)
// @route   PUT /api/seo/:page
export const updateSeo = asyncHandler(async (req, res) => {
  const seo = await SEO.findOneAndUpdate(
    { page: req.params.page },
    { ...req.body, page: req.params.page },
    { new: true, upsert: true, runValidators: true }
  );

  res.json(new ApiResponse(200, 'SEO updated', seo));
});

// @desc    Get all SEO entries (admin)
// @route   GET /api/seo
export const getAllSeo = asyncHandler(async (req, res) => {
  const seoEntries = await SEO.find().sort({ page: 1 }).lean();
  res.json(new ApiResponse(200, 'All SEO entries', seoEntries));
});

// @desc    Delete SEO entry (admin)
// @route   DELETE /api/seo/:page
export const deleteSeo = asyncHandler(async (req, res) => {
  await SEO.findOneAndDelete({ page: req.params.page });
  res.json(new ApiResponse(200, 'SEO entry deleted'));
});
