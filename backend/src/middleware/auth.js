import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import Admin from '../models/Admin.js';
import ApiError from '../utils/ApiError.js';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw ApiError.unauthorized('Access denied. No token provided.');
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) {
      throw ApiError.unauthorized('Invalid token. Admin not found.');
    }

    if (admin.status !== 'active') {
      throw ApiError.forbidden('Account is deactivated.');
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    if (error.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Invalid token.'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Token expired.'));
    }
    next(error);
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret);
      const admin = await Admin.findById(decoded.id).select('-password');
      if (admin && admin.status === 'active') {
        req.admin = admin;
      }
    }
    next();
  } catch (error) {
    next();
  }
};

export default auth;
