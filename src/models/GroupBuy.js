const mongoose = require('mongoose');

const groupBuySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  minUsers: { type: Number, default: 5 },
  discountPercent: { type: Number, default: 10 },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['open', 'successful', 'failed'], default: 'open' },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GroupBuy', groupBuySchema);