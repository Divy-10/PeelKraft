import ApiError from '../utils/ApiError.js';

/**
 * Role-based access control middleware
 * @param  {...string} roles - Allowed roles
 */
const roleCheck = (...roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return next(ApiError.unauthorized('Authentication required.'));
    }

    if (!roles.includes(req.admin.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Required role(s): ${roles.join(', ')}`
        )
      );
    }

    next();
  };
};

export default roleCheck;
