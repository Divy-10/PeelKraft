import Testimonial from '../models/Testimonial.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/helpers.js';

// @desc    Get all testimonials (public - returns only active/featured)
// @route   GET /api/testimonials
export const getTestimonials = asyncHandler(async (req, res) => {
  const filter = {};
  if (!req.admin) {
    filter.status = 'active';
    if (req.query.featured === 'true') filter.featured = true;
  }

  const testimonials = await Testimonial.find(filter).sort({ order: 1 }).lean();
  res.json(new ApiResponse(200, 'Testimonials fetched', testimonials));
});

// @desc    Create testimonial (admin)
// @route   POST /api/testimonials
export const createTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.create(req.body);
  res.status(201).json(new ApiResponse(201, 'Testimonial created', testimonial));
});

// @desc    Update testimonial (admin)
// @route   PUT /api/testimonials/:id
export const updateTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) throw ApiError.notFound('Testimonial not found');

  const updated = await Testimonial.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json(new ApiResponse(200, 'Testimonial updated', updated));
});

// @desc    Delete testimonial (admin)
// @route   DELETE /api/testimonials/:id
export const deleteTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) throw ApiError.notFound('Testimonial not found');

  await Testimonial.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse(200, 'Testimonial deleted'));
});
