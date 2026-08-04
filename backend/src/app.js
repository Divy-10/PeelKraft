import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import compression from 'compression';
import { generalLimiter } from './middleware/rateLimiter.js';
import errorHandler from './middleware/errorHandler.js';
import config from './config/index.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import faqRoutes from './routes/faqRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import seoRoutes from './routes/seoRoutes.js';
// E-commerce routes
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import popupRoutes from './routes/popupRoutes.js';
import createTransporter from './config/email.js';

const app = express();

// Security Middleware (Helmet with CSP)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com", "https://connect.facebook.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com", "https://connect.facebook.net"],
      connectSrc: ["'self'", "https://www.google-analytics.com", "https://connect.facebook.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS Configuration
const baseAllowedOrigins = [
  'https://peelkraft.in',
  'https://www.peelkraft.in',
  'http://localhost:5173',
  'http://localhost:3000'
];

if (config.frontendUrl) {
  const normalizedFrontendUrl = config.frontendUrl.replace(/\/$/, '');
  if (!baseAllowedOrigins.includes(normalizedFrontendUrl)) {
    baseAllowedOrigins.push(normalizedFrontendUrl);
  }
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    const normalizedOrigin = origin.replace(/\/$/, '');
    if (baseAllowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS Blocked] Origin: ${origin}`);
      callback(new Error(`Blocked by CORS policy: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'Expires'],
}));

// Rate limiting
app.use('/api/', generalLimiter);

// Body parsing & Sanitization
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize());
app.use(hpp());

// Payload compression
app.use(compression());

// Prevent caching for all API routes
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Serve static uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to PeelKraft Backend API',
    version: '2.0.0',
    documentation: '/api/health',
    health: 'http://localhost:5000/api/health'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: config.nodeEnv });
});

// API Routes — Existing
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/popups', popupRoutes);

// API Routes — E-commerce
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);

// Test Email Endpoint
app.post('/api/test-email', async (req, res) => {
  const { to } = req.body;
  if (!to) {
    return res.status(400).json({ success: false, message: 'Recipient email address (to) is required' });
  }

  // 1. Check environment variables
  const configErrors = [];
  const requiredEnv = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM'];
  requiredEnv.forEach(envVar => {
    if (!process.env[envVar]) {
      configErrors.push(`${envVar} is undefined`);
    }
  });

  if (configErrors.length > 0) {
    console.error('SMTP configuration error: Some required environment variables are undefined.', configErrors.join(', '));
    return res.status(500).json({
      success: false,
      message: 'SMTP environment variables missing or undefined',
      errors: configErrors
    });
  }

  // Log SMTP config loading
  console.log('SMTP configuration loaded:', {
    host: config.smtp.host,
    port: config.smtp.port,
    user: config.smtp.user,
    pass: config.smtp.pass ? '******' : 'undefined',
    from: config.emailFrom
  });

  try {
    const transporter = createTransporter();
    console.log('Transporter created successfully.');

    // Verify authentication and connection
    await transporter.verify();
    console.log('SMTP authentication succeeds.');

    console.log('Attempting to send email...');
    const mailOptions = {
      from: `"${config.emailFrom || 'PeelKraft'}" <${config.smtp.user}>`,
      to,
      subject: 'PeelKraft SMTP Test Email',
      text: 'This is a test email to verify that your PeelKraft Gmail SMTP configuration is working correctly.',
      html: '<p>This is a test email to verify that your PeelKraft Gmail SMTP configuration is working correctly.</p>'
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
      envelope: info.envelope,
      response: info.response
    });
  } catch (error) {
    console.error('Complete error stack if sending fails:');
    console.error(error.stack || error);

    return res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message,
      stack: error.stack
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handler
app.use(errorHandler);

export default app;
