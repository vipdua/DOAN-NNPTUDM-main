const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product',
      required: true
    },
    rating: {
      type: Number,
      min: [1, 'Danh gia toi thieu 1 sao'],
      max: [5, 'Danh gia toi da 5 sao'],
      required: true
    },
    comment: {
      type: String,
      default: '',
      trim: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Moi user chi review 1 san pham 1 lan
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('review', reviewSchema);
