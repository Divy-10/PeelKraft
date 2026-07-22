import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

// Require user authentication
const userAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw ApiError.unauthorized('Access denied. Please login.');
    }

    const decoded = jwt.verify(token, config.jwtSecret);

    // Must be a user token (not admin)
    if (decoded.role !== 'user') {
      throw ApiError.unauthorized('Invalid token type.');
    }

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      throw ApiError.unauthorized('User not found.');
    }

    if (user.status !== 'active') {
      throw ApiError.forbidden('Your account has been blocked. Contact support.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    if (error.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Invalid token.'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Token expired. Please login again.'));
    }
    next(error);
  }
};

// Optional user auth — attaches user if token is valid, otherwise continues
export const optionalUserAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret);
      if (decoded.role === 'user') {
        const user = await User.findById(decoded.id).select('-password');
        if (user && user.status === 'active') {
          req.user = user;
        }
      }
    }
    next();
  } catch {
    next();
  }
};

export default userAuth;
