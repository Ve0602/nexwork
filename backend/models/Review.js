const mongoose = require('mongoose');
const s = new mongoose.Schema({
  targetId:    { type: mongoose.Schema.Types.ObjectId, required: true },
  targetType:  { type: String, enum: ['user','service','course','product'], required: true },
  reviewerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'NexUser', required: true },
  rating:      { type: Number, required: true, min: 1, max: 5 },
  comment:     { type: String, required: true },
  orderId:     { type: mongoose.Schema.Types.ObjectId, ref: 'NexOrder', default: null },
  isVerified:  { type: Boolean, default: false },
  helpful:     { type: Number, default: 0 },
  createdAt:   { type: Date, default: Date.now }
});
module.exports = mongoose.model('NexReview', s);
