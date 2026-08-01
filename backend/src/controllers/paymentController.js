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

    const isProduction = config.nodeEnv === 'production';

    if (!config.razorpay.keyId || !config.razorpay.keySecret) {
      if (isProduction) {
        throw ApiError.internal('Razorpay payment gateway credentials are not configured in production.');
      }
      console.log('⚠️ Razorpay credentials not configured. Returning mock order details...');
      return res.json({
        success: true,
        data: {
          orderId: `order_mock_${Date.now()}`,
          amount: Math.round(amount * 100),
          currency: 'INR',
          keyId: 'rzp_test_mock_key',
          isMock: true
        },
      });
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

    const isProduction = config.nodeEnv === 'production';

    // 1. Check for mock payments
    if (razorpay_order_id && razorpay_order_id.startsWith('order_mock_')) {
      if (isProduction) {
        throw ApiError.badRequest('Mock payments are disabled in production mode.');
      }
      console.log('⚠️ Verifying mock payment in development mode...');
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          order.paymentStatus = 'paid';
          order.razorpayOrderId = razorpay_order_id;
          order.razorpayPaymentId = razorpay_payment_id || `pay_mock_${Date.now()}`;
          order.razorpaySignature = 'mock_signature';
          order.status = 'confirmed';
          order.statusHistory.push({
            status: 'confirmed',
            timestamp: new Date(),
            note: 'Mock payment verified successfully (development mode)',
          });
          await order.save();

          await Notification.create({
            type: 'payment_received',
            title: 'Payment Received',
            message: `Mock payment of ₹${order.grandTotal} received for order #${order.orderNumber}.`,
            refModel: 'Order',
            refId: order._id,
            forAdmin: true,
          });
        }
      }
      return res.json({
        success: true,
        message: 'Mock payment verified successfully.',
      });
    }

    // 2. Validate input parameters
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw ApiError.badRequest('Missing required payment parameters.');
    }

    // 3. Verify signature using Live/Configured Secret Key
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw ApiError.badRequest('Payment signature verification failed.');
    }

    // 4. Retrieve and verify Order from database
    if (!orderId) {
      throw ApiError.badRequest('Missing order ID.');
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw ApiError.notFound('Order not found.');
    }

    // 5. Prevent duplicate payments / replay attacks
    const duplicateOrder = await Order.findOne({
      razorpayPaymentId: razorpay_payment_id,
      _id: { $ne: order._id },
      paymentStatus: 'paid'
    });
    if (duplicateOrder) {
      throw ApiError.badRequest('This payment transaction has already been verified for another order.');
    }

    // 6. Verify amount against actual payment details fetched from Razorpay API
    const razorpay = await getRazorpayInstance();
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);
    } catch (err) {
      throw ApiError.badRequest('Failed to retrieve order status from payment gateway.');
    }

    if (!razorpayOrder) {
      throw ApiError.badRequest('Razorpay order details not found.');
    }

    const expectedAmountPaise = Math.round(order.grandTotal * 100);
    if (razorpayOrder.amount !== expectedAmountPaise) {
      throw ApiError.badRequest('Payment amount mismatch detected. Please contact support.');
    }

    // 7. Update order payment status
    if (order.paymentStatus !== 'paid') {
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

