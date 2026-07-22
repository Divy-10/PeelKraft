import FAQ from '../models/FAQ.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/helpers.js';

// @desc    Get all FAQs (public)
// @route   GET /api/faqs
export const getFaqs = asyncHandler(async (req, res) => {
  const filter = {};
  if (!req.admin) filter.status = 'active';
  if (req.query.category) filter.category = req.query.category;

  const faqs = await FAQ.find(filter).sort({ order: 1 }).lean();
  res.json(new ApiResponse(200, 'FAQs fetched', faqs));
});

// @desc    Create FAQ (admin)
// @route   POST /api/faqs
export const createFaq = asyncHandler(async (req, res) => {
  const faq = await FAQ.create(req.body);
  res.status(201).json(new ApiResponse(201, 'FAQ created', faq));
});

// @desc    Update FAQ (admin)
// @route   PUT /api/faqs/:id
export const updateFaq = asyncHandler(async (req, res) => {
  const faq = await FAQ.findById(req.params.id);
  if (!faq) throw ApiError.notFound('FAQ not found');

  const updated = await FAQ.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json(new ApiResponse(200, 'FAQ updated', updated));
});

// @desc    Delete FAQ (admin)
// @route   DELETE /api/faqs/:id
export const deleteFaq = asyncHandler(async (req, res) => {
  const faq = await FAQ.findById(req.params.id);
  if (!faq) throw ApiError.notFound('FAQ not found');

  await FAQ.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse(200, 'FAQ deleted'));
});

// @desc    Reorder FAQs (admin)
// @route   PUT /api/faqs/reorder
export const reorderFaqs = asyncHandler(async (req, res) => {
  const { items } = req.body; // [{ id, order }]

  const updates = items.map((item) =>
    FAQ.findByIdAndUpdate(item.id, { order: item.order })
  );

  await Promise.all(updates);
  res.json(new ApiResponse(200, 'FAQs reordered'));
});
