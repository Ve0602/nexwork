const router = require('express').Router();
const jwt = require('jsonwebtoken');
const NexUser = require('../models/NexUser');
const { auth } = require('../middleware/auth');
const { sendEmail } = require('../utils/emailSender');
const templates = require('../utils/emailTemplates');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, primaryRole = 'freelancer' } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (await NexUser.findOne({ email })) return res.status(400).json({ message: 'Email already registered' });
    const user = await NexUser.create({ name, email, password, phone, primaryRole, roles: [primaryRole] });

    // Fire-and-forget welcome email
    sendEmail({ to: email, subject: 'Welcome to NexWork! 🎉', html: templates.welcome({ userName: name, frontendUrl: process.env.FRONTEND_URL }) })
      .catch(e => console.log('Welcome email skipped:', e.message));

    res.status(201).json({ token: sign(user._id), user: safeUser(user) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await NexUser.findOne({ email });
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: 'Invalid email or password' });
    user.lastLogin = new Date(); await user.save();
    res.json({ token: sign(user._id), user: safeUser(user) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Get me
router.get('/me', auth, (req, res) => res.json({ user: safeUser(req.user) }));

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const allowed = ['name','headline','bio','location','city','state','country','phone','hourlyRate','availability','skills','experience','education','certifications','portfolio','linkedinUrl','githubUrl','websiteUrl','language','emailNotifs'];
    const update = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    update.updatedAt = new Date();
    const user = await NexUser.findByIdAndUpdate(req.user._id, update, { new: true }).select('-password');
    res.json({ user: safeUser(user) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Add role
router.post('/add-role', auth, async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['student','freelancer','jobseeker','professional','mentor','trainer','service_provider','client','enterprise','recruiter'];
    if (!validRoles.includes(role)) return res.status(400).json({ message: 'Invalid role' });
    const user = await NexUser.findById(req.user._id);
    if (!user.roles.includes(role)) { user.roles.push(role); await user.save(); }
    res.json({ user: safeUser(user) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

const safeUser = (u) => ({ id: u._id, name: u.name, email: u.email, photo: u.photo, phone: u.phone, roles: u.roles, primaryRole: u.primaryRole, headline: u.headline, bio: u.bio, location: u.location, city: u.city, skills: u.skills, hourlyRate: u.hourlyRate, availability: u.availability, rating: u.rating, reviewCount: u.reviewCount, plan: u.plan, isVerified: u.isVerified });

module.exports = router;
