import config from '../config/index.js';
import createTransporter from '../config/email.js';

/**
 * Send an email using Gmail SMTP transporter
 * @param {Object} options
 * @param {string} options.to Recipient email address
 * @param {string} options.subject Email subject line
 * @param {string} options.html HTML body content
 */
export const sendEmail = async ({ to, subject, html }) => {
  const from = config.emailFrom || 'PeelKraft <support@juicetap.in>';

  // Check that required env variables are present
  const user = config.smtp.user;
  const pass = config.smtp.pass;

  if (!user || !pass) {
    console.error('SMTP configuration error: EMAIL_USER/SMTP_USER or EMAIL_PASS/SMTP_PASS missing');
    return { success: false, message: 'SMTP credentials missing or undefined' };
  }

  console.log(`SMTP configuration loaded for user: ${user}`);

  try {
    const transporter = createTransporter();
    
    console.log('Attempting to send email...');
    const mailOptions = {
      from: from,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);

    return { 
      success: true, 
      data: {
        id: info.messageId,
        envelope: info.envelope,
        response: info.response
      } 
    };
  } catch (error) {
    console.error('Complete error stack if sending fails:');
    console.error(error.message || error);
    throw error;
  }
};

/**
 * Verify SMTP Transporter connection
 */
export const verifySMTP = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
    return { success: true, message: 'SMTP connection verified successfully' };
  } catch (error) {
    console.error('❌ SMTP verification failed:', error.message || error);
    return { success: false, error: error.message };
  }
};

// ==========================================
// PEELKRAFT BRANDED EMAIL TEMPLATES
// ==========================================

const baseTemplate = (contentTitle, bodyHtml) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${contentTitle}</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #fffbeb;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #fffbeb;
      padding: 24px 12px;
      box-sizing: border-box;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(249, 115, 22, 0.05);
      border: 1px solid #fef3c7;
    }
    .header {
      background: linear-gradient(135deg, #fffbeb 0%, #ffedd5 100%);
      padding: 32px 24px;
      text-align: center;
      border-bottom: 2px solid #ffedd5;
    }
    .logo {
      font-size: 28px;
      font-weight: 800;
      color: #ea580c;
      letter-spacing: -0.5px;
      text-decoration: none;
      margin: 0;
    }
    .logo span {
      color: #1e293b;
    }
    .content {
      padding: 40px 32px;
      color: #334155;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      color: #1e293b;
      margin-top: 0;
      margin-bottom: 16px;
      line-height: 1.3;
    }
    p {
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
      margin-top: 0;
      margin-bottom: 24px;
    }
    .btn {
      display: inline-block;
      background-color: #f97316;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 15px;
      padding: 14px 32px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2);
      transition: all 0.2s ease;
      margin-bottom: 12px;
    }
    .otp-code {
      display: inline-block;
      font-family: 'Courier New', Courier, monospace;
      font-size: 36px;
      font-weight: 800;
      color: #ea580c;
      letter-spacing: 6px;
      background-color: #fef3c7;
      padding: 16px 28px;
      border-radius: 16px;
      border: 2px dashed #f97316;
      margin: 12px 0 24px 0;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
    }
    .footer a {
      color: #f97316;
      text-decoration: none;
    }
    .meta-box {
      background-color: #f8fafc;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 24px;
      border: 1px solid #e2e8f0;
      text-align: left;
    }
    .meta-box table {
      width: 100%;
      border-collapse: collapse;
    }
    .meta-box td {
      padding: 6px 0;
      font-size: 14px;
    }
    .meta-box td.label {
      color: #64748b;
      font-weight: 500;
    }
    .meta-box td.val {
      color: #1e293b;
      font-weight: 600;
      text-align: right;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img src="https://peelkraft.in/images/logo.png" alt="PeelKraft" style="width: 200px; height: auto; display: block; margin: 0 auto;" />
      </div>
      <div class="content">
        ${bodyHtml}
      </div>
      <div class="footer">
        <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8;">
          © ${new Date().getFullYear()} PeelKraft. All rights reserved.
        </p>
        <p style="margin: 0; font-size: 11px; color: #cbd5e1;">
          By JuiceTap Global Pvt Ltd. Plot 13-14, Bhatpore, Hazira, Surat, Gujarat.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

/**
 * Generate Verification OTP Email
 */
export const getVerificationEmailTemplate = (otp) => {
  const html = `
    <h1>Verify Your Email Address</h1>
    <p>Thank you for choosing PeelKraft! Use the secure 6-digit OTP code below to verify your email address and activate your account. This code is valid for 15 minutes.</p>
    <div style="text-align: center;">
      <div class="otp-code">${otp}</div>
    </div>
    <p>If you didn't request this code, you can safely ignore this email.</p>
    <p>Warmly,<br><strong>The PeelKraft Team</strong></p>
  `;
  return baseTemplate('Verify Your Email', html);
};

/**
 * Generate Welcome Email
 */
export const getWelcomeEmailTemplate = (name) => {
  const html = `
    <h1>Welcome to PeelKraft, ${name}!</h1>
    <p>Your account is officially verified. We are thrilled to welcome you to the PeelKraft family!</p>
    <p>At PeelKraft, we transform natural orange peels into premium organic treats. We combine sustainability, nutrition, and exceptional taste to make snacks that are as good for the planet as they are for you.</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${config.frontendUrl || 'http://localhost:5173'}" class="btn">Explore Our Products</a>
    </div>
    <p>Enjoy 100% natural goodness in every single bite.</p>
    <p>Cheers,<br><strong>The PeelKraft Team</strong></p>
  `;
  return baseTemplate('Welcome to PeelKraft', html);
};

/**
 * Generate Forgot Password Reset Email
 */
export const getForgotPasswordTemplate = (resetUrl) => {
  const html = `
    <h1>Reset Your Password</h1>
    <p>We received a request to reset your password for your PeelKraft account. Click the button below to set a new password. This reset link is valid for 30 minutes.</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetUrl}" class="btn" style="background-color: #ea580c;">Reset Password</a>
    </div>
    <p>If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    <p>Need help? Contact our support team immediately.</p>
  `;
  return baseTemplate('Reset Password', html);
};

/**
 * Generate Password Reset Confirmation Email
 */
export const getPasswordResetConfirmationTemplate = () => {
  const html = `
    <h1>Password Reset Successful</h1>
    <p>This is a confirmation that your PeelKraft account password has been successfully updated.</p>
    <p>If you did not make this change, please secure your account immediately or contact customer support.</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${config.frontendUrl || 'http://localhost:5173'}/login" class="btn">Login to Your Account</a>
    </div>
    <p>Best regards,<br><strong>PeelKraft Security Team</strong></p>
  `;
  return baseTemplate('Password Reset Confirmed', html);
};

/**
 * Generate Order Confirmation Email
 */
export const getOrderConfirmationTemplate = (order) => {
  const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  
  const itemsRows = order.items.map(item => `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
        <div style="font-weight: 600; color: #1e293b;">${item.productName}</div>
        <div style="font-size: 12px; color: #64748b;">Qty: ${item.quantity} × ₹${item.price}</div>
      </td>
      <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1e293b; border-bottom: 1px solid #f1f5f9;">
        ₹${(item.quantity * item.price).toFixed(2)}
      </td>
    </tr>
  `).join('');

  const html = `
    <h1>Thank You for Your Order!</h1>
    <p>We've received your order and are getting it ready. You will receive another update as soon as your items ship.</p>
    
    <div class="meta-box">
      <table>
        <tr>
          <td class="label">Order ID</td>
          <td class="val">${order._id}</td>
        </tr>
        <tr>
          <td class="label">Order Date</td>
          <td class="val">${dateStr}</td>
        </tr>
        <tr>
          <td class="label">Payment Status</td>
          <td class="val" style="color: #059669;">${order.paymentStatus.toUpperCase()}</td>
        </tr>
      </table>
    </div>

    <h3 style="font-size: 16px; margin: 0 0 12px 0; color: #1e293b;">Order Summary</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      ${itemsRows}
      <tr>
        <td style="padding: 12px 0 4px 0; color: #64748b;">Subtotal</td>
        <td style="padding: 12px 0 4px 0; text-align: right; color: #1e293b;">₹${order.itemsPrice.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; color: #64748b;">Shipping</td>
        <td style="padding: 4px 0; text-align: right; color: #1e293b;">₹${order.shippingPrice.toFixed(2)}</td>
      </tr>
      ${order.taxPrice ? `
      <tr>
        <td style="padding: 4px 0; color: #64748b;">Tax</td>
        <td style="padding: 4px 0; text-align: right; color: #1e293b;">₹${order.taxPrice.toFixed(2)}</td>
      </tr>
      ` : ''}
      <tr>
        <td style="padding: 12px 0; font-weight: 700; color: #1e293b; border-top: 2px solid #e2e8f0; font-size: 16px;">Total Paid</td>
        <td style="padding: 12px 0; text-align: right; font-weight: 700; color: #ea580c; border-top: 2px solid #e2e8f0; font-size: 16px;">₹${order.totalPrice.toFixed(2)}</td>
      </tr>
    </table>

    <div style="text-align: center; margin: 24px 0 12px 0;">
      <a href="${config.frontendUrl || 'http://localhost:5173'}/my-orders" class="btn">Track Order Details</a>
    </div>
  `;
  return baseTemplate('Order Confirmed', html);
};

/**
 * Generate Shipping Update Email
 */
export const getShippingUpdateTemplate = (order, trackingNo, carrier) => {
  const html = `
    <h1>Your Order is On the Way!</h1>
    <p>Good news! Your PeelKraft order <strong>${order._id}</strong> has been shipped and is heading your way.</p>
    
    <div class="meta-box">
      <table>
        <tr>
          <td class="label">Courier Service</td>
          <td class="val">${carrier || 'Delhivery'}</td>
        </tr>
        <tr>
          <td class="label">Tracking Number</td>
          <td class="val">${trackingNo || 'N/A'}</td>
        </tr>
      </table>
    </div>

    <p>Please note that tracking information might take up to 24 hours to become active on the courier website.</p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${config.frontendUrl || 'http://localhost:5173'}/my-orders" class="btn">Track Package</a>
    </div>
    
    <p>Thank you for choosing sustainability and health.</p>
  `;
  return baseTemplate('Order Shipped', html);
};

/**
 * Send contact form notification to admin
 */
export const sendContactNotification = async (contact) => {
  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #F7931E, #D4AF37); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Message</h1>
      </div>
      <div style="background: #FFF8EE; padding: 30px; border-radius: 0 0 12px 12px;">
        <p><strong>Name:</strong> ${contact.name}</p>
        <p><strong>Email:</strong> ${contact.email}</p>
        <p><strong>Phone:</strong> ${contact.phone || 'N/A'}</p>
        <p><strong>Subject:</strong> ${contact.subject}</p>
        <p><strong>Message:</strong></p>
        <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #F7931E;">
          ${contact.message}
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: config.adminEmail || 'admin@peelkraft.com',
    subject: `[PeelKraft] New Contact: ${contact.subject}`,
    html,
  });
};

/**
 * Send reply to contact
 */
export const sendContactReply = async (contact, replyMessage) => {
  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #F7931E, #D4AF37); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">PeelKraft</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0;">Thank you for reaching out!</p>
      </div>
      <div style="background: #FFF8EE; padding: 30px; border-radius: 0 0 12px 12px;">
        <p>Dear ${contact.name},</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
          ${replyMessage}
        </div>
        <p style="color: #666; font-size: 14px;">Best regards,<br>The PeelKraft Team</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: contact.email,
    subject: `Re: ${contact.subject} — PeelKraft`,
    html,
  });
};

/**
 * Send newsletter welcome email
 */
export const sendNewsletterWelcome = async (email) => {
  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1E7A34, #F7931E); padding: 40px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to PeelKraft! 🍊</h1>
      </div>
      <div style="background: #FFF8EE; padding: 30px; border-radius: 0 0 12px 12px; text-align: center;">
        <p style="font-size: 16px; color: #222;">Thank you for subscribing to our newsletter!</p>
        <p style="color: #666;">You'll be the first to know about our latest products, recipes, health tips, and sustainability updates.</p>
        <a href="${config.frontendUrl}" style="display: inline-block; background: #F7931E; color: white; padding: 12px 30px; border-radius: 50px; text-decoration: none; margin-top: 15px; font-weight: 600;">Visit Our Website</a>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to PeelKraft Newsletter! 🍊',
    html,
  });
};
