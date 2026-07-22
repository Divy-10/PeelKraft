import mongoose from 'mongoose';

const seoSchema = new mongoose.Schema(
  {
    page: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    metaTitle: {
      type: String,
      default: '',
      maxlength: 120,
    },
    metaDescription: {
      type: String,
      default: '',
      maxlength: 320,
    },
    keywords: [
      {
        type: String,
        trim: true,
      },
    ],
    canonicalUrl: {
      type: String,
      default: '',
    },
    ogImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    twitterCard: {
      type: String,
      enum: ['summary', 'summary_large_image', 'player', 'app'],
      default: 'summary_large_image',
    },
    schema: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    noIndex: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const SEO = mongoose.model('SEO', seoSchema);
export default SEO;
