import Coupon from '../models/Coupon.js';
import ApiError from '../utils/ApiError.js';

// Validate coupon (Client)
export const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      startDate: { $lte: new Date() },
      expiryDate: { $gt: new Date() },
    });

    if (!coupon) {
      throw ApiError.badRequest('Invalid or expired coupon code.');
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      throw ApiError.badRequest('Coupon usage limit exceeded.');
    }

    if (coupon.minPurchase > 0 && subtotal < coupon.minPurchase) {
      throw ApiError.badRequest(`Minimum purchase of ₹${coupon.minPurchase} required.`);
    }

    // Check per-user limit
    if (req.user) {
      const userUsage = coupon.usedBy.find((u) => u.user.toString() === req.user._id.toString());
      if (userUsage && userUsage.count >= coupon.perUserLimit) {
        throw ApiError.badRequest('You have already used this coupon the maximum number of times.');
      }
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount > 0) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.discountValue;
    }

    res.json({
      success: true,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount,
        description: coupon.description,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ========== ADMIN CRUD ==========

// Get All Coupons
export const getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (error) {
    next(error);
  }
};

// Create Coupon
export const createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, data: coupon, message: 'Coupon created.' });
  } catch (error) {
    if (error.code === 11000) {
      return next(ApiError.badRequest('A coupon with this code already exists.'));
    }
    next(error);
  }
};

// Update Coupon
export const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) throw ApiError.notFound('Coupon not found.');
    res.json({ success: true, data: coupon, message: 'Coupon updated.' });
  } catch (error) {
    next(error);
  }
};

// Delete Coupon
export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) throw ApiError.notFound('Coupon not found.');
    res.json({ success: true, message: 'Coupon deleted.' });
  } catch (error) {
    next(error);
  }
};
