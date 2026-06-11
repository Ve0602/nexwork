const router = require('express').Router();
const NexUser = require('../models/NexUser');
const Project = require('../models/Project');
const Service = require('../models/Service');
const Order = require('../models/Order');
const Job = require('../models/JobPosting');
const { auth, adminOnly } = require('../middleware/auth');

// Dashboard stats
router.get('/stats', adminOnly, async (req, res) => {
  try {
    const [users, projects, services, orders, jobs] = await Promise.all([
      NexUser.countDocuments(),
      Project.countDocuments(),
      Service.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Job.countDocuments({ status: 'active' }),
    ]);
    const revenue = await Order.aggregate([{ $match: { paymentStatus: 'released' } }, { $group: { _id: null, total: { $sum: '$platformFee' } } }]);
    const recentUsers = await NexUser.find().sort({ createdAt: -1 }).limit(10).select('name email photo primaryRole createdAt isVerified');
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10).populate('clientId','name').populate('providerId','name').populate('serviceId','title');
    res.json({ users, projects, services, orders, jobs, revenue: revenue[0]?.total || 0, recentUsers, recentOrders });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Manage users
router.get('/users', adminOnly, async (req, res) => {
  try {
    const { search, role, plan, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (role) filter.roles = role;
    if (plan) filter.plan = plan;
    const users = await NexUser.find(filter).select('-password').sort({ createdAt: -1 }).limit(parseInt(limit)).skip((page-1)*limit);
    const total = await NexUser.countDocuments(filter);
    res.json({ users, total });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Verify user
router.put('/users/:id/verify', adminOnly, async (req, res) => {
  try {
    const user = await NexUser.findByIdAndUpdate(req.params.id, { isVerified: req.body.isVerified }, { new: true }).select('-password');
    res.json(user);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// Update user plan
router.put('/users/:id/plan', adminOnly, async (req, res) => {
  try {
    const user = await NexUser.findByIdAndUpdate(req.params.id, { plan: req.body.plan, planExpiry: req.body.planExpiry }, { new: true }).select('-password');
    res.json(user);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// Delete user
router.delete('/users/:id', adminOnly, async (req, res) => {
  try {
    await NexUser.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Feature a service
router.put('/services/:id/feature', adminOnly, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, { isFeatured: req.body.isFeatured }, { new: true });
    res.json(service);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// Manage disputes
router.get('/orders', adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().populate('clientId','name email').populate('providerId','name email').populate('serviceId','title').sort({ createdAt: -1 }).limit(50);
    res.json(orders);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
