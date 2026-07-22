import crypto from 'crypto';
import Order from '../models/Order.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import config from '../config/index.js';

// Dynamically import razorpay only when needed
let Razorpay;
const getRazorpayInstance = async () => {
  if (!Razorpay) {
    const razorpayModule = await import('razorpay');
    Razorpay = razorpayModule.default;
  }
  return new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
  });
};

// Create Razorpay Order
export const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      throw ApiError.badRequest('Invalid amount.');
    }

    const razorpay = await getRazorpayInstance();

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: config.razorpay.keyId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Verify Razorpay Payment
export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw ApiError.badRequest('Payment verification failed.');
    }

    // Update order payment status
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = 'paid';
        order.razorpayOrderId = razorpay_order_id;
        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        order.status = 'confirmed';
        order.statusHistory.push({
          status: 'confirmed',
          timestamp: new Date(),
          note: 'Payment verified successfully',
        });
        await order.save();

        // Notification
        await Notification.create({
          type: 'payment_received',
          title: 'Payment Received',
          message: `Payment of ₹${order.grandTotal} received for order #${order.orderNumber}.`,
          refModel: 'Order',
          refId: order._id,
          forAdmin: true,
        });
      }
    }

    res.json({
      success: true,
      message: 'Payment verified successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Get Payment History (Admin)
export const getPaymentHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = { paymentStatus: { $ne: 'pending' } };
    if (status) filter.paymentStatus = status;

    const orders = await Order.find(filter)
      .select('orderNumber user grandTotal paymentMethod paymentStatus razorpayPaymentId createdAt')
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: orders,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};
