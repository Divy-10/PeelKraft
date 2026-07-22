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
      default: '',
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
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
