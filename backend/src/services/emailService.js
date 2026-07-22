import createTransporter from '../config/email.js';

/**
 * Send an email
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: `"PeelKraft" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text,
    });

    console.log('📧 Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email send error:', error);
    throw error;
  }
};

/**
 * Send contact form notification to admin
 */
const sendContactNotification = async (contact) => {
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
    to: process.env.SMTP_USER,
    subject: `[PeelKraft] New Contact: ${contact.subject}`,
    html,
  });
};

/**
 * Send reply to contact
 */
const sendContactReply = async (contact, replyMessage) => {
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
const sendNewsletterWelcome = async (email) => {
  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1E7A34, #F7931E); padding: 40px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to PeelKraft! 🍊</h1>
      </div>
      <div style="background: #FFF8EE; padding: 30px; border-radius: 0 0 12px 12px; text-align: center;">
        <p style="font-size: 16px; color: #222;">Thank you for subscribing to our newsletter!</p>
        <p style="color: #666;">You'll be the first to know about our latest products, recipes, health tips, and sustainability updates.</p>
        <a href="${process.env.FRONTEND_URL}" style="display: inline-block; background: #F7931E; color: white; padding: 12px 30px; border-radius: 50px; text-decoration: none; margin-top: 15px; font-weight: 600;">Visit Our Website</a>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to PeelKraft Newsletter! 🍊',
    html,
  });
};

export { sendEmail, sendContactNotification, sendContactReply, sendNewsletterWelcome };
