const router = require('express').Router();
const Notification = require('../models/Notification');
const NexUser = require('../models/NexUser');
const { sendEmail } = require('../utils/emailSender');
const templates = require('../utils/emailTemplates');
const { auth } = require('../middleware/auth');

const FRONTEND = process.env.FRONTEND_URL || 'https://nexwork.vercel.app';

// Helper used internally by other routes to create in-app + email notification together
async function notify({ userId, type, title, message, link, icon, emailTemplate, emailData }) {
  try {
    await Notification.create({ userId, type, title, message, link, icon: icon || '🔔' });
    if (emailTemplate && templates[emailTemplate]) {
      const user = await NexUser.findById(userId);
      if (user?.email && user.emailNotifs !== false) {
        const html = templates[emailTemplate]({ ...emailData, frontendUrl: FRONTEND });
        await sendEmail({ to: user.email, subject: title, html });
      }
    }
  } catch (e) { console.log('Notify error:', e.message); }
}

// Welcome email triggered right after registration (called internally, no auth needed)
router.post('/welcome', async (req, res) => {
  try {
    const { userName, userEmail } = req.body;
    if (!userEmail) return res.status(400).json({ message: 'No email' });
    const html = templates.welcome({ userName: userName||'there', frontendUrl: FRONTEND });
    await sendEmail({ to: userEmail, subject: 'Welcome to NexWork! 🎉', html });
    res.json({ message: 'Welcome email sent' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Get my notifications
router.get('/', auth, async (req, res) => {
  try {
    const notifs = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json(notifs);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Mark one as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isRead: true });
    res.json({ message: 'Marked as read' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Mark all as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'All marked as read' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = { router, notify };
