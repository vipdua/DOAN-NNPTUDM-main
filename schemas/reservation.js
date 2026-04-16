const mongoose = require('mongoose');

const reservationItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product',
      required: true
    },
    quantity: {
      type: Number,
      min: [1, 'So luong phai it nhat 1'],
      required: true
    },
    price: {
      type: Number,
      min: 0,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    subtotal: {
      type: Number,
      min: 0,
      required: true
    },
    promotion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'promotion',
      default: null
    }
  },
  { _id: false }
);

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },
    products: {
      type: [reservationItemSchema],
      default: []
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired', 'completed'],
      default: 'active'
    },
    expiredIn: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 gio
    },
    amount: {
      type: Number,
      min: 0,
      required: true
    },
    shippingAddress: {
      type: String,
      default: ''
    },
    note: {
      type: String,
      default: ''
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('reservation', reservationSchema);