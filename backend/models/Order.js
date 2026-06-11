const mongoose = require('mongoose');
const s = new mongoose.Schema({
  serviceId:   { type: mongoose.Schema.Types.ObjectId, ref: 'NexService' },
  projectId:   { type: mongoose.Schema.Types.ObjectId, ref: 'NexProject' },
  clientId:    { type: mongoose.Schema.Types.ObjectId, ref: 'NexUser', required: true },
  providerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'NexUser', required: true },
  package:     { type: String, default: 'basic' },
  amount:      { type: Number, required: true },
  platformFee: { type: Number, default: 0 },
  netAmount:   { type: Number, default: 0 },
  status:      { type: String, enum: ['pending','active','delivered','completed','cancelled','disputed','refunded'], default: 'pending' },
  paymentStatus:{ type: String, enum: ['pending','paid','released','refunded'], default: 'pending' },
  paymentId:   { type: String, default: '' },
  requirements:{ type: String, default: '' },
  deliveryDate:{ type: Date },
  completedAt: { type: Date },
  rating:      { type: Number, default: 0 },
  review:      { type: String, default: '' },
  dispute:     { reason: String, status: String, resolution: String },
  createdAt:   { type: Date, default: Date.now },
  updatedAt:   { type: Date, default: Date.now }
});
module.exports = mongoose.model('NexOrder', s);
