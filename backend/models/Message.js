const mongoose = require('mongoose');
const s = new mongoose.Schema({
  conversationId: { type: String, required: true },
  senderId:    { type: mongoose.Schema.Types.ObjectId, ref: 'NexUser', required: true },
  receiverId:  { type: mongoose.Schema.Types.ObjectId, ref: 'NexUser', required: true },
  content:     { type: String, required: true },
  type:        { type: String, enum: ['text','image','file','offer'], default: 'text' },
  fileUrl:     { type: String, default: '' },
  isRead:      { type: Boolean, default: false },
  projectId:   { type: mongoose.Schema.Types.ObjectId, ref: 'NexProject', default: null },
  orderId:     { type: mongoose.Schema.Types.ObjectId, ref: 'NexOrder', default: null },
  createdAt:   { type: Date, default: Date.now }
});
module.exports = mongoose.model('NexMessage', s);
