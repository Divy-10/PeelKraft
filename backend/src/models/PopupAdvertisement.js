import mongoose from 'mongoose';
import Admin from './Admin.js';

const popupAdvertisementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Advertisement title is required'],
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
    },
    longDescription: {
      type: String,
      default: '',
    },
    desktopImage: {
      type: String,
      required: [true, 'Desktop image URL is required'],
    },
    mobileImage: {
      type: String,
      default: '', // optional mobile layout override
    },
    couponCode: {
      type: String,
      uppercase: true,
      trim: true,
      default: '',
    },
    buttonText: {
      type: String,
      default: 'Shop Now',
    },
    buttonUrl: {
      type: String,
      default: '',
    },
    buttonAction: {
      type: String,
      enum: ['open_product', 'open_category', 'open_collection', 'open_external', 'copy_coupon', 'close_popup'],
      default: 'open_external',
    },
    offerType: {
      type: String,
      enum: [
        'Discount',
        'Festival',
        'Free Shipping',
        'Announcement',
        'Flash Sale',
        'New Arrival',
        'Season Sale',
        'Limited Offer'
      ],
      required: [true, 'Offer type is required'],
    },
    priority: {
      type: Number,
      default: 0,
    },
    status: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    showAfter: {
      type: Number, // delay in seconds: 0, 2, 5, 10
      default: 0,
    },
    popupSize: {
      type: String,
      enum: ['small', 'medium', 'large', 'xl'],
      default: 'medium',
    },
    popupPosition: {
      type: String,
      enum: ['center', 'top', 'bottom', 'left', 'right'],
      default: 'center',
    },
    animation: {
      type: String,
      enum: ['fade', 'zoom', 'slideUp', 'slideDown', 'bounce', 'rotate'],
      default: 'zoom',
    },
    targetAudience: {
      type: String,
      enum: ['guests', 'users', 'everyone', 'first-time', 'returning'],
      default: 'everyone',
    },
    deviceTarget: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'all'],
      default: 'all',
    },
    displayFrequency: {
      type: String,
      enum: ['once', 'daily', 'three-days', 'weekly', 'every-visit', 'custom'],
      default: 'every-visit',
    },
    customFrequencyDays: {
      type: Number,
      default: 1,
    },
    pageTarget: {
      type: String,
      enum: ['all', 'home', 'category', 'product', 'cart', 'checkout', 'custom'],
      default: 'all',
    },
    customPages: {
      type: [String],
      default: [],
    },
    countdownEnabled: {
      type: Boolean,
      default: false,
    },
    backgroundColor: {
      type: String,
      default: '#ffffff',
    },
    textColor: {
      type: String,
      default: '#1f2937',
    },
    buttonColor: {
      type: String,
      default: '#f97316',
    },
    buttonTextColor: {
      type: String,
      default: '#ffffff',
    },
    views: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    copies: {
      type: Number,
      default: 0,
    },
    closeCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

popupAdvertisementSchema.index({ status: 1, startDate: 1, endDate: 1, priority: -1 });

const PopupAdvertisement = mongoose.model('PopupAdvertisement', popupAdvertisementSchema);
export default PopupAdvertisement;
