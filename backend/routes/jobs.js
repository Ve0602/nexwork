const router = require('express').Router();
const Job = require('../models/JobPosting');
const { auth } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { type, mode, search, page = 1, limit = 20 } = req.query;
    const filter = { status: 'active' };
    if (type) filter.type = type;
    if (mode) filter.mode = mode;
    if (search) filter.$or = [{ title: { $regex: search, $options: 'i' } }, { company: { $regex: search, $options: 'i' } }];
    const jobs = await Job.find(filter).populate('recruiterId','name photo').sort({ createdAt: -1 }).limit(parseInt(limit)).skip((page-1)*limit);
    const total = await Job.countDocuments(filter);
    res.json({ jobs, total, pages: Math.ceil(total/limit) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true }).populate('recruiterId','name photo headline');
    if (!job) return res.status(404).json({ message: 'Not found' });
    res.json(job);
  } catch (e) { res.status(404).json({ message: 'Not found' }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const job = await Job.create({ ...req.body, recruiterId: req.user._id });
    res.status(201).json(job);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.post('/:id/apply', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Not found' });
    const already = job.applications.find(a => a.applicantId.toString() === req.user._id.toString());
    if (already) return res.status(400).json({ message: 'Already applied' });
    job.applications.push({ applicantId: req.user._id, ...req.body });
    await job.save();
    res.status(201).json({ message: 'Application submitted!' });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.get('/my/posted', auth, async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user._id });
    res.json(jobs);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
