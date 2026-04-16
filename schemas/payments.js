const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'reservation',
      required: true
    },
    method: {
      type: String,
      enum: ['COD', 'ZALOPAY', 'MOMO', 'VNPAY', 'BANK_TRANSFER'],
      required: true
    },
    transactionId: {
      type: String,
      default: null
    },
    currency: {
      type: String,
      default: 'VND'
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    providerResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    pendingAt: {
      type: Date,
      default: Date.now
    },
    paidAt: {
      type: Date,
      default: null
    },
    failedAt: {
      type: Date,
      default: null
    },
    refundAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('payment', paymentSchema);