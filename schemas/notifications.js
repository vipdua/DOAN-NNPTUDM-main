const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Tieu de thong bao la bat buoc'],
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Noi dung thong bao la bat buoc'],
      trim: true
    },
    type: {
      type: String,
      enum: ['order', 'payment', 'promotion', 'system', 'message'],
      default: 'system'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    refId: {
      // ID tham chieu: reservation, payment, promotion...
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('notification', notificationSchema);
