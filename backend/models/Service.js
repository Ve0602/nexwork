const mongoose = require('mongoose');
const s = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  category:    { type: String, required: true },
  subcategory: { type: String, default: '' },
  providerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'NexUser', required: true },
  images:      [{ type: String }],
  packages:    [{
    name:    { type: String }, // Basic, Standard, Premium
    price:   { type: Number },
    delivery:{ type: String },
    includes:[{ type: String }],
    revisions:{ type: Number, default: 1 }
  }],
  tags:        [{ type: String }],
  rating:      { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  orderCount:  { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
  isFeatured:  { type: Boolean, default: false },
  location:    { type: String, default: '' }, // for local services
  serviceType: { type: String, enum: ['remote','local','both'], default: 'remote' },
  createdAt:   { type: Date, default: Date.now }
});
module.exports = mongoose.model('NexService', s);
