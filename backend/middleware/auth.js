const jwt = require('jsonwebtoken');
const NexUser = require('../models/NexUser');

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await NexUser.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch (err) { res.status(401).json({ message: 'Invalid token' }); }
};

const adminOnly = async (req, res, next) => {
  await auth(req, res, () => {
    if (!req.user.roles.includes('admin')) return res.status(403).json({ message: 'Admin access required' });
    next();
  });
};

module.exports = { auth, adminOnly };
