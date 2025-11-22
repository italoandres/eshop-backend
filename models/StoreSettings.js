const mongoose = require('mongoose');

const StoreSettingsSchema = new mongoose.Schema(
  {
    storeId: {
      type: String,
      required: [true, 'Store ID é obrigatório'],
      unique: true,
      index: true,
    },
    storeName: {
      type: String,
      required: [true, 'Nome da loja é obrigatório'],
      trim: true,
    },
    logoUrl: {
      type: String,
      default: '',
    },
    logoPosition: {
      type: String,
      enum: ['left', 'center'],
      default: 'center',
    },
    primaryColor: {
      type: String,
      default: '#FF6B6B',
    },
    secondaryColor: {
      type: String,
      default: '#4ECDC4',
    },
    description: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
      whatsapp: String,
    },
    businessHours: {
      monday: { open: String, close: String, closed: Boolean },
      tuesday: { open: String, close: String, closed: Boolean },
      wednesday: { open: String, close: String, closed: Boolean },
      thursday: { open: String, close: String, closed: Boolean },
      friday: { open: String, close: String, closed: Boolean },
      saturday: { open: String, close: String, closed: Boolean },
      sunday: { open: String, close: String, closed: Boolean },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StoreSettings', StoreSettingsSchema);
