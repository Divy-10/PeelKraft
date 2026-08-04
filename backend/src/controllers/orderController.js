import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Notification from '../models/Notification.js';
import Settings from '../models/Settings.js';
import ApiError from '../utils/ApiError.js';
import { generateInvoicePDF } from '../utils/invoiceGenerator.js';

// Create Order
export const createOrder = async (req, res, next) => {
  try {
    const {
      items, shippingAddress, billingAddress, paymentMethod,
      couponCode, deliveryNotes, razorpayOrderId, razorpayPaymentId, razorpaySignature,
    } = req.body;

    if (!items || items.length === 0) {
      throw ApiError.badRequest('No items in order.');
    }

    if (!shippingAddress) {
      throw ApiError.badRequest('Shipping address is required.');
    }

    const userDoc = req.user;
    shippingAddress.fullName = `${userDoc.firstName || ''} ${userDoc.lastName || ''}`.trim();
    shippingAddress.phone = userDoc.mobileNumber || userDoc.phone || '';
    shippingAddress.whatsapp = userDoc.mobileNumber || userDoc.phone || '';

    if (billingAddress) {
      billingAddress.fullName = `${userDoc.firstName || ''} ${userDoc.lastName || ''}`.trim();
      billingAddress.phone = userDoc.mobileNumber || userDoc.phone || '';
      billingAddress.whatsapp = userDoc.mobileNumber || userDoc.phone || '';
    }

    // Validate products and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw ApiError.badRequest(`Product not found: ${item.product}`);
      }

      let price = 0;
      let packageOptionId = '';
      let packageName = '';

      if (product.packageOptions && product.packageOptions.length > 0 && item.packageOptionId) {
        const option = product.packageOptions.find(opt => opt._id.toString() === item.packageOptionId);
        if (!option) {
          throw ApiError.badRequest(`Package option not found for product: ${product.name}`);
        }
        if (option.status === 'disabled') {
          throw ApiError.badRequest(`Package option ${option.name} is currently disabled.`);
        }
        if (product.trackInventory && option.stock < item.quantity) {
          throw ApiError.badRequest(`Insufficient stock for ${product.name} (${option.name}). Available: ${option.stock}`);
        }
        price = option.sellingPrice || option.mrp || 0;
        packageOptionId = option._id.toString();
        packageName = option.name;
      } else {
        // Fallback to legacy single product
        if (product.trackInventory && product.stock < item.quantity) {
          throw ApiError.badRequest(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
        }
        price = product.sellingPrice || product.mrp || 0;
      }

      const total = price * item.quantity;
      subtotal += total;

      orderItems.push({
        product: product._id,
        name: product.name,
        slug: product.slug,
        image: product.thumbnail?.url || product.gallery?.[0]?.url || '',
        price,
        quantity: item.quantity,
        total,
        packageOptionId,
        packageName,
      });
    }

    // Apply coupon
    let discount = 0;
    let couponData = { code: '', discount: 0 };
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        expiryDate: { $gt: new Date() },
      });

      if (coupon) {
        if (coupon.minPurchase > 0 && subtotal < coupon.minPurchase) {
          throw ApiError.badRequest(`Minimum purchase of ₹${coupon.minPurchase} required for this coupon.`);
        }
        if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
          throw ApiError.badRequest('Coupon usage limit exceeded.');
        }

        // Check per-user limit
        const userUsage = coupon.usedBy.find((u) => u.user.toString() === req.user._id.toString());
        if (userUsage && userUsage.count >= coupon.perUserLimit) {
          throw ApiError.badRequest('You have already used this coupon.');
        }

        if (coupon.discountType === 'percentage') {
          discount = Math.round((subtotal * coupon.discountValue) / 100);
          if (coupon.maxDiscount > 0) {
            discount = Math.min(discount, coupon.maxDiscount);
          }
        } else {
          discount = coupon.discountValue;
        }

        couponData = { code: coupon.code, discount };

        // Update coupon usage
        if (userUsage) {
          userUsage.count += 1;
        } else {
          coupon.usedBy.push({ user: req.user._id, count: 1 });
        }
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    // Calculate shipping and GST
    const settingsObj = await Settings.findOne() || {};
    const threshold = settingsObj.freeShippingMinAmount !== undefined ? settingsObj.freeShippingMinAmount : 499;
    const defaultShipping = settingsObj.shippingCharge !== undefined ? settingsObj.shippingCharge : 49;
    const shippingCharge = subtotal >= threshold ? 0 : defaultShipping;
    const gst = 0; // Can be calculated if needed
    const grandTotal = subtotal - discount + shippingCharge + gst;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      subtotal,
      shippingCharge,
      gst,
      discount,
      grandTotal,
      coupon: couponData,
      paymentMethod: paymentMethod || 'razorpay',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      razorpayOrderId: razorpayOrderId || '',
      razorpayPaymentId: razorpayPaymentId || '',
      razorpaySignature: razorpaySignature || '',
      deliveryNotes: deliveryNotes || '',
      status: 'pending',
      statusHistory: [{ status: 'pending', timestamp: new Date(), note: 'Order placed' }],
    });

    // Reduce inventory
    for (const item of orderItems) {
      if (item.packageOptionId) {
        await Product.updateOne(
          { _id: item.product, 'packageOptions._id': item.packageOptionId },
          { $inc: { 'packageOptions.$.stock': -item.quantity } }
        );
      } else {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }
    }

    // Check for low stock and create notifications
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) continue;

      if (item.packageOptionId) {
        const option = product.packageOptions.find(opt => opt._id.toString() === item.packageOptionId);
        if (option && product.trackInventory && option.stock <= product.lowStockAlert) {
          await Notification.create({
            type: 'low_stock',
            title: 'Low Stock Alert',
            message: `${product.name} (${option.name}) has only ${option.stock} units left.`,
            refModel: 'Product',
            refId: product._id,
            forAdmin: true,
          });
        }
      } else {
        if (product.trackInventory && product.stock <= product.lowStockAlert) {
          await Notification.create({
            type: 'low_stock',
            title: 'Low Stock Alert',
            message: `${product.name} has only ${product.stock} units left.`,
            refModel: 'Product',
            refId: product._id,
            forAdmin: true,
          });
        }
      }
    }

    // Create admin notification
    await Notification.create({
      type: 'new_order',
      title: 'New Order Received',
      message: `Order #${order.orderNumber} placed by ${req.user.firstName} ${req.user.lastName} for ₹${grandTotal}.`,
      refModel: 'Order',
      refId: order._id,
      forAdmin: true,
    });

    const populated = await Order.findById(order._id).populate('user', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// Get My Orders
export const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get Order by ID (user)
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
      .populate('items.product', 'name slug thumbnail gallery');

    if (!order) {
      throw ApiError.notFound('Order not found.');
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// Cancel Order (user — only if pending/confirmed)
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

    if (!order) {
      throw ApiError.notFound('Order not found.');
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      throw ApiError.badRequest('Order cannot be cancelled at this stage.');
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = req.body.reason || 'Cancelled by customer';
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: order.cancellationReason,
    });
    await order.save();

    // Restore inventory
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    res.json({ success: true, message: 'Order cancelled.', data: order });
  } catch (error) {
    next(error);
  }
};

// ========== ADMIN ORDER MANAGEMENT ==========

// Get All Orders (Admin)
export const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search, sort = '-createdAt' } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const orders = await Order.find(filter)
      .populate('user', 'firstName lastName email phone')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get Order Detail (Admin)
export const getAdminOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email phone')
      .populate('items.product', 'name slug thumbnail gallery');

    if (!order) {
      throw ApiError.notFound('Order not found.');
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// Update Order Status (Admin)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const {
      status,
      trackingNumber,
      courierName,
      estimatedDelivery,
      trackingUrl,
      dispatchDate,
      deliveryStatus,
      adminNotes
    } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      throw ApiError.notFound('Order not found.');
    }

    // Backend validations (Step 8)
    const nextStatus = status || order.status;
    if (nextStatus === 'shipped') {
      const finalTrackingNumber = trackingNumber !== undefined ? trackingNumber : order.trackingNumber;
      const finalCourierName = courierName !== undefined ? courierName : order.courierName;
      if (!finalTrackingNumber || !finalTrackingNumber.trim()) {
        throw ApiError.badRequest('Tracking ID is required when status is Shipped.');
      }
      if (!finalCourierName || !finalCourierName.trim()) {
        throw ApiError.badRequest('Courier Service Name is required when status is Shipped.');
      }
    }

    if (trackingUrl) {
      try {
        new URL(trackingUrl);
      } catch (err) {
        throw ApiError.badRequest('Tracking URL must be a valid URL.');
      }
    }

    if (status) {
      order.status = status;
      order.statusHistory.push({
        status,
        timestamp: new Date(),
        note: adminNotes || `Status updated to ${status}`,
      });

      if (status === 'delivered') {
        order.deliveredAt = new Date();
        order.paymentStatus = 'paid';
        order.deliveryStatus = 'delivered';
      }
      if (status === 'shipped') {
        order.deliveryStatus = 'shipped';
      }
      if (status === 'cancelled') {
        order.cancelledAt = new Date();
        // Restore inventory
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity },
          });
        }
      }
    }

    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (courierName !== undefined) order.courierName = courierName;
    if (estimatedDelivery !== undefined) order.estimatedDelivery = estimatedDelivery;
    if (trackingUrl !== undefined) order.trackingUrl = trackingUrl;
    if (dispatchDate !== undefined) order.dispatchDate = dispatchDate;
    if (deliveryStatus !== undefined) order.deliveryStatus = deliveryStatus;
    if (adminNotes !== undefined) order.adminNotes = adminNotes;

    await order.save();

    // Create user notification
    await Notification.create({
      type: 'order_status',
      title: `Order ${order.status}`,
      message: `Your order #${order.orderNumber} has been ${order.status}.`,
      refModel: 'Order',
      refId: order._id,
      forAdmin: false,
      forUser: order.user,
    });

    res.json({ success: true, message: 'Order updated.', data: order });
  } catch (error) {
    next(error);
  }
};

// Stream PDF Invoice Publicly (Step 5 & 6)
export const getOrderInvoicePdf = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const order = await Order.findOne({ orderNumber }).populate('user');
    
    if (!order) {
      return res.status(404).send('Invoice not found.');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="invoice-${order.orderNumber}.pdf"`);

    generateInvoicePDF(order, res);
  } catch (error) {
    next(error);
  }
};
