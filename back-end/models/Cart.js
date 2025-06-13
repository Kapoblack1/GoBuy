const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  platform: { type: String, enum: ['Shein', 'AliExpress', 'Zara'], required: true },
  cartName: { type: String, required: true },
  description: { type: String },
  imageUrls: { type: [String], required: true }, // <--- alterado para array
  avaluation: { type: Number, default: 0 },
  avaluationCount: { type: Number, default: 0 },
  isOpen: { type: Boolean, default: true },
  isClosed: { type: Boolean, default: false },
  isCancelled: { type: Boolean, default: false },
  isFinished: { type: Boolean, default: false },
  isPaid: { type: Boolean, default: false },
  isDelivered: { type: Boolean, default: false },
  isRefunded: { type: Boolean, default: false },
  isDisputed: { type: Boolean, default: false },
  isInProgress: { type: Boolean, default: false },
  isWaitingForPayment: { type: Boolean, default: false },
  isWaitingForDelivery: { type: Boolean, default: false },
  isWaitingForRefund: { type: Boolean, default: false },
  isWaitingForDispute: { type: Boolean, default: false },

  exchangeRate: { type: Number, required: true },
  openDate: { type: Date, required: true },
  closeDate: { type: Date, required: true },
});

module.exports = mongoose.model('Cart', cartSchema);
