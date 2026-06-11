const router = require('express').Router();
const Service = require('../models/Service');
const { auth } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { category, serviceType, search, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (serviceType) filter.serviceType = serviceType;
    if (search) filter.$or = [{ title: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
    const services = await Service.find(filter).populate('providerId','name photo rating reviewCount city').sort({ isFeatured: -1, orderCount: -1 }).limit(parseInt(limit)).skip((page-1)*limit);
    const total = await Service.countDocuments(filter);
    res.json({ services, total, pages: Math.ceil(total/limit) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const s = await Service.findById(req.params.id).populate('providerId','name photo rating reviewCount headline bio city skills');
    if (!s) return res.status(404).json({ message: 'Not found' });
    res.json(s);
  } catch (e) { res.status(404).json({ message: 'Not found' }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const service = await Service.create({ ...req.body, providerId: req.user._id });
    res.status(201).json(service);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service || service.providerId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    Object.assign(service, req.body);
    await service.save();
    res.json(service);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service || service.providerId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    await service.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/my/all', auth, async (req, res) => {
  try {
    const services = await Service.find({ providerId: req.user._id });
    res.json(services);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
