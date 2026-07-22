import Newsletter from '../models/Newsletter.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { asyncHandler, getPaginationParams } from '../utils/helpers.js';
import { sendNewsletterWelcome } from '../services/emailService.js';
import { trackEvent } from '../services/analyticsService.js';

// @desc    Subscribe to newsletter (public)
// @route   POST /api/newsletter
export const subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const existing = await Newsletter.findOne({ email });
  if (existing) {
    if (existing.status === 'unsubscribed') {
      existing.status = 'active';
      existing.subscribedAt = new Date();
      await existing.save();
    }
    return res.json(new ApiResponse(200, 'You are already subscribed!'));
  }

  await Newsletter.create({ email });

  trackEvent(req, 'newsletterSubscribe', '/newsletter', { email });

  // Send welcome email (non-blocking)
  sendNewsletterWelcome(email).catch((err) =>
    console.error('Newsletter welcome email failed:', err.message)
  );

  res.status(201).json(new ApiResponse(201, 'Subscribed successfully!'));
});

// @desc    Get all subscribers (admin)
// @route   GET /api/newsletter
export const getSubscribers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);

  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [subscribers, total] = await Promise.all([
    Newsletter.find(filter).sort({ subscribedAt: -1 }).skip(skip).limit(limit).lean(),
    Newsletter.countDocuments(filter),
  ]);

  const pagination = { page, limit, total, pages: Math.ceil(total / limit) };
  res.json(ApiResponse.paginated(subscribers, pagination));
});

// @desc    Export subscribers as CSV (admin)
// @route   GET /api/newsletter/export
export const exportSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await Newsletter.find({ status: 'active' })
    .sort({ subscribedAt: -1 })
    .lean();

  let csv = 'Email,Status,Subscribed At\n';
  subscribers.forEach((sub) => {
    csv += `${sub.email},${sub.status},${new Date(sub.subscribedAt).toISOString()}\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=peelkraft-subscribers.csv');
  res.send(csv);
});

// @desc    Delete subscriber (admin)
// @route   DELETE /api/newsletter/:id
export const deleteSubscriber = asyncHandler(async (req, res) => {
  const subscriber = await Newsletter.findById(req.params.id);
  if (!subscriber) throw ApiError.notFound('Subscriber not found');

  await Newsletter.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse(200, 'Subscriber deleted'));
});
