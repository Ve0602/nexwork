const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporterId:   { type: mongoose.Schema.Types.ObjectId, ref: 'NexUser', required: true },
  targetType:   { type: String, enum: ['user', 'project', 'service', 'job', 'message'], required: true },
  targetId:     { type: mongoose.Schema.Types.ObjectId, required: true },
  reason:       { type: String, enum: ['spam', 'scam_or_fraud', 'inappropriate_content', 'harassment', 'fake_profile', 'not_as_described', 'other'], required: true },
  details:      { type: String, default: '' },
  status:       { type: String, enum: ['pending', 'reviewing', 'resolved', 'dismissed'], default: 'pending' },
  adminNotes:   { type: String, default: '' },
  resolvedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'NexUser', default: null },
  resolvedAt:   { type: Date, default: null },
  createdAt:    { type: Date, default: Date.now },
});

reportSchema.index({ targetType: 1, targetId: 1 });
reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
