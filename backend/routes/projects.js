const router = require('express').Router();
const Project = require('../models/Project');
const { auth, adminOnly } = require('../middleware/auth');

// Get all open projects
router.get('/', async (req, res) => {
  try {
    const { category, skills, budget, search, page = 1, limit = 20 } = req.query;
    const filter = { status: 'open', visibility: 'public' };
    if (category) filter.category = category;
    if (search) filter.$or = [{ title: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
    const projects = await Project.find(filter).populate('clientId', 'name photo rating reviewCount').sort({ createdAt: -1 }).limit(parseInt(limit)).skip((page-1)*limit);
    const total = await Project.countDocuments(filter);
    res.json({ projects, total, pages: Math.ceil(total/limit) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Get single project
router.get('/:id', async (req, res) => {
  try {
    const p = await Project.findById(req.params.id).populate('clientId','name photo rating').populate('freelancerId','name photo rating');
    if (!p) return res.status(404).json({ message: 'Not found' });
    res.json(p);
  } catch (e) { res.status(404).json({ message: 'Not found' }); }
});

// Post a project (client)
router.post('/', auth, async (req, res) => {
  try {
    const project = await Project.create({ ...req.body, clientId: req.user._id, updatedAt: new Date() });
    res.status(201).json(project);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// Submit proposal (freelancer)
router.post('/:id/proposals', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Not found' });
    const existing = project.proposals.find(p => p.freelancerId.toString() === req.user._id.toString());
    if (existing) return res.status(400).json({ message: 'You already submitted a proposal' });
    project.proposals.push({ freelancerId: req.user._id, ...req.body });
    await project.save();
    res.status(201).json({ message: 'Proposal submitted!' });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// Accept proposal
router.put('/:id/proposals/:proposalId/accept', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project || project.clientId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    const proposal = project.proposals.id(req.params.proposalId);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    project.proposals.forEach(p => p.status = 'rejected');
    proposal.status = 'accepted';
    project.freelancerId = proposal.freelancerId;
    project.status = 'in_progress';
    await project.save();
    res.json({ message: 'Proposal accepted! Project started.' });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// Update project status
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Not found' });
    if (project.clientId.toString() !== req.user._id.toString() && req.user.primaryRole !== 'admin') return res.status(403).json({ message: 'Not authorized' });
    Object.assign(project, req.body);
    project.updatedAt = new Date();
    await project.save();
    res.json(project);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// Get my projects
router.get('/my/all', auth, async (req, res) => {
  try {
    const asClient = await Project.find({ clientId: req.user._id }).populate('freelancerId','name photo');
    const asFreelancer = await Project.find({ freelancerId: req.user._id }).populate('clientId','name photo');
    res.json({ asClient, asFreelancer });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
