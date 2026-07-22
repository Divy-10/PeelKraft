import mongoose from 'mongoose';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import slugify from '../utils/slugify.js';
import { asyncHandler, getPaginationParams, getSortParams, getSearchFilter } from '../utils/helpers.js';
import { trackEvent } from '../services/analyticsService.js';

// @desc    Get all products (public)
// @route   GET /api/products
export const getProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const sort = getSortParams(req.query);
  const searchFilter = getSearchFilter(req.query, ['name', 'description', 'shortDescription']);

  const filter = { ...searchFilter };

  // Filter by category
  if (req.query.category) {
    filter.category = req.query.category;
  }

  // Filter by status (public gets published or upcoming by default)
  if (req.query.status) {
    filter.status = req.query.status;
  } else if (!req.admin) {
    filter.$or = [
      { status: 'published' },
      { isUpcoming: true }
    ];
  }

  // Filter by featured
  if (req.query.featured === 'true') {
    filter.featured = true;
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };

  res.json(ApiResponse.paginated(products, pagination));
});

// @desc    Get single product by ID or slug
// @route   GET /api/products/:slug
export const getProductBySlug = asyncHandler(async (req, res) => {
  const param = req.params.slug;
  const isObjectId = mongoose.Types.ObjectId.isValid(param);
  const query = isObjectId ? { $or: [{ _id: param }, { slug: param }] } : { slug: param };

  const product = await Product.findOne(query)
    .populate('category', 'name slug');

  if (!product) throw ApiError.notFound('Product not found');

  // Track page view
  trackEvent(req, 'pageView', `/products/${product.slug}`, { productId: product._id });

  // Increment views
  product.views += 1;
  await product.save();

  res.json(new ApiResponse(200, 'Product fetched', product));
});

// @desc    Track Amazon click
// @route   POST /api/products/:id/amazon-click
export const trackAmazonClick = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');

  product.amazonClicks += 1;
  await product.save();

  trackEvent(req, 'amazonClick', `/products/${product.slug}`, {
    productId: product._id,
    amazonLink: product.amazonLink,
  });

  res.json(new ApiResponse(200, 'Click tracked'));
});

// @desc    Create product (admin)
// @route   POST /api/products
export const createProduct = asyncHandler(async (req, res) => {
  const slug = slugify(req.body.name);

  // Check for duplicate slug
  const existing = await Product.findOne({ slug });
  if (existing) {
    throw ApiError.badRequest('A product with a similar name already exists');
  }

  const product = await Product.create({ ...req.body, slug });
  res.status(201).json(new ApiResponse(201, 'Product created', product));
});

// @desc    Update product (admin)
// @route   PUT /api/products/:id
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');

  if (req.body.name && req.body.name !== product.name) {
    req.body.slug = slugify(req.body.name);
  }

  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('category', 'name slug');

  res.json(new ApiResponse(200, 'Product updated', updated));
});

// @desc    Delete product (admin)
// @route   DELETE /api/products/:id
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');

  await Product.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse(200, 'Product deleted'));
});

// @desc    Get featured products (public)
// @route   GET /api/products/featured
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({
    $or: [
      { featured: true, status: 'published' },
      { isUpcoming: true }
    ]
  })
    .populate('category', 'name slug')
    .sort({ order: 1 })
    .limit(8)
    .lean();

  res.json(new ApiResponse(200, 'Featured products', products));
});
