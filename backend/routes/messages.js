const router = require('express').Router();
const Message = require('../models/Message');
const { auth } = require('../middleware/auth');

// Get conversations list
router.get('/conversations', auth, async (req, res) => {
  try {
    const msgs = await Message.aggregate([
      { $match: { $or: [{ senderId: req.user._id }, { receiverId: req.user._id }] } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$conversationId', lastMessage: { $first: '$$ROOT' }, unreadCount: { $sum: { $cond: [{ $and: [{ $eq: ['$receiverId', req.user._id] }, { $eq: ['$isRead', false] }] }, 1, 0] } } } }
    ]);
    res.json(msgs);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Get messages in conversation
router.get('/:conversationId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId }).populate('senderId','name photo').sort({ createdAt: 1 });
    await Message.updateMany({ conversationId: req.params.conversationId, receiverId: req.user._id, isRead: false }, { isRead: true });
    res.json(messages);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Send message
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, content, type = 'text', fileUrl, projectId, orderId } = req.body;
    const conversationId = [req.user._id.toString(), receiverId].sort().join('_');
    const message = await Message.create({ conversationId, senderId: req.user._id, receiverId, content, type, fileUrl, projectId, orderId });
    const populated = await message.populate('senderId','name photo');
    res.status(201).json(populated);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// Mark read
router.put('/:conversationId/read', auth, async (req, res) => {
  try {
    await Message.updateMany({ conversationId: req.params.conversationId, receiverId: req.user._id }, { isRead: true });
    res.json({ message: 'Marked as read' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
