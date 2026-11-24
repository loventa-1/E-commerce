const Order = require('../models/Order');
const Item = require('../models/Item');
const sendOrderConfirmationEmail = require('../utils/sendEmail');
const { createCheckoutSession, retrieveCheckoutSession } = require('../services/stripeService');
const { markOrderPaid } = require('./stripeController');

// @desc    Create new order (Public checkout)
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
  try {
    const { items, customer, notes, paymentMethod = 'cash' } = req.body;

    if (!['cash', 'stripe'].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Unsupported payment method' });
    }
    const stripeEnabled = (process.env.ENABLE_STRIPE || 'true').toLowerCase() !== 'false'
      && Boolean(process.env.STRIPE_SECRET_KEY?.trim())
      && !process.env.STRIPE_SECRET_KEY?.includes('replace_me');
    if (paymentMethod === 'stripe' && !stripeEnabled) {
      return res.status(503).json({ success: false, message: 'Stripe payments are not configured' });
    }

    if (!customer || !customer.name || !customer.email || !customer.phone || !customer.address) {
      return res.status(400).json({
        success: false,
        message: 'Customer name, email, phone number, and delivery address are required'
      });
    }

    const customerEmail = customer.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    // Aggregate duplicate item entries and validate the whole order before changing inventory.
    const quantitiesByItem = new Map();
    for (const cartItem of items) {
      const itemId = cartItem.itemId || cartItem.item || cartItem._id;
      const qty = Number(cartItem.quantity);
      if (!itemId) {
        return res.status(400).json({ success: false, message: 'Each order item must include an item ID' });
      }
      if (!Number.isInteger(qty) || qty < 1) {
        return res.status(400).json({ success: false, message: 'Item quantities must be positive whole numbers' });
      }
      const key = String(itemId);
      quantitiesByItem.set(key, (quantitiesByItem.get(key) || 0) + qty);
    }

    let totalAmount = 0;
    const orderItems = [];
    const validatedItems = [];

    for (const [itemId, qty] of quantitiesByItem.entries()) {
      let itemDoc;
      try {
        itemDoc = await Item.findById(itemId);
      } catch (error) {
        return res.status(400).json({ success: false, message: `Invalid item ID: ${itemId}` });
      }
      if (!itemDoc) {
        return res.status(404).json({
          success: false,
          message: `Item not found: ${itemId}`
        });
      }
      if (itemDoc.quantity < qty) {
        return res.status(409).json({
          success: false,
          code: 'INSUFFICIENT_STOCK',
          message: `${itemDoc.name} is out of stock or has insufficient quantity. Available: ${itemDoc.quantity}`
        });
      }

      const subtotal = itemDoc.price * qty;
      totalAmount += subtotal;
      validatedItems.push({ itemDoc, qty });
      orderItems.push({
        item: itemDoc._id,
        name: itemDoc.name,
        nameEn: itemDoc.nameEn || itemDoc.name,
        nameAr: itemDoc.nameAr || itemDoc.nameEn || itemDoc.name,
        imageUrl: itemDoc.imageUrl || '',
        price: itemDoc.price,
        quantity: qty
      });
    }

    const decrementedItems = [];
    if (paymentMethod === 'cash') {
      for (const { itemDoc, qty } of validatedItems) {
        const updatedItem = await Item.findOneAndUpdate(
          { _id: itemDoc._id, quantity: { $gte: qty } },
          { $inc: { quantity: -qty } },
          { new: true }
        );
        if (!updatedItem) {
          await Promise.all(decrementedItems.map((entry) =>
            Item.updateOne(
              { _id: entry.itemDoc._id },
              { $inc: { quantity: entry.qty } }
            )
          ));
          return res.status(409).json({
            success: false,
            code: 'INSUFFICIENT_STOCK',
            message: `${itemDoc.name} is out of stock or has insufficient quantity`
          });
        }
        decrementedItems.push({ itemDoc, qty });
      }
    }

    let order;
    try {
      order = await Order.create({
        items: orderItems,
        customer: {
          name: customer.name.trim(),
          email: customerEmail,
          phone: customer.phone.trim(),
          address: customer.address.trim()
        },
        totalAmount: Math.round(totalAmount * 100) / 100,
        paymentMethod,
        paymentStatus: 'pending',
        status: 'opened', // Default status: opened
        notes: (notes || '').trim()
      });
    } catch (error) {
      if (paymentMethod === 'cash') {
        await Promise.all(decrementedItems.map((entry) =>
          Item.updateOne(
            { _id: entry.itemDoc._id },
            { $inc: { quantity: entry.qty } }
          )
        ));
      }
      throw error;
    }

    if (paymentMethod === 'stripe') {
      try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
        const session = await createCheckoutSession({
          orderId: order._id,
          amount: totalAmount,
          items: orderItems,
          customer: order.customer,
          successUrl: `${frontendUrl}/buy?orderId=${order._id}&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${frontendUrl}/buy?orderId=${order._id}&cancelled=true`
        });
        order.stripeDetails.sessionId = session.id;
        await order.save();
        return res.status(201).json({
          success: true,
          message: 'Stripe Checkout session created',
          checkoutUrl: session.url,
          data: order
        });
      } catch (error) {
        await Order.findByIdAndDelete(order._id);
        return res.status(502).json({ success: false, message: error.message });
      }
    }

    const emailSent = await sendOrderConfirmationEmail(order);

    res.status(201).json({
      success: true,
      message: 'Order created successfully. Our team will contact you by phone call for confirmation and delivery!',
      emailSent,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const verifyOrderStatus = async (req, res) => {
  try {
    const { session_id: sessionId } = req.query;
    if (!sessionId) return res.status(400).json({ success: false, message: 'session_id is required' });

    const order = await Order.findById(req.params.id);
    if (!order || order.paymentMethod !== 'stripe' || order.stripeDetails.sessionId !== sessionId) {
      return res.status(404).json({ success: false, message: 'Order or Checkout session not found' });
    }

    const session = await retrieveCheckoutSession(sessionId);
    if (session.metadata?.orderId !== String(order._id) || session.client_reference_id !== String(order._id)) {
      return res.status(400).json({ success: false, message: 'Checkout session does not match this order' });
    }
    if (session.payment_status === 'paid') {
      await markOrderPaid(session);
    }

    const currentOrder = await Order.findById(order._id);
    res.json({
      success: true,
      data: {
        _id: currentOrder._id,
        items: currentOrder.items.map(({ name, quantity }) => ({ name, quantity })),
        customer: { name: currentOrder.customer.name, email: currentOrder.customer.email },
        totalAmount: currentOrder.totalAmount,
        status: currentOrder.status,
        paymentMethod: currentOrder.paymentMethod,
        paymentStatus: currentOrder.paymentStatus,
        notes: currentOrder.notes
      }
    });
  } catch (error) {
    res.status(502).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (Manager dashboard)
// @route   GET /api/orders
// @access  Private (Manager)
const getOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status && ['opened', 'closed'].includes(status)) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('items.item', 'name price imageUrl')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private (Manager)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.item', 'name price imageUrl quantity');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update order status and notes (Manager dashboard)
// @route   PATCH /api/orders/:id
// @access  Private (Manager)
const updateOrder = async (req, res) => {
  try {
    const { status, notes, managerNotes, managerNote } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (status) {
      if (!['opened', 'closed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be either "opened" or "closed"'
        });
      }
      order.status = status;
    }

    if (notes !== undefined) {
      order.notes = notes.trim();
    }

    if (managerNotes !== undefined) {
      order.managerNotes = managerNotes.trim();
    }

    if (managerNote !== undefined) {
      if (typeof managerNote !== 'string' || !managerNote.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Manager note cannot be empty'
        });
      }

      if (managerNote.trim().length > 1000) {
        return res.status(400).json({
          success: false,
          message: 'Manager note cannot exceed 1000 characters'
        });
      }

      order.managerNoteEntries.push({ text: managerNote.trim() });
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  verifyOrderStatus
};
