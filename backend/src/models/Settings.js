import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    logo: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    favicon: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    companyName: {
      type: String,
      default: 'PeelKraft',
    },
    tagline: {
      type: String,
      default: 'Premium Sustainable Food from Orange Peels',
    },
    email: {
      type: String,
      default: 'info@peelkraft.com',
    },
    phone: {
      type: String,
      default: '+91 98765 43210',
    },
    address: {
      type: String,
      default: 'JUICETAP GLOBAL PRIVATE LIMITED Plot 13-14, Nandini Farm, Tata Motors Lane, Bhatpore, Hazira, Surat, Gujarat 394510',
    },
    whatsapp: {
      type: String,
      default: '',
    },
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
    footerText: {
      type: String,
      default: '© 2024 PeelKraft by JuiceTap Global Pvt Ltd. All rights reserved.',
    },
    amazonStoreUrl: {
      type: String,
      default: '',
    },
    googleMapsEmbed: {
      type: String,
      default: '',
    },
    smtp: {
      host: { type: String, default: '' },
      port: { type: Number, default: 587 },
      user: { type: String, default: '' },
      pass: { type: String, default: '' },
    },
    shippingCharge: {
      type: Number,
      default: 49,
    },
    freeShippingMinAmount: {
      type: Number,
      default: 499,
    },
    stats: {
      happyCustomers: { type: String, default: '10000+' },
      productsCount: { type: String, default: '50+' },
      peelsRecycled: { type: String, default: '500T' },
      averageRating: { type: String, default: '4.9/5' },
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
