const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
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
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Category', categorySchema);

