import Review from '../models/Review.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/helpers.js';

// @desc    Get all testimonials (Public - queries featured approved customer reviews)
// @route   GET /api/testimonials
export const getTestimonials = asyncHandler(async (req, res) => {
  // Query all featured approved reviews
  const featuredReviews = await Review.find({ status: 'approved', featured: true })
    .populate('product', 'name')
    .sort({ createdAt: -1 })
    .lean();

  // Map them into the existing Testimonial schema format to keep Home.jsx slider working
  const testimonials = featuredReviews.map((r) => ({
    _id: r._id,
    name: r.customerName || 'Anonymous',
    designation: r.title || 'Verified Customer',
    company: r.product ? `Product: ${r.product.name}` : 'Brand Experience',
    content: r.comment || '',
    avatar: {
      url: r.profilePhoto || '/images/logo.png',
      publicId: '',
    },
    rating: r.rating || 5,
    featured: true,
    status: 'active',
  }));

  res.json(new ApiResponse(200, 'Testimonials fetched from featured reviews', testimonials));
});

// Deprecated manual admin methods
export const createTestimonial = asyncHandler(async (req, res) => {
  throw ApiError.badRequest('Manual creation of testimonials is deprecated. Please manage reviews instead.');
});

export const updateTestimonial = asyncHandler(async (req, res) => {
  throw ApiError.badRequest('Manual updating of testimonials is deprecated. Please manage reviews instead.');
});

export const deleteTestimonial = asyncHandler(async (req, res) => {
  throw ApiError.badRequest('Manual deletion of testimonials is deprecated. Please manage reviews instead.');
});
