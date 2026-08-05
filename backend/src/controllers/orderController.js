import mongoose from 'mongoose';
import ExcelJS from 'exceljs';
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
const getISTDateDetails = (date) => {
  const offset = 5.5 * 60 * 60 * 1000; // 5.5 hours in ms for IST
  const istDate = new Date(date.getTime() + offset);
  
  const year = istDate.getUTCFullYear();
  const monthIdx = istDate.getUTCMonth(); // 0-11
  const day = istDate.getUTCDate();
  const hours = istDate.getUTCHours();
  const minutes = istDate.getUTCMinutes();
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const monthName = months[monthIdx];
  const pad = (n) => String(n).padStart(2, '0');
  
  const dateString = `${pad(day)}/${pad(monthIdx + 1)}/${year}`;
  const displayDateString = `${pad(day)} ${monthName} ${year}`;
  const timeString = `${pad(hours)}:${pad(minutes)}`;
  
  return {
    year,
    monthNum: monthIdx + 1,
    monthName,
    day,
    dateString,
    displayDateString,
    timeString
  };
};

const getMonthNumber = (m) => {
  if (!m) return null;
  const num = parseInt(m);
  if (!isNaN(num)) return num;
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const idx = months.indexOf(m.toLowerCase());
  return idx !== -1 ? idx + 1 : null;
};

const buildDateFilter = (query) => {
  const { fromDate, toDate, month, year } = query;
  let start, end;

  if (fromDate || toDate) {
    if (fromDate) {
      start = new Date(`${fromDate}T00:00:00+05:30`);
    }
    if (toDate) {
      end = new Date(`${toDate}T23:59:59.999+05:30`);
    }
  } else if (month && year) {
    const yearNum = parseInt(year);
    const monthNum = getMonthNumber(month);
    if (yearNum && monthNum) {
      const pad = (n) => String(n).padStart(2, '0');
      const lastDay = new Date(yearNum, monthNum, 0).getDate();
      start = new Date(`${yearNum}-${pad(monthNum)}-01T00:00:00+05:30`);
      end = new Date(`${yearNum}-${pad(monthNum)}-${pad(lastDay)}T23:59:59.999+05:30`);
    }
  } else if (year) {
    const yearNum = parseInt(year);
    if (yearNum) {
      start = new Date(`${yearNum}-01-01T00:00:00+05:30`);
      end = new Date(`${yearNum}-12-31T23:59:59.999+05:30`);
    }
  }

  if (start || end) {
    const dateQuery = {};
    if (start) dateQuery.$gte = start;
    if (end) dateQuery.$lte = end;
    return dateQuery;
  }
  return null;
};

// Get All Orders (Admin)
export const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search, sort = '-createdAt', fromDate, toDate, month, year } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;
    
    if (search) {
      const users = await mongoose.model('User').find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { mobileNumber: { $regex: search, $options: 'i' } },
        ]
      }).select('_id');
      const userIds = users.map(u => u._id);

      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { user: { $in: userIds } },
        { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: search, $options: 'i' } },
      ];
    }

    const dateQuery = buildDateFilter({ fromDate, toDate, month, year });
    if (dateQuery) {
      filter.createdAt = dateQuery;
    }

    let mongoSort = { createdAt: -1 };
    if (sort === 'createdAt' || sort === 'oldest') {
      mongoSort = { createdAt: 1 };
    } else if (sort === '-createdAt' || sort === 'newest') {
      mongoSort = { createdAt: -1 };
    }

    const orders = await Order.find(filter)
      .populate('user', 'firstName lastName email phone')
      .sort(mongoSort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    // Calculate summary dynamically based on the same filter
    const summaryData = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSales: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'cancelled'] },
                0,
                '$grandTotal'
              ]
            }
          },
          paidOrders: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0]
            }
          },
          cancelledOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const summaryRaw = summaryData[0] || {
      totalOrders: 0,
      totalSales: 0,
      paidOrders: 0,
      cancelledOrders: 0
    };

    const summary = {
      totalOrders: summaryRaw.totalOrders,
      totalSales: summaryRaw.totalSales,
      paidOrders: summaryRaw.paidOrders,
      cancelledOrders: summaryRaw.cancelledOrders,
      pendingOrders: summaryRaw.totalOrders - summaryRaw.paidOrders - summaryRaw.cancelledOrders
    };

    res.json({
      success: true,
      data: orders,
      summary,
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

// Export Orders to Excel (Admin)
export const exportOrdersExcel = async (req, res, next) => {
  try {
    const { status, search, sort = '-createdAt', fromDate, toDate, month, year } = req.query;

    const filter = {};
    if (status) filter.status = status;
    
    if (search) {
      const users = await mongoose.model('User').find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { mobileNumber: { $regex: search, $options: 'i' } },
        ]
      }).select('_id');
      const userIds = users.map(u => u._id);

      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { user: { $in: userIds } },
        { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: search, $options: 'i' } },
      ];
    }

    const dateQuery = buildDateFilter({ fromDate, toDate, month, year });
    if (dateQuery) {
      filter.createdAt = dateQuery;
    }

    let mongoSort = { createdAt: -1 };
    if (sort === 'createdAt' || sort === 'oldest') {
      mongoSort = { createdAt: 1 };
    } else if (sort === '-createdAt' || sort === 'newest') {
      mongoSort = { createdAt: -1 };
    }

    const orders = await Order.find(filter)
      .populate('user', 'firstName lastName email phone')
      .sort(mongoSort);

    const workbook = new ExcelJS.Workbook();
    
    // Worksheet 1: Orders
    const ordersSheet = workbook.addWorksheet('Orders');
    
    ordersSheet.columns = [
      { header: 'Order ID', key: 'orderId', width: 20 },
      { header: 'Order Date', key: 'orderDate', width: 15 },
      { header: 'Order Time', key: 'orderTime', width: 12 },
      { header: 'Month', key: 'month', width: 15 },
      { header: 'Year', key: 'year', width: 10 },
      { header: 'Customer Name', key: 'customerName', width: 25 },
      { header: 'Customer Email', key: 'customerEmail', width: 25 },
      { header: 'Customer Mobile', key: 'customerMobile', width: 15 },
      { header: 'Product Name', key: 'productName', width: 30 },
      { header: 'Package Name', key: 'packageName', width: 20 },
      { header: 'Package Quantity', key: 'packageQuantity', width: 18 },
      { header: 'Product Quantity', key: 'productQuantity', width: 18 },
      { header: 'Unit Price', key: 'unitPrice', width: 12 },
      { header: 'Total Amount', key: 'totalAmount', width: 15 },
      { header: 'Payment Status', key: 'paymentStatus', width: 15 },
      { header: 'Order Status', key: 'orderStatus', width: 15 },
      { header: 'Shipping Address', key: 'shippingAddress', width: 40 },
      { header: 'City', key: 'city', width: 15 },
      { header: 'State', key: 'state', width: 15 },
      { header: 'Pincode', key: 'pincode', width: 12 },
      { header: 'Created At', key: 'createdAt', width: 25 },
    ];

    ordersSheet.getRow(1).font = { bold: true };
    ordersSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    const monthlySummary = {};
    const dailySummary = {};

    orders.forEach(order => {
      const ist = getISTDateDetails(order.createdAt);
      const mKey = `${ist.monthName} ${ist.year}`;
      const dKey = ist.dateString;

      if (!monthlySummary[mKey]) {
        monthlySummary[mKey] = {
          month: ist.monthName,
          year: ist.year,
          totalOrders: 0,
          paidOrders: 0,
          pendingOrders: 0,
          cancelledOrders: 0,
          totalSales: 0,
          orderIds: new Set()
        };
      }

      if (!dailySummary[dKey]) {
        dailySummary[dKey] = {
          date: ist.dateString,
          totalOrders: 0,
          paidOrders: 0,
          cancelledOrders: 0,
          totalSales: 0,
          orderIds: new Set()
        };
      }

      if (!monthlySummary[mKey].orderIds.has(order._id.toString())) {
        monthlySummary[mKey].orderIds.add(order._id.toString());
        monthlySummary[mKey].totalOrders += 1;
        if (order.paymentStatus === 'paid') monthlySummary[mKey].paidOrders += 1;
        else if (order.status === 'cancelled') monthlySummary[mKey].cancelledOrders += 1;
        else monthlySummary[mKey].pendingOrders += 1;

        if (order.status !== 'cancelled') {
          monthlySummary[mKey].totalSales += order.grandTotal;
        }
      }

      if (!dailySummary[dKey].orderIds.has(order._id.toString())) {
        dailySummary[dKey].orderIds.add(order._id.toString());
        dailySummary[dKey].totalOrders += 1;
        if (order.paymentStatus === 'paid') dailySummary[dKey].paidOrders += 1;
        if (order.status === 'cancelled') dailySummary[dKey].cancelledOrders += 1;

        if (order.status !== 'cancelled') {
          dailySummary[dKey].totalSales += order.grandTotal;
        }
      }

      (order.items || []).forEach(item => {
        ordersSheet.addRow({
          orderId: order.orderNumber,
          orderDate: ist.displayDateString,
          orderTime: ist.timeString,
          month: ist.monthName,
          year: ist.year,
          customerName: order.shippingAddress?.fullName || `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim(),
          customerEmail: order.user?.email || '',
          customerMobile: order.shippingAddress?.phone || order.user?.phone || '',
          productName: item.name,
          packageName: item.packageName || 'None',
          packageQuantity: item.packageName ? item.quantity : '',
          productQuantity: item.packageName ? '' : item.quantity,
          unitPrice: item.price,
          totalAmount: order.grandTotal,
          paymentStatus: order.paymentStatus,
          orderStatus: order.status,
          shippingAddress: `${order.shippingAddress?.addressLine1 || ''} ${order.shippingAddress?.addressLine2 || ''}`.trim(),
          city: order.shippingAddress?.city || '',
          state: order.shippingAddress?.state || '',
          pincode: order.shippingAddress?.pincode || '',
          createdAt: order.createdAt.toISOString(),
        });
      });
    });

    // Worksheet 2: Monthly Summary
    const monthlySheet = workbook.addWorksheet('Monthly Summary');
    monthlySheet.columns = [
      { header: 'Month', key: 'month', width: 15 },
      { header: 'Year', key: 'year', width: 10 },
      { header: 'Total Orders', key: 'orders', width: 15 },
      { header: 'Paid Orders', key: 'paid', width: 15 },
      { header: 'Pending Orders', key: 'pending', width: 15 },
      { header: 'Cancelled Orders', key: 'cancelled', width: 18 },
      { header: 'Total Sales', key: 'sales', width: 18 },
    ];

    monthlySheet.getRow(1).font = { bold: true };
    monthlySheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    Object.keys(monthlySummary).forEach(key => {
      const ms = monthlySummary[key];
      monthlySheet.addRow({
        month: ms.month,
        year: ms.year,
        orders: ms.totalOrders,
        paid: ms.paidOrders,
        pending: ms.pendingOrders,
        cancelled: ms.cancelledOrders,
        sales: ms.totalSales
      });
    });

    // Worksheet 3: Daily Summary
    const dailySheet = workbook.addWorksheet('Daily Summary');
    dailySheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Total Orders', key: 'orders', width: 15 },
      { header: 'Paid Orders', key: 'paid', width: 15 },
      { header: 'Cancelled Orders', key: 'cancelled', width: 18 },
      { header: 'Total Sales', key: 'sales', width: 18 },
    ];

    dailySheet.getRow(1).font = { bold: true };
    dailySheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    Object.keys(dailySummary).forEach(key => {
      const ds = dailySummary[key];
      dailySheet.addRow({
        date: ds.date,
        orders: ds.totalOrders,
        paid: ds.paidOrders,
        cancelled: ds.cancelledOrders,
        sales: ds.totalSales
      });
    });

    let filename = 'PeelKraft_Orders_All';
    if (fromDate && toDate) {
      filename = `PeelKraft_Orders_${fromDate}_to_${toDate}`;
    } else if (month && year) {
      filename = `PeelKraft_Orders_${month}_${year}`;
    } else if (year) {
      filename = `PeelKraft_Orders_${year}`;
    }
    filename = filename.replace(/[^a-zA-Z0-9-_]/g, '_') + '.xlsx';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
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
