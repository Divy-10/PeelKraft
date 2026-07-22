import Contact from '../models/Contact.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { asyncHandler, getPaginationParams } from '../utils/helpers.js';
import { sendContactNotification, sendContactReply } from '../services/emailService.js';
import { trackEvent } from '../services/analyticsService.js';

// @desc    Submit contact form (public)
// @route   POST /api/contact
export const submitContact = asyncHandler(async (req, res) => {
  const contact = await Contact.create(req.body);

  // Track event
  trackEvent(req, 'contactSubmit', '/contact', { contactId: contact._id });

  // Send notification email to admin (non-blocking)
  sendContactNotification(contact).catch((err) =>
    console.error('Contact notification email failed:', err.message)
  );

  res.status(201).json(new ApiResponse(201, 'Message sent successfully! We will get back to you soon.'));
});

// @desc    Get all contacts (admin)
// @route   GET /api/contact
export const getContacts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);

  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [contacts, total] = await Promise.all([
    Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Contact.countDocuments(filter),
  ]);

  const pagination = { page, limit, total, pages: Math.ceil(total / limit) };
  res.json(ApiResponse.paginated(contacts, pagination));
});

// @desc    Get single contact (admin)
// @route   GET /api/contact/:id
export const getContactById = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) throw ApiError.notFound('Contact not found');

  // Mark as read
  if (contact.status === 'unread') {
    contact.status = 'read';
    await contact.save();
  }

  res.json(new ApiResponse(200, 'Contact fetched', contact));
});

// @desc    Reply to contact (admin)
// @route   PUT /api/contact/:id/reply
export const replyToContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) throw ApiError.notFound('Contact not found');

  contact.reply = req.body.reply;
  contact.status = 'replied';
  contact.repliedAt = new Date();
  await contact.save();

  // Send reply email (non-blocking)
  sendContactReply(contact, req.body.reply).catch((err) =>
    console.error('Contact reply email failed:', err.message)
  );

  res.json(new ApiResponse(200, 'Reply sent', contact));
});

// @desc    Delete contact (admin)
// @route   DELETE /api/contact/:id
export const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) throw ApiError.notFound('Contact not found');

  await Contact.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse(200, 'Contact deleted'));
});
