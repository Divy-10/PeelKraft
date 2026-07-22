import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

const validate = (validations) => {
  return async (req, res, next) => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (!result.isEmpty()) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return next(ApiError.badRequest('Validation failed', extractedErrors));
  };
};

export default validate;
