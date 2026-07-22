import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['new_order', 'low_stock', 'payment_received', 'order_cancelled', 'order_status', 'system'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    // Reference to related entity
    refModel: {
      type: String,
      enum: ['Order', 'Product', 'User', 'Payment', null],
      default: null,
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    // For admin notifications
    forAdmin: {
      type: Boolean,
      default: true,
    },
    // For user-specific notifications
    forUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ forAdmin: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ forUser: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
