// src/payment/paymentController.js
const axios = require('axios');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_PROJECT_URL,
  process.env.SUPABASE_KEY
);

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE = 'https://api.paystack.co';

/**
 * Initialize Paystack transaction and create order
 */
exports.initiatePayment = async (req, res) => {
  try {
    const {
      email,
      fullName,
      phone,
      address: { street, city, state, country, postcode },
      cartItems,
      subtotal,
      shippingCost,
      total,
      notes,
    } = req.body;

    // Validate required fields
    if (!email || !fullName || !phone || !street || !city || !state || !country) {
      return res.status(400).json({ error: 'All shipping fields are required' });
    }
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate amount in kobo (Paystack uses smallest currency unit)
    const amountInKobo = Math.round(total * 100);

    // Generate a unique reference for this transaction
    const reference = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Build shipping address object
    const shippingAddress = { street, city, state, country, postcode: postcode || '' };

    // 1. Create order in Supabase with status 'pending'
    const orderData = {
      reference,
      user_email: email,
      full_name: fullName,
      phone,
      shipping_address: shippingAddress,
      items: cartItems, // array of { id, name, price, quantity, image }
      subtotal,
      shipping_cost: shippingCost,
      total_amount: total,
      status: 'pending',
      payment_reference: reference,
      notes: notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      console.error('Supabase order insert error:', orderError);
      return res.status(500).json({ error: 'Failed to create order' });
    }

    // 2. Initialize Paystack transaction
    const metadata = {
      order_reference: reference,
      custom_fields: [
        { display_name: 'Full Name', variable_name: 'full_name', value: fullName },
        { display_name: 'Phone', variable_name: 'phone', value: phone },
        { display_name: 'Address', variable_name: 'address', value: `${street}, ${city}, ${state}, ${country}` },
      ],
    };

    const payload = {
      email,
      amount: amountInKobo,
      reference,
      callback_url: `${process.env.BASE_URL}/payment/callback`,
      metadata,
    };

    const response = await axios.post(`${PAYSTACK_BASE}/transaction/initialize`, payload, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.data.status) {
      throw new Error(response.data.message || 'Paystack initialization failed');
    }

    // Return the authorization URL to frontend
    res.status(200).json({
      authorization_url: response.data.data.authorization_url,
      reference,
    });

  } catch (error) {
    console.error('Initiate payment error:', error.response?.data || error.message);
    res.status(500).json({ error: error.message || 'Payment initialization failed' });
  }
};

/**
 * Callback after payment – verify and update order
 */
exports.paymentCallback = async (req, res) => {
  const { reference } = req.query;

  if (!reference) {
    return res.status(400).send('Missing payment reference');
  }

  try {
    // Verify transaction
    const verify = await axios.get(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    });

    const data = verify.data.data;
    const status = data.status;

    // Update order in Supabase
    const { error } = await supabase
      .from('orders')
      .update({
        status: status === 'success' ? 'paid' : 'failed',
        payment_details: data,
        updated_at: new Date().toISOString(),
      })
      .eq('reference', reference);

    if (error) {
      console.error('Order update error:', error);
      return res.status(500).send('Failed to update order');
    }

    // Render success/failure page
    if (status === 'success') {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Payment Successful</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #28a745;">✅ Payment Successful</h1>
          <p>Your order has been placed. Reference: <strong>${reference}</strong></p>
          <p>We will send you a confirmation email shortly.</p>
          <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #4a6fa5; color: white; text-decoration: none; border-radius: 4px;">Continue Shopping</a>
        </body>
        </html>
      `);
    } else {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Payment Failed</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #dc3545;">❌ Payment Failed</h1>
          <p>Transaction status: <strong>${status}</strong></p>
          <p>Please try again or contact support.</p>
          <a href="/shoping-cart.html" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #4a6fa5; color: white; text-decoration: none; border-radius: 4px;">Return to Cart</a>
        </body>
        </html>
      `);
    }
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).send('Payment verification failed');
  }
};

/**
 * Webhook – handle charge.success events asynchronously
 */
exports.paymentWebhook = async (req, res) => {
  // Verify signature
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(401).end('Unauthorized');
  }

  const event = req.body;
  if (event.event === 'charge.success') {
    const data = event.data;
    const reference = data.reference;

    // Update order status to 'paid' if not already
    await supabase
      .from('orders')
      .update({
        status: 'paid',
        payment_details: data,
        updated_at: new Date().toISOString(),
      })
      .eq('reference', reference)
      .eq('status', 'pending'); // only update if still pending
  }

  res.sendStatus(200);
};