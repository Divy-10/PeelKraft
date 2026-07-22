import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    shortDescription: {
      type: String,
      maxlength: 500,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    benefits: [
      {
        type: String,
        trim: true,
      },
    ],
    ingredients: [
      {
        type: String,
        trim: true,
      },
    ],
    nutrition: {
      calories: { type: String, default: '' },
      protein: { type: String, default: '' },
      carbs: { type: String, default: '' },
      fat: { type: String, default: '' },
      fiber: { type: String, default: '' },
      sugar: { type: String, default: '' },
      sodium: { type: String, default: '' },
      vitaminC: { type: String, default: '' },
    },
    storage: {
      type: String,
      default: '',
    },
    shelfLife: {
      type: String,
      default: '',
    },
    weight: {
      type: String,
      default: '',
    },
    gallery: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
        alt: { type: String, default: '' },
      },
    ],
    thumbnail: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    featuredImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    // ===== E-COMMERCE PRICING =====
    mrp: {
      type: Number,
      default: 0,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    costPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    // ===== INVENTORY =====
    sku: {
      type: String,
      default: '',
      trim: true,
    },
    barcode: {
      type: String,
      default: '',
      trim: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    lowStockAlert: {
      type: Number,
      default: 5,
      min: 0,
    },
    trackInventory: {
      type: Boolean,
      default: true,
    },
    // ===== STATUS =====
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isUpcoming: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    // ===== RATINGS CACHE =====
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    // SEO Fields
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    seoKeywords: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ sellingPrice: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;

