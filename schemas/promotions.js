const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Ma khuyen mai la bat buoc'],
      unique: true,
      uppercase: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    discountType: {
      type: String,
      enum: ['percent', 'fixed'],
      required: [true, 'Loai giam gia la bat buoc']
    },
    discountValue: {
      type: Number,
      min: [0, 'Gia tri giam khong duoc am'],
      required: [true, 'Gia tri giam la bat buoc']
    },
    minOrderAmount: {
      type: Number,
      min: 0,
      default: 0
    },
    maxUses: {
      type: Number,
      min: 1,
      default: 100
    },
    usedCount: {
      type: Number,
      min: 0,
      default: 0
    },
    startDate: {
      type: Date,
      required: [true, 'Ngay bat dau la bat buoc']
    },
    endDate: {
      type: Date,
      required: [true, 'Ngay ket thuc la bat buoc']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('promotion', promotionSchema);
