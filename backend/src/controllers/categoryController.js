import Category from '../models/Category.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import slugify from '../utils/slugify.js';
import { asyncHandler } from '../utils/helpers.js';

// @desc    Get all categories (public)
// @route   GET /api/categories
export const getCategories = asyncHandler(async (req, res) => {
  const filter = {};
  if (!req.admin) filter.status = 'active';

  const categories = await Category.find(filter).sort({ order: 1, name: 1 }).lean();
  res.json(new ApiResponse(200, 'Categories fetched', categories));
});

// @desc    Get single category
// @route   GET /api/categories/:id
export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');
  res.json(new ApiResponse(200, 'Category fetched', category));
});

// @desc    Create category (admin)
// @route   POST /api/categories
export const createCategory = asyncHandler(async (req, res) => {
  const slug = slugify(req.body.name);
  const existing = await Category.findOne({ slug });
  if (existing) throw ApiError.badRequest('Category with this name already exists');

  const category = await Category.create({ ...req.body, slug });
  res.status(201).json(new ApiResponse(201, 'Category created', category));
});

// @desc    Update category (admin)
// @route   PUT /api/categories/:id
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');

  if (req.body.name && req.body.name !== category.name) {
    req.body.slug = slugify(req.body.name);
  }

  const updated = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json(new ApiResponse(200, 'Category updated', updated));
});

// @desc    Delete category (admin)
// @route   DELETE /api/categories/:id
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');

  await Category.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse(200, 'Category deleted'));
});
