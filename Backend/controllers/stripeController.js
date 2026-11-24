const Order = require('../models/Order');
const Item = require('../models/Item');
const sendOrderConfirmationEmail = require('../utils/sendEmail');
const { verifyWebhookSignature } = require('../services/stripeService');

const stripeConfig = (req, res) => {
  const enableSetting = (process.env.ENABLE_STRIPE || 'true').toLowerCase();
  const enabled = enableSetting !== 'false'
    && Boolean(process.env.STRIPE_SECRET_KEY?.trim())
    && !process.env.STRIPE_SECRET_KEY?.includes('replace_me');
  res.json({ success: true, enabled });
};

const markOrderPaid = async (session) => {
  const orderId = session.metadata?.orderId;
  if (!orderId || session.payment_status !== 'paid') return;

  const existingOrder = await Order.findById(orderId);
  if (!existingOrder || existingOrder.paymentMethod !== 'stripe' || existingOrder.stripeDetails?.sessionId !== session.id) return;
  if (session.amount_total !== Math.round(existingOrder.totalAmount * 100)
    || session.currency !== (process.env.STRIPE_CURRENCY || 'usd').toLowerCase()) {
    throw new Error('Stripe Checkout total does not match the order');
  }

  const order = await Order.findOneAndUpdate({
    _id: orderId,
    paymentMethod: 'stripe',
    paymentStatus: 'pending',
    'stripeDetails.sessionId': session.id
  }, { $set: { paymentStatus: 'processing' } }, { new: true });
  if (!order) return;

  const decrementedItems = [];
  for (const line of order.items) {
    const updatedItem = await Item.findOneAndUpdate(
      { _id: line.item, quantity: { $gte: line.quantity } },
      { $inc: { quantity: -line.quantity } },
      { new: true }
    );
    if (!updatedItem) {
      await Promise.all(decrementedItems.map((item) => Item.updateOne(
        { _id: item.item },
        { $inc: { quantity: item.quantity } }
      )));
      order.paymentStatus = 'failed';
      await order.save();
      return;
    }
    decrementedItems.push(line);
  }

  order.paymentStatus = 'paid';
  order.stripeDetails.paymentIntentId = session.payment_intent || '';
  order.stripeDetails.customerEmail = session.customer_details?.email || session.customer_email || order.customer.email;
  await order.save();
  await sendOrderConfirmationEmail(order);
};

const receiveWebhook = async (req, res) => {
  const signature = req.get('stripe-signature');
  if (!verifyWebhookSignature(req.body, signature)) {
    return res.status(400).json({ success: false, message: 'Invalid Stripe webhook signature' });
  }

  try {
    const event = JSON.parse(req.body.toString('utf8'));
    if (event.type === 'checkout.session.completed') {
      await markOrderPaid(event.data.object);
    }
    res.json({ received: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { stripeConfig, receiveWebhook, markOrderPaid };