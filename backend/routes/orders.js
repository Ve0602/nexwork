const router = require('express').Router();
const Order = require('../models/Order');
const Service = require('../models/Service');
const NexUser = require('../models/NexUser');
const { auth } = require('../middleware/auth');
const { notify } = require('./notifications');

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const { serviceId, packageIndex = 0, requirements } = req.body;
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    const pkg = service.packages[packageIndex];
    if (!pkg) return res.status(400).json({ message: 'Package not found' });
    const platformFee = Math.round(pkg.price * 0.10); // 10% commission
    const order = await Order.create({
      serviceId, clientId: req.user._id, providerId: service.providerId,
      package: pkg.name, amount: pkg.price, platformFee,
      netAmount: pkg.price - platformFee, requirements,
      deliveryDate: new Date(Date.now() + parseInt(pkg.delivery) * 24 * 60 * 60 * 1000)
    });
    service.orderCount += 1;
    await service.save();

    // Notify provider of new order
    const client = await NexUser.findById(req.user._id);
    notify({
      userId: service.providerId, type:'new_order',
      title:'🛒 New Order Received!', message:`${client.name} ordered "${service.title}" for ₹${pkg.price}`,
      link:'/my-orders', icon:'🛒',
      emailTemplate:'newOrder', emailData:{ providerName: '', clientName: client.name, serviceTitle: service.title, amount: pkg.price }
    });

    res.status(201).json({ order, message: 'Order placed! Complete payment to start.' });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// Get my orders
router.get('/my', auth, async (req, res) => {
  try {
    const asClient = await Order.find({ clientId: req.user._id }).populate('serviceId','title images').populate('providerId','name photo');
    const asProvider = await Order.find({ providerId: req.user._id }).populate('serviceId','title').populate('clientId','name photo');
    res.json({ asClient, asProvider });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('serviceId').populate('clientId','name photo').populate('providerId','name photo');
    if (!order) return res.status(404).json({ message: 'Not found' });
    if (order.clientId._id.toString() !== req.user._id.toString() && order.providerId._id.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    res.json(order);
  } catch (e) { res.status(404).json({ message: 'Not found' }); }
});

// Update order status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate('serviceId','title').populate('clientId','name').populate('providerId','name');
    if (!order) return res.status(404).json({ message: 'Not found' });
    order.status = status;
    if (status === 'completed') { order.completedAt = new Date(); order.paymentStatus = 'released'; }
    order.updatedAt = new Date();
    await order.save();

    if (status === 'delivered') {
      notify({
        userId: order.clientId._id, type:'order_delivered',
        title:'📦 Order Delivered', message:`${order.providerId.name} delivered "${order.serviceId?.title}"`,
        link:'/my-orders', icon:'📦',
        emailTemplate:'orderDelivered', emailData:{ clientName: order.clientId.name, serviceTitle: order.serviceId?.title }
      });
    }
    if (status === 'completed') {
      notify({
        userId: order.providerId._id, type:'order_completed',
        title:'🎉 Order Completed - Payment Released!', message:`₹${order.netAmount} added to your balance`,
        link:'/earnings', icon:'🎉',
        emailTemplate:'orderCompleted', emailData:{ providerName: order.providerId.name, amount: order.netAmount }
      });
    }

    res.json({ order, message: `Order ${status}` });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// Submit review
router.post('/:id/review', auth, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order || order.status !== 'completed') return res.status(400).json({ message: 'Can only review completed orders' });
    order.rating = rating;
    order.review = review;
    await order.save();
    // Update provider rating
    const orders = await Order.find({ providerId: order.providerId, rating: { $gt: 0 } });
    const avgRating = orders.reduce((a, o) => a + o.rating, 0) / orders.length;
    await NexUser.findByIdAndUpdate(order.providerId, { rating: Math.round(avgRating * 10) / 10, reviewCount: orders.length });
    res.json({ message: 'Review submitted!' });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// Public: get written reviews for a provider — no auth required, this is what builds trust pre-signup
router.get('/reviews/:providerId', async (req, res) => {
  try {
    const reviews = await Order.find({ providerId: req.params.providerId, rating: { $gt: 0 }, review: { $exists: true, $ne: '' } })
      .populate('clientId', 'name photo')
      .populate('serviceId', 'title')
      .sort({ completedAt: -1 })
      .limit(50)
      .select('rating review completedAt clientId serviceId');
    res.json(reviews);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
