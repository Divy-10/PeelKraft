import Newsletter from '../models/Newsletter.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { asyncHandler, getPaginationParams } from '../utils/helpers.js';
import { sendNewsletterWelcome, verifyUnsubscribeToken } from '../services/emailService.js';
import { trackEvent } from '../services/analyticsService.js';

// @desc    Subscribe to newsletter (public)
// @route   POST /api/newsletter
export const subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || typeof email !== 'string') {
    throw ApiError.badRequest('Email address is required');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    throw ApiError.badRequest('Please provide a valid email address');
  }

  const existing = await Newsletter.findOne({ email: normalizedEmail });
  if (existing) {
    if (existing.status === 'unsubscribed') {
      existing.status = 'active';
      existing.subscribedAt = new Date();
      await existing.save();

      // Send welcome email (non-blocking)
      sendNewsletterWelcome(normalizedEmail).catch((err) =>
        console.error('Newsletter welcome email failed:', err.message)
      );

      return res.json(new ApiResponse(200, 'Subscribed successfully! Welcome back to PeelKraft.'));
    }
    return res.json(new ApiResponse(200, 'You are already subscribed!'));
  }

  await Newsletter.create({ email: normalizedEmail, status: 'active' });

  trackEvent(req, 'newsletterSubscribe', '/newsletter', { email: normalizedEmail });

  // Send welcome email (non-blocking)
  sendNewsletterWelcome(normalizedEmail).catch((err) =>
    console.error('Newsletter welcome email failed:', err.message)
  );

  res.status(201).json(new ApiResponse(201, 'Subscribed successfully!'));
});

// @desc    Unsubscribe from newsletter (public)
// @route   POST /api/newsletter/unsubscribe, GET /api/newsletter/unsubscribe
export const unsubscribe = asyncHandler(async (req, res) => {
  const email = req.body?.email || req.query?.email;
  const token = req.body?.token || req.query?.token;

  if (!email || typeof email !== 'string') {
    throw ApiError.badRequest('Email address is required');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    throw ApiError.badRequest('Please provide a valid email address');
  }

  if (token && !verifyUnsubscribeToken(normalizedEmail, token)) {
    throw ApiError.badRequest('Invalid or expired unsubscribe link');
  }

  let subscriber = await Newsletter.findOne({ email: normalizedEmail });
  if (subscriber) {
    if (subscriber.status !== 'unsubscribed') {
      subscriber.status = 'unsubscribed';
      await subscriber.save();
    }
  } else {
    await Newsletter.create({ email: normalizedEmail, status: 'unsubscribed' });
  }

  res.json(new ApiResponse(200, 'You have been successfully unsubscribed from PeelKraft marketing emails.'));
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
