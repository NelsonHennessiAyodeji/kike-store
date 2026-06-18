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
 * Helper: render styled payment result page
 */
function renderPaymentResultPage(status, reference, message) {
  const isSuccess = status === 'success';
  const icon = isSuccess ? '✅' : '❌';
  const title = isSuccess ? 'Payment Successful' : 'Payment Failed';
  const color = isSuccess ? '#28a745' : '#dc3545';
  const btnLink = isSuccess ? '/' : '/shoping-cart.html';
  const btnText = isSuccess ? 'Continue Shopping' : 'Return to Cart';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Poppins', sans-serif;
      background: #f5f7fb;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 560px;
      width: 100%;
      background: #ffffff;
      border-radius: 16px;
      padding: 40px 35px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.08);
      text-align: center;
    }
    .logo {
      margin-bottom: 30px;
    }
    .logo img {
      max-height: 60px;
      width: auto;
    }
    .icon {
      font-size: 56px;
      margin-bottom: 20px;
    }
    h1 {
      font-family: 'Montserrat', sans-serif;
      font-size: 28px;
      font-weight: 700;
      color: ${color};
      margin-bottom: 12px;
    }
    p {
      color: #555;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 10px;
    }
    .reference {
      background: #f8f9fa;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      color: #333;
      word-break: break-all;
      margin: 20px 0;
      border: 1px solid #e9ecef;
    }
    .reference strong {
      font-weight: 600;
      color: #4a6fa5;
    }
    .btn {
      display: inline-block;
      margin-top: 25px;
      padding: 14px 40px;
      background: #4a6fa5;
      color: #fff;
      font-weight: 600;
      font-size: 16px;
      border-radius: 30px;
      text-decoration: none;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
    }
    .btn:hover {
      background: #3c5a8a;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(74,111,165,0.3);
    }
    .btn-secondary {
      background: #e9ecef;
      color: #333;
    }
    .btn-secondary:hover {
      background: #dde0e3;
      box-shadow: 0 6px 20px rgba(0,0,0,0.08);
    }
    .message-box {
      background: ${isSuccess ? '#f0faf0' : '#fdf0f0'};
      border-left: 4px solid ${color};
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
      text-align: left;
    }
    .message-box p {
      margin: 0;
      color: #333;
      font-size: 15px;
    }
    .footer {
      margin-top: 30px;
      font-size: 13px;
      color: #aaa;
      border-top: 1px solid #eee;
      padding-top: 20px;
    }
    @media (max-width: 480px) {
      .container { padding: 30px 20px; }
      h1 { font-size: 24px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Logo (use your actual logo path) -->
    <div class="logo">
      <img src="/images/Linaben/logo/Lina Ben Logo (secondary).png" alt="LinaBen" />
    </div>

    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>

    <div class="reference">
      <strong>Reference:</strong> ${reference}
    </div>

    <div class="message-box">
      <p>${isSuccess ? 'Your order has been confirmed. We’ll send you a confirmation email shortly.' : 'Please try again or contact support if the issue persists.'}</p>
    </div>

    <a href="${btnLink}" class="btn">${btnText}</a>

    <div class="footer">
      &copy; ${new Date().getFullYear()} LinaBen – All rights reserved.
    </div>
  </div>

  <script>
    // Clear cart on successful payment
    ${isSuccess ? `
    (function() {
      // Remove cart from localStorage
      localStorage.removeItem('shoppingCart');
      // Update cart badge if present (using your existing class)
      document.querySelectorAll('.icon-header-noti').forEach(el => {
        el.setAttribute('data-notify', '0');
      });
      // Optionally update any UI element that shows cart count
      console.log('🧹 Cart cleared after successful payment.');
    })();
    ` : ''}
  </script>
</body>
</html>
  `;
}

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

    const amountInKobo = Math.round(total * 100);
    const reference = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const shippingAddress = { street, city, state, country, postcode: postcode || '' };

    // 1. Create order in Supabase
    const orderData = {
      reference,
      user_email: email,
      full_name: fullName,
      phone,
      shipping_address: shippingAddress,
      items: cartItems,
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

    // 2. Initialize Paystack
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

    // Render styled page with cart clearing
    if (status === 'success') {
      res.send(renderPaymentResultPage(
        'success',
        reference,
        'Your order has been placed successfully.'
      ));
    } else {
      res.send(renderPaymentResultPage(
        'failed',
        reference,
        `Transaction status: ${status}. Please try again.`
      ));
    }
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).send('Payment verification failed');
  }
};

/**
 * Webhook – handle charge.success events
 */
exports.paymentWebhook = async (req, res) => {
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

    await supabase
      .from('orders')
      .update({
        status: 'paid',
        payment_details: data,
        updated_at: new Date().toISOString(),
      })
      .eq('reference', reference)
      .eq('status', 'pending');
  }

  res.sendStatus(200);
};