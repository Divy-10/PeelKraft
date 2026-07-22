import Product from '../models/Product.js';
import Blog from '../models/Blog.js';
import Category from '../models/Category.js';
import Contact from '../models/Contact.js';
import Newsletter from '../models/Newsletter.js';
import Testimonial from '../models/Testimonial.js';
import FAQ from '../models/FAQ.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import ApiResponse from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/helpers.js';

// @desc    Get dashboard stats (admin)
// @route   GET /api/dashboard/stats
export const getStats = asyncHandler(async (req, res) => {
  const [
    productCount,
    categoryCount,
    blogCount,
    faqCount,
    unreadContactCount,
    activeSubscriberCount,
    orderCount,
    userCount,
    salesData,
    lowStockCount,
  ] = await Promise.all([
    Product.countDocuments(),
    Category.countDocuments(),
    Blog.countDocuments(),
    FAQ.countDocuments(),
    Contact.countDocuments({ status: 'unread' }),
    Newsletter.countDocuments({ status: 'active' }),
    Order.countDocuments(),
    User.countDocuments(),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalSales: { $sum: '$grandTotal' } } },
    ]),
    Product.countDocuments({ $expr: { $lte: ['$stock', '$lowStockAlert'] } }),
  ]);

  const totalSales = salesData[0]?.totalSales || 0;

  const stats = {
    products: productCount,
    categories: categoryCount,
    blogs: blogCount,
    faqs: faqCount,
    unreadMessages: unreadContactCount,
    subscribers: activeSubscriberCount,
    totalOrders: orderCount,
    totalUsers: userCount,
    totalSales,
    lowStockProducts: lowStockCount,
  };

  res.json(new ApiResponse(200, 'Dashboard stats', stats));
});

// @desc    Get dashboard charts (admin)
// @route   GET /api/dashboard/charts
export const getCharts = asyncHandler(async (req, res) => {
  // Get top products by stock
  const topProducts = await Product.find()
    .sort({ stock: 1 })
    .limit(5)
    .select('name stock lowStockAlert thumbnail')
    .lean();

  // Get recent orders
  const recentOrders = await Order.find()
    .populate('user', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // Recent contacts
  const recentContacts = await Contact.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  res.json(
    new ApiResponse(200, 'Dashboard charts', {
      topProducts,
      recentOrders,
      recentContacts,
    })
  );
});
