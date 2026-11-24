const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  nameEn: {
    type: String,
    default: ''
  },
  nameAr: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const managerNoteSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const orderSchema = new mongoose.Schema(
  {
    items: [orderItemSchema],
    customer: {
      name: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true
      },
      email: {
        type: String,
        trim: true,
        lowercase: true
      },
      phone: {
        type: String,
        required: [true, 'Customer phone is required for order confirmation and delivery'],
        trim: true
      },
      address: {
        type: String,
        required: [true, 'Customer address is required for delivery'],
        trim: true
      }
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'stripe'],
      default: 'cash'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'processing', 'paid', 'failed'],
      default: 'pending'
    },
    stripeDetails: {
      sessionId: { type: String, default: '' },
      paymentIntentId: { type: String, default: '' },
      customerEmail: { type: String, default: '' }
    },
    status: {
      type: String,
      enum: ['opened', 'closed'],
      default: 'opened'
    },
    notes: {
      type: String,
      default: '',
      trim: true
    },
    managerNotes: {
      type: String,
      default: '',
      trim: true
    },
    managerNoteEntries: [managerNoteSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Order', orderSchema);

