import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import ApiError from '../utils/ApiError.js';

// Helper: recalculate product avg rating
const updateProductRating = async (productId) => {
  if (!productId) return;
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
    const { productId } = req.params;
    const { sortBy } = req.query;

    let sortOption = { createdAt: -1 }; // Default: Newest
    if (sortBy === 'oldest') sortOption = { createdAt: 1 };
    else if (sortBy === 'highest') sortOption = { rating: -1, createdAt: -1 };
    else if (sortBy === 'lowest') sortOption = { rating: 1, createdAt: -1 };
    else if (sortBy === 'helpful') sortOption = { helpfulCount: -1, createdAt: -1 };

    const reviews = await Review.find({ product: productId, status: 'approved' })
      .sort(sortOption);

    // Calculate aggregations & Rating breakdown
    const allApprovedReviews = await Review.find({ product: productId, status: 'approved' });
    const totalReviews = allApprovedReviews.length;
    
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sumRating = 0;

    allApprovedReviews.forEach((r) => {
      sumRating += r.rating;
      if (breakdown[r.rating] !== undefined) {
        breakdown[r.rating]++;
      }
    });

    const averageRating = totalReviews > 0 ? (sumRating / totalReviews).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        reviews,
        stats: {
          averageRating: parseFloat(averageRating),
          totalReviews,
          breakdown,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create Review (Public / User)
export const createReview = async (req, res, next) => {
  try {
    const { productId, rating, title, comment, customerName, email, profilePhoto, images } = req.body;

    const parsedRating = parseInt(rating, 10);
    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
      throw ApiError.badRequest('Rating must be a number between 1 and 5.');
    }

    let isVerifiedPurchase = false;
    let userId = null;

    // Optional user authentication check
    if (req.user) {
      userId = req.user._id;
      if (productId) {
        const hasPurchased = await Order.findOne({
          user: userId,
          'items.product': productId,
          status: 'delivered',
        });
        if (hasPurchased) isVerifiedPurchase = true;
      }
    }

    const review = await Review.create({
      product: productId || null,
      user: userId,
      customerName,
      email,
      profilePhoto: profilePhoto || '',
      rating: parsedRating,
      title: title || '',
      comment,
      images: images || [],
      isVerifiedPurchase,
      status: 'approved', // Auto-approved on submission
    });

    if (productId && review.status === 'approved') {
      await updateProductRating(productId);
    }

    res.status(201).json({
      success: true,
      data: review,
      message: 'Thank you! Your review has been submitted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Get All Reviews (Admin Moderation Dashboard)
export const getAllReviews = async (req, res, next) => {
  try {
    const { status, keyword } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (keyword) {
      filter.$or = [
        { customerName: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
        { title: { $regex: keyword, $options: 'i' } },
        { comment: { $regex: keyword, $options: 'i' } },
      ];
    }

    const reviews = await Review.find(filter)
      .populate('product', 'name slug')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// Update Review Status (Admin Moderation)
export const updateReviewStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected', 'spam'].includes(status)) {
      throw ApiError.badRequest('Invalid status value');
    }

    const review = await Review.findById(req.params.id);
    if (!review) throw ApiError.notFound('Review not found.');

    review.status = status;
    await review.save();

    if (review.product) {
      await updateProductRating(review.product);
    }

    res.json({
      success: true,
      data: review,
      message: `Review status updated to ${status}.`,
    });
  } catch (error) {
    next(error);
  }
};

// Toggle Featured Review (Admin Star toggle)
export const toggleFeatured = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) throw ApiError.notFound('Review not found.');

    review.featured = !review.featured;
    await review.save();

    res.json({
      success: true,
      data: review,
      message: `Review featured status set to ${review.featured}.`,
    });
  } catch (error) {
    next(error);
  }
};

// Increment Helpful Count (Public / Visitor)
export const markHelpful = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) throw ApiError.notFound('Review not found.');

    review.helpfulCount += 1;
    await review.save();

    res.json({
      success: true,
      data: review,
      message: 'Helpful vote registered.',
    });
  } catch (error) {
    next(error);
  }
};

// Delete Review (Admin)
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) throw ApiError.notFound('Review not found.');

    if (review.product) {
      await updateProductRating(review.product);
    }

    res.json({
      success: true,
      message: 'Review deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
