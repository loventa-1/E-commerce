const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: '',
      trim: true
    },
    nameEn: {
      type: String,
      default: '',
      trim: true
    },
    nameAr: {
      type: String,
      default: '',
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    descriptionEn: {
      type: String,
      default: '',
      trim: true
    },
    descriptionAr: {
      type: String,
      default: '',
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Item price is required'],
      min: [0, 'Price must be greater than or equal to 0']
    },
    quantity: {
      type: Number,
      required: [true, 'Item quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Item category is required']
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Item', itemSchema);

