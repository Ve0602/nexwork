const router = require('express').Router();
const NexUser = require('../models/NexUser');
const { auth } = require('../middleware/auth');

// Search freelancers/users
router.get('/search', async (req, res) => {
  try {
    const { role, skill, location, minRate, maxRate, search, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };
    if (role) filter.roles = role;
    if (location) filter.$or = [{ city: { $regex: location, $options: 'i' } }, { state: { $regex: location, $options: 'i' } }];
    if (skill) filter['skills.name'] = { $regex: skill, $options: 'i' };
    if (minRate) filter.hourlyRate = { $gte: parseInt(minRate) };
    if (maxRate) filter.hourlyRate = { ...filter.hourlyRate, $lte: parseInt(maxRate) };
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { headline: { $regex: search, $options: 'i' } }];
    const users = await NexUser.find(filter).select('-password -email').sort({ rating: -1, reviewCount: -1 }).limit(parseInt(limit)).skip((page-1)*limit);
    const total = await NexUser.countDocuments(filter);
    res.json({ users, total, pages: Math.ceil(total/limit) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await NexUser.findById(req.params.id).select('-password -email');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (e) { res.status(404).json({ message: 'Not found' }); }
});

// Get notifications
router.get('/notifications/all', auth, async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const notifs = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json(notifs);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Mark notification read
router.put('/notifications/:id/read', auth, async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Marked as read' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
