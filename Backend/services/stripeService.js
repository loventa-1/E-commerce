const crypto = require('crypto');

const STRIPE_API_URL = 'https://api.stripe.com/v1';

const appendFormValue = (params, key, value) => {
  if (value === undefined || value === null) return;

  if (Array.isArray(value)) {
    value.forEach((entry, index) => appendFormValue(params, `${key}[${index}]`, entry));
    return;
  }

  if (typeof value === 'object') {
    Object.entries(value).forEach(([childKey, childValue]) => {
      appendFormValue(params, key ? `${key}[${childKey}]` : childKey, childValue);
    });
    return;
  }

  params.append(key, String(value));
};

const toFormBody = (data) => {
  const params = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => appendFormValue(params, key, value));
  return params.toString();
};

const stripeRequest = async (endpoint, options = {}) => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error('Stripe is not configured on the server');

  const response = await fetch(`${STRIPE_API_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      ...(options.body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
      ...options.headers
    }
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || 'Stripe request failed');
  }

  return result;
};

const createCheckoutSession = async ({ orderId, amount, items, customer, successUrl, cancelUrl }) => {
  const currency = (process.env.STRIPE_CURRENCY || 'usd').toLowerCase();
  const expectedAmount = Math.round(amount * 100);
  const lineItemsAmount = items.reduce((total, item) => total + Math.round(item.price * 100) * item.quantity, 0);
  if (!Number.isSafeInteger(expectedAmount) || expectedAmount !== lineItemsAmount) {
    throw new Error('Stripe Checkout line items do not match the order total');
  }

  const lineItems = items.map((item, index) => ({
    quantity: item.quantity,
    price_data: {
      currency,
      unit_amount: Math.round(item.price * 100),
      product_data: {
        name: item.name,
        metadata: { order_item_index: index }
      }
    }
  }));

  return stripeRequest('/checkout/sessions', {
    method: 'POST',
    body: toFormBody({
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customer.email,
      client_reference_id: String(orderId),
      'metadata[orderId]': String(orderId),
      line_items: lineItems
    })
  });
};

const retrieveCheckoutSession = async (sessionId) => {
  if (!/^cs_(test|live)_/.test(sessionId || '')) {
    throw new Error('Invalid Stripe Checkout session ID');
  }
  return stripeRequest(`/checkout/sessions/${encodeURIComponent(sessionId)}`);
};

const verifyWebhookSignature = (rawBody, signatureHeader) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || !Buffer.isBuffer(rawBody) || !signatureHeader) return false;

  const signatureParts = signatureHeader.split(',').map((part) => {
    const separator = part.indexOf('=');
    return separator < 0 ? ['', ''] : [part.slice(0, separator), part.slice(separator + 1)];
  });
  const timestamp = signatureParts.find(([key]) => key === 't')?.[1];
  const signatures = signatureParts.filter(([key]) => key === 'v1').map(([, value]) => value);
  if (!timestamp || !/^\d+$/.test(timestamp) || !signatures.length
    || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const expected = crypto
    .createHmac('sha256', webhookSecret)
    .update(`${timestamp}.${rawBody.toString('utf8')}`)
    .digest();
  return signatures.some((signature) => {
    const provided = Buffer.from(signature, 'hex');
    return provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
  });
};

module.exports = {
  createCheckoutSession,
  retrieveCheckoutSession,
  verifyWebhookSignature
};