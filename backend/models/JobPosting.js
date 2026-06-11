const mongoose = require('mongoose');
const s = new mongoose.Schema({
  title:       { type: String, required: true },
  company:     { type: String, required: true },
  description: { type: String, required: true },
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'NexUser', required: true },
  type:        { type: String, enum: ['fulltime','parttime','contract','internship','freelance'], default: 'fulltime' },
  mode:        { type: String, enum: ['remote','onsite','hybrid'], default: 'remote' },
  location:    { type: String, default: '' },
  skills:      [{ type: String }],
  experience:  { min: Number, max: Number },
  salary:      { min: Number, max: Number, currency: { type: String, default: 'INR' }, period: { type: String, default: 'monthly' } },
  openings:    { type: Number, default: 1 },
  applications:[{ applicantId: mongoose.Schema.Types.ObjectId, coverLetter: String, resumeUrl: String, status: { type: String, default: 'applied' }, appliedAt: { type: Date, default: Date.now } }],
  status:      { type: String, enum: ['active','closed','draft'], default: 'active' },
  deadline:    { type: Date },
  tags:        [{ type: String }],
  isVerified:  { type: Boolean, default: false },
  views:       { type: Number, default: 0 },
  createdAt:   { type: Date, default: Date.now }
});
module.exports = mongoose.model('NexJob', s);
