import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema(
  {
    page: {
      type: String,
      required: true,
      trim: true,
    },
    event: {
      type: String,
      enum: ['pageView', 'amazonClick', 'contactSubmit', 'newsletterSubscribe', 'search'],
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ip: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    referer: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

analyticsSchema.index({ event: 1 });
analyticsSchema.index({ createdAt: -1 });
analyticsSchema.index({ page: 1, event: 1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);
export default Analytics;
