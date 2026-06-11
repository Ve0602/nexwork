const mongoose = require('mongoose');
const s = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  category:    { type: String, required: true },
  skills:      [{ type: String }],
  budget:      { min: Number, max: Number, type: { type: String, enum: ['fixed','hourly'], default: 'fixed' } },
  duration:    { type: String, default: '' },
  status:      { type: String, enum: ['open','in_progress','completed','cancelled','disputed'], default: 'open' },
  clientId:    { type: mongoose.Schema.Types.ObjectId, ref: 'NexUser', required: true },
  freelancerId:{ type: mongoose.Schema.Types.ObjectId, ref: 'NexUser', default: null },
  proposals:   [{ freelancerId: mongoose.Schema.Types.ObjectId, coverLetter: String, bid: Number, duration: String, status: { type: String, enum: ['pending','accepted','rejected'], default: 'pending' }, createdAt: { type: Date, default: Date.now } }],
  milestones:  [{ title: String, amount: Number, dueDate: Date, status: { type: String, enum: ['pending','in_progress','completed','paid'], default: 'pending' }, deliverables: String }],
  attachments: [{ type: String }],
  tags:        [{ type: String }],
  visibility:  { type: String, enum: ['public','private','invite'], default: 'public' },
  escrowAmount:{ type: Number, default: 0 },
  totalPaid:   { type: Number, default: 0 },
  rating:      { client: Number, freelancer: Number },
  review:      { client: String, freelancer: String },
  createdAt:   { type: Date, default: Date.now },
  updatedAt:   { type: Date, default: Date.now }
});
module.exports = mongoose.model('NexProject', s);
