import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['image', 'video', 'pdf', 'other'],
      default: 'image',
    },
    format: {
      type: String,
      default: '',
    },
    size: {
      type: Number,
      default: 0,
    },
    width: {
      type: Number,
      default: 0,
    },
    height: {
      type: Number,
      default: 0,
    },
    folder: {
      type: String,
      default: 'general',
      trim: true,
    },
    alt: {
      type: String,
      default: '',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

mediaSchema.index({ folder: 1 });
mediaSchema.index({ type: 1 });
mediaSchema.index({ createdAt: -1 });

const Media = mongoose.model('Media', mediaSchema);
export default Media;
