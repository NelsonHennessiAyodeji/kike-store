const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const supabase = createClient(
  process.env.SUPABASE_PROJECT_URL,
  process.env.SUPABASE_KEY
);

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE = 'https://api.paystack.co';

class PaymentService {
  static async initializeTransaction(email, amount, metadata = {}) {
    try {
      const response = await axios.post(
        `${PAYSTACK_BASE}/transaction/initialize`,
        {
          email,
          amount: Math.round(amount * 100), // convert to kobo
          metadata,
          callback_url: `${process.env.BASE_URL}/payment/callback`,
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Paystack init error:', error.response?.data || error.message);
      throw new Error('Payment initialization failed');
    }
  }

  static async verifyTransaction(reference) {
    try {
      const response = await axios.get(
        `${PAYSTACK_BASE}/transaction/verify/${reference}`,
        {
          headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Paystack verify error:', error.response?.data || error.message);
      throw new Error('Payment verification failed');
    }
  }

  static async createOrder(orderData) {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async updateOrderStatus(reference, status, transactionData = null) {
    const updateData = { payment_status: status, updated_at: new Date().toISOString() };
    if (transactionData) {
      updateData.transaction_data = transactionData; // optional, store full response
    }
    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('payment_reference', reference)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async getOrderByReference(reference) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('payment_reference', reference)
      .single();
    if (error) throw error;
    return data;
  }
}

module.exports = PaymentService;