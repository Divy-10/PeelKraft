import Product from '../models/Product.js';
import Blog from '../models/Blog.js';
import Category from '../models/Category.js';
import Contact from '../models/Contact.js';
import Newsletter from '../models/Newsletter.js';
import Testimonial from '../models/Testimonial.js';
import FAQ from '../models/FAQ.js';
import ApiResponse from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/helpers.js';
import { getDashboardStats, getMonthlyChartData } from '../services/analyticsService.js';

// @desc    Get dashboard stats (admin)
// @route   GET /api/dashboard/stats
export const getStats = asyncHandler(async (req, res) => {
  const [
    productCount,
    categoryCount,
    blogCount,
    faqCount,
    testimonialCount,
    unreadContactCount,
    totalContactCount,
    activeSubscriberCount,
    analyticsStats,
  ] = await Promise.all([
    Product.countDocuments(),
    Category.countDocuments(),
    Blog.countDocuments(),
    FAQ.countDocuments(),
    Testimonial.countDocuments(),
    Contact.countDocuments({ status: 'unread' }),
    Contact.countDocuments(),
    Newsletter.countDocuments({ status: 'active' }),
    getDashboardStats(),
  ]);

  const stats = {
    products: productCount,
    categories: categoryCount,
    blogs: blogCount,
    faqs: faqCount,
    testimonials: testimonialCount,
    unreadMessages: unreadContactCount,
    totalMessages: totalContactCount,
    subscribers: activeSubscriberCount,
    visitors: analyticsStats.totalPageViews,
    monthlyVisitors: analyticsStats.monthlyPageViews,
    amazonClicks: analyticsStats.totalAmazonClicks,
    monthlyAmazonClicks: analyticsStats.monthlyAmazonClicks,
  };

  res.json(new ApiResponse(200, 'Dashboard stats', stats));
});

// @desc    Get dashboard charts (admin)
// @route   GET /api/dashboard/charts
export const getCharts = asyncHandler(async (req, res) => {
  const chartData = await getMonthlyChartData();

  // Get top products by views
  const topProducts = await Product.find({ status: 'published' })
    .sort({ views: -1 })
    .limit(5)
    .select('name views amazonClicks thumbnail')
    .lean();

  // Get top blogs by views
  const topBlogs = await Blog.find({ status: 'published' })
    .sort({ views: -1 })
    .limit(5)
    .select('title views featuredImage')
    .lean();

  // Recent contacts
  const recentContacts = await Contact.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  res.json(
    new ApiResponse(200, 'Dashboard charts', {
      monthly: chartData,
      topProducts,
      topBlogs,
      recentContacts,
    })
  );
});
