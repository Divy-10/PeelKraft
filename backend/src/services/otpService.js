import crypto from 'crypto';

/**
 * Generate a cryptographically secure 6-digit numerical OTP.
 * @returns {string} 6-digit OTP
 */
export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Hash a plain-text OTP using SHA-256.
 * @param {string} otp Plain-text OTP
 * @returns {string} Hex hashed OTP
 */
export const hashOTP = (otp) => {
  if (!otp) return '';
  return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Verify a plain-text OTP against its hashed representation.
 * @param {string} plainOtp The plain OTP entered by the user
 * @param {string} hashedOtp The hashed OTP stored in the DB
 * @returns {boolean} True if matching, false otherwise
 */
export const verifyOTP = (plainOtp, hashedOtp) => {
  if (!plainOtp || !hashedOtp) return false;
  return hashOTP(plainOtp) === hashedOtp;
};
