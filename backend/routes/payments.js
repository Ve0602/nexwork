const router = require('express').Router();
const Order = require('../models/Order');
const NexUser = require('../models/NexUser');
const { auth } = require('../middleware/auth');
const { notify } = require('./notifications');

// Razorpay setup - lazy loaded so server doesn't crash if keys aren't set yet
let razorpay = null;
const getRazorpay = () => {
  if (razorpay) return razorpay;
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  const Razorpay = require('razorpay');
  razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  return razorpay;
};

// Create a payment order (called when client clicks "Pay Now")
router.post('/create-order', auth, async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.clientId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    if (order.paymentStatus === 'paid') return res.status(400).json({ message: 'Already paid' });

    const rzp = getRazorpay();
    if (!rzp) return res.status(503).json({ message: 'Payment gateway not configured yet. Contact admin.' });

    const razorpayOrder = await rzp.orders.create({
      amount: order.amount * 100, // paise
      currency: 'INR',
      receipt: `order_${order._id}`,
      notes: { nexworkOrderId: order._id.toString() }
    });

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order._id
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Verify payment after Razorpay checkout completes
router.post('/verify', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed - signature mismatch' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.paymentStatus = 'paid';
    order.paymentId = razorpay_payment_id;
    order.status = 'active';
    await order.save();

    const provider = await NexUser.findById(order.providerId);
    notify({
      userId: order.providerId, type:'payment_received',
      title:'💰 Payment Received', message:`₹${order.amount} payment confirmed. Order is now active!`,
      link:'/my-orders', icon:'💰',
      emailTemplate:'paymentReceived', emailData:{ providerName: provider?.name, amount: order.amount }
    });

    res.json({ message: '✅ Payment successful! Order is now active.', order });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Release payment to provider (called when client marks order completed)
router.post('/release/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.clientId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    if (order.paymentStatus !== 'paid') return res.status(400).json({ message: 'Order not paid yet' });

    order.paymentStatus = 'released';
    await order.save();

    // Track earnings on provider profile
    await NexUser.findByIdAndUpdate(order.providerId, {
      $inc: { totalEarned: order.netAmount, totalJobs: 1 }
    });

    res.json({ message: '✅ Payment released to provider!', order });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Get payment status
router.get('/status/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).select('paymentStatus status amount platformFee netAmount paymentId');
    res.json(order);
  } catch (e) { res.status(404).json({ message: 'Not found' }); }
});

module.exports = router;
