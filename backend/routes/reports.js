const router = require('express').Router();
const Report = require('../models/Report');
const NexUser = require('../models/NexUser');
const { auth, adminOnly } = require('../middleware/auth');
const { sendEmail } = require('../utils/emailSender');
const templates = require('../utils/emailTemplates');

// Submit a report — any logged-in user
router.post('/', auth, async (req, res) => {
  try {
    const { targetType, targetId, reason, details } = req.body;
    if (!targetType || !targetId || !reason) return res.status(400).json({ message: 'targetType, targetId, and reason are required' });

    // Prevent the exact same person reporting the exact same thing twice while still pending
    const existing = await Report.findOne({ reporterId: req.user._id, targetType, targetId, status: { $in: ['pending', 'reviewing'] } });
    if (existing) return res.status(400).json({ message: 'You already reported this — our team is reviewing it.' });

    const report = await Report.create({ reporterId: req.user._id, targetType, targetId, reason, details });

    // Notify admin by email (best-effort, not blocking the response)
    if (templates.reportReceived) {
      NexUser.findOne({ roles: 'admin' }).then(admin => {
        if (admin?.email) {
          sendEmail({ to: admin.email, subject: '🚩 New report on NexWork', html: templates.reportReceived({ reporterName: req.user.name, targetType, reason }) }).catch(() => {});
        }
      }).catch(() => {});
    }

    res.status(201).json({ message: 'Report submitted. Our team will review it shortly.', report });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Admin: list reports, filterable by status
router.get('/', adminOnly, async (req, res) => {
  try {
    const { status, targetType, page = 1, limit = 30 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (targetType) filter.targetType = targetType;
    const reports = await Report.find(filter)
      .populate('reporterId', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((page - 1) * limit);
    const total = await Report.countDocuments(filter);
    const pendingCount = await Report.countDocuments({ status: 'pending' });
    res.json({ reports, total, pendingCount });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Admin: update report status
router.put('/:id', adminOnly, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const update = { status, adminNotes };
    if (status === 'resolved' || status === 'dismissed') {
      update.resolvedBy = req.user._id;
      update.resolvedAt = new Date();
    }
    const report = await Report.findByIdAndUpdate(req.params.id, update, { new: true }).populate('reporterId', 'name email');
    res.json(report);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

module.exports = router;
