import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  slug: { type: String, default: '' },
  image: { type: String, default: '' },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  total: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    // Address
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: 'India' },
    },
    billingAddress: {
      fullName: { type: String, default: '' },
      phone: { type: String, default: '' },
      addressLine1: { type: String, default: '' },
      addressLine2: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
      country: { type: String, default: 'India' },
    },
    // Pricing
    subtotal: { type: Number, required: true },
    shippingCharge: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    // Coupon
    coupon: {
      code: { type: String, default: '' },
      discount: { type: Number, default: 0 },
    },
    // Payment
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'cod'],
      default: 'razorpay',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },
    // Order status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: '' },
      },
    ],
    // Shipping
    trackingNumber: { type: String, default: '' },
    courierName: { type: String, default: '' },
    estimatedDelivery: { type: Date },
    deliveredAt: { type: Date },
    // Notes
    deliveryNotes: { type: String, default: '' },
    adminNotes: { type: String, default: '' },
    // Cancellation
    cancelledAt: { type: Date },
    cancellationReason: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

// Generate order number
orderSchema.pre('validate', async function (next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `PK${Date.now().toString(36).toUpperCase()}${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
