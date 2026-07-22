import Analytics from '../models/Analytics.js';

/**
 * Track an analytics event
 */
const trackEvent = async (req, event, page, metadata = {}) => {
  try {
    await Analytics.create({
      page,
      event,
      metadata,
      ip: req.ip || req.connection?.remoteAddress || '',
      userAgent: req.headers['user-agent'] || '',
      referer: req.headers.referer || '',
    });
  } catch (error) {
    console.error('Analytics tracking error:', error.message);
  }
};

/**
 * Get dashboard statistics
 */
const getDashboardStats = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [totalPageViews, monthlyPageViews, totalAmazonClicks, monthlyAmazonClicks] =
    await Promise.all([
      Analytics.countDocuments({ event: 'pageView' }),
      Analytics.countDocuments({
        event: 'pageView',
        createdAt: { $gte: startOfMonth },
      }),
      Analytics.countDocuments({ event: 'amazonClick' }),
      Analytics.countDocuments({
        event: 'amazonClick',
        createdAt: { $gte: startOfMonth },
      }),
    ]);

  return {
    totalPageViews,
    monthlyPageViews,
    totalAmazonClicks,
    monthlyAmazonClicks,
  };
};

/**
 * Get monthly chart data for the past 12 months
 */
const getMonthlyChartData = async () => {
  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const pipeline = [
    {
      $match: {
        createdAt: { $gte: twelveMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          event: '$event',
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
  ];

  const results = await Analytics.aggregate(pipeline);

  // Format into monthly arrays
  const months = [];
  const pageViews = [];
  const amazonClicks = [];

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const monthName = date.toLocaleString('default', { month: 'short' });

    months.push(`${monthName} ${year}`);

    const pvData = results.find(
      (r) => r._id.year === year && r._id.month === month && r._id.event === 'pageView'
    );
    const acData = results.find(
      (r) => r._id.year === year && r._id.month === month && r._id.event === 'amazonClick'
    );

    pageViews.push(pvData ? pvData.count : 0);
    amazonClicks.push(acData ? acData.count : 0);
  }

  return { months, pageViews, amazonClicks };
};

export { trackEvent, getDashboardStats, getMonthlyChartData };
