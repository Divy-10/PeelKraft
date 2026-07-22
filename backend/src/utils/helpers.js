/**
 * Async handler wrapper to avoid repetitive try-catch blocks in controllers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Build pagination query params from request
 */
const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 12));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Build sort object from query string
 */
const getSortParams = (query) => {
  const sortField = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
  return { [sortField]: sortOrder };
};

/**
 * Build search filter for MongoDB
 */
const getSearchFilter = (query, fields) => {
  if (!query.search) return {};
  const regex = new RegExp(query.search, 'i');
  return {
    $or: fields.map((field) => ({ [field]: regex })),
  };
};

export { asyncHandler, getPaginationParams, getSortParams, getSearchFilter };
