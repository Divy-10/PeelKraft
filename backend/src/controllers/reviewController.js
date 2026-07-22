import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import ApiError from '../utils/ApiError.js';

// Helper: recalculate product avg rating
const updateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId, status: 'approved' } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      avgRating: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].count,
    });
  } else {
    await Product.findByIdAndUpdate(productId, { avgRating: 0, numReviews: 0 });
  }
};

// Get Reviews for a Product (Public)
export const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, status: 'approved' })
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

// Create Review (User)
export const createReview = async (req, res, next) => {
  try {
    const { productId, rating, title, comment } = req.body;

    // Check if user already reviewed
    const existing = await Review.findOne({ product: productId, user: req.user._id });
    if (existing) {
      throw ApiError.badRequest('You have already reviewed this product.');
    }

    // Check verified purchase
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      'items.product': productId,
      status: 'delivered',
    });

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating,
      title,
      comment,
      isVerifiedPurchase: !!hasPurchased,
      status: 'approved', // Auto-approve for now
    });

    await updateProductRating(productId);

    res.status(201).json({ success: true, data: review, message: 'Review submitted.' });
  } catch (error) {
    next(error);
  }
};

// Get All Reviews (Admin)
export const getAllReviews = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const filter = {};
    if (status) filter.status = status;

    const reviews = await Review.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('product', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(filter);

    res.json({
      success: true,
      data: reviews,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// Update Review Status (Admin)
export const updateReviewStatus = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!review) throw ApiError.notFound('Review not found.');

    await updateProductRating(review.product);

    res.json({ success: true, data: review, message: 'Review status updated.' });
  } catch (error) {
    next(error);
  }
};

// Delete Review (Admin)
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) throw ApiError.notFound('Review not found.');

    await updateProductRating(review.product);

    res.json({ success: true, message: 'Review deleted.' });
  } catch (error) {
    next(error);
  }
};
