const mongoose = require('mongoose');
const s = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  instructorId:{ type: mongoose.Schema.Types.ObjectId, ref: 'NexUser', required: true },
  category:    { type: String, required: true },
  level:       { type: String, enum: ['beginner','intermediate','advanced'], default: 'beginner' },
  language:    { type: String, default: 'en' },
  thumbnail:   { type: String, default: '' },
  previewVideo:{ type: String, default: '' },
  price:       { type: Number, default: 0 },
  originalPrice:{ type: Number, default: 0 },
  isFree:      { type: Boolean, default: false },
  modules:     [{ title: String, lessons: [{ title: String, videoUrl: String, duration: Number, isFree: Boolean, resources: [String] }] }],
  skills:      [{ type: String }],
  requirements:[{ type: String }],
  outcomes:    [{ type: String }],
  enrollCount: { type: Number, default: 0 },
  rating:      { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  certificate: { type: Boolean, default: true },
  isPublished: { type: Boolean, default: false },
  createdAt:   { type: Date, default: Date.now }
});
module.exports = mongoose.model('NexCourse', s);
