import rateLimit from 'express-rate-limit';
import logger from '../utils/logger.js';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 10000 : 1000,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  handler: (req, res, next, options) => {
    logger.warn('Rate limit exceeded: General', { ip: req.ip, url: req.originalUrl });
    res.status(options.statusCode).json(options.message);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes.',
  },
  handler: (req, res, next, options) => {
    logger.warn('Rate limit exceeded: Auth attempts', { ip: req.ip, url: req.originalUrl, email: req.body?.email });
    res.status(options.statusCode).json(options.message);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    message: 'Too many submissions. Please try again later.',
  },
  handler: (req, res, next, options) => {
    logger.warn('Rate limit exceeded: Contact Form', { ip: req.ip, email: req.body?.email });
    res.status(options.statusCode).json(options.message);
  },
});

export const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: 'Too many subscription attempts. Please try again later.',
  },
  handler: (req, res, next, options) => {
    logger.warn('Rate limit exceeded: Newsletter Form', { ip: req.ip, email: req.body?.email });
    res.status(options.statusCode).json(options.message);
  },
});
