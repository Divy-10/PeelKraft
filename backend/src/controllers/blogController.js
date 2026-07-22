import mongoose from 'mongoose';
import Blog from '../models/Blog.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import slugify from '../utils/slugify.js';
import { asyncHandler, getPaginationParams, getSortParams, getSearchFilter } from '../utils/helpers.js';
import { trackEvent } from '../services/analyticsService.js';

// @desc    Get all blogs (public)
// @route   GET /api/blogs
export const getBlogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const sort = getSortParams(req.query);
  const searchFilter = getSearchFilter(req.query, ['title', 'content', 'excerpt']);

  const filter = { ...searchFilter };

  if (!req.admin) {
    filter.status = 'published';
  } else if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.category) filter.category = req.query.category;
  if (req.query.tag) filter.tags = req.query.tag;
  if (req.query.featured === 'true') filter.featured = true;

  const [blogs, total] = await Promise.all([
    Blog.find(filter)
      .populate('author', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Blog.countDocuments(filter),
  ]);

  const pagination = { page, limit, total, pages: Math.ceil(total / limit) };
  res.json(ApiResponse.paginated(blogs, pagination));
});

// @desc    Get single blog by ID or slug
// @route   GET /api/blogs/:slug
export const getBlogBySlug = asyncHandler(async (req, res) => {
  const param = req.params.slug;
  const isObjectId = mongoose.Types.ObjectId.isValid(param);
  const query = isObjectId ? { $or: [{ _id: param }, { slug: param }] } : { slug: param };

  const blog = await Blog.findOne(query)
    .populate('author', 'name avatar');

  if (!blog) throw ApiError.notFound('Blog not found');

  trackEvent(req, 'pageView', `/blogs/${blog.slug}`, { blogId: blog._id });
  blog.views += 1;
  await blog.save();

  res.json(new ApiResponse(200, 'Blog fetched', blog));
});

// @desc    Get related blogs
// @route   GET /api/blogs/:slug/related
export const getRelatedBlogs = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug });
  if (!blog) throw ApiError.notFound('Blog not found');

  const related = await Blog.find({
    _id: { $ne: blog._id },
    status: 'published',
    $or: [
      { category: blog.category },
      { tags: { $in: blog.tags } },
    ],
  })
    .limit(4)
    .sort({ createdAt: -1 })
    .lean();

  res.json(new ApiResponse(200, 'Related blogs', related));
});

// @desc    Get all tags (public)
// @route   GET /api/blogs/tags
export const getTags = asyncHandler(async (req, res) => {
  const tags = await Blog.distinct('tags', { status: 'published' });
  res.json(new ApiResponse(200, 'Tags fetched', tags));
});

// @desc    Get blog categories (public)
// @route   GET /api/blogs/categories
export const getBlogCategories = asyncHandler(async (req, res) => {
  const categories = await Blog.distinct('category', { status: 'published' });
  res.json(new ApiResponse(200, 'Categories fetched', categories));
});

// @desc    Create blog (admin)
// @route   POST /api/blogs
export const createBlog = asyncHandler(async (req, res) => {
  const slug = slugify(req.body.title);
  const existing = await Blog.findOne({ slug });
  if (existing) throw ApiError.badRequest('A blog with a similar title already exists');

  const blog = await Blog.create({
    ...req.body,
    slug,
    author: req.admin._id,
  });

  res.status(201).json(new ApiResponse(201, 'Blog created', blog));
});

// @desc    Update blog (admin)
// @route   PUT /api/blogs/:id
export const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) throw ApiError.notFound('Blog not found');

  if (req.body.title && req.body.title !== blog.title) {
    req.body.slug = slugify(req.body.title);
  }

  const updated = await Blog.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json(new ApiResponse(200, 'Blog updated', updated));
});

// @desc    Delete blog (admin)
// @route   DELETE /api/blogs/:id
export const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) throw ApiError.notFound('Blog not found');

  await Blog.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse(200, 'Blog deleted'));
});
