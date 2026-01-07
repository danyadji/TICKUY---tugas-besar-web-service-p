const midtransClient = require('midtrans-client');

class MidtransService {
  constructor() {
    this.snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY
    });
  }

  async createTransaction(orderData) {
    try {
      const { order_number, gross_amount, customer_details, item_details } = orderData;

      console.log('🔑 Midtrans Config:', {
        isProduction: process.env.MIDTRANS_IS_PRODUCTION,
        serverKey: process.env.MIDTRANS_SERVER_KEY ? '✅ Set' : '❌ Missing',
        clientKey: process.env.MIDTRANS_CLIENT_KEY ? '✅ Set' : '❌ Missing'
      });

      const parameter = {
        transaction_details: {
          order_id: order_number,
          gross_amount: gross_amount
        },
        customer_details: customer_details,
        item_details: item_details,
        enabled_payments: ['gopay', 'shopeepay', 'bank_transfer', 'echannel', 'qris', 'credit_card']
      };

      console.log('📦 Creating Midtrans transaction:', parameter);

      const transaction = await this.snap.createTransaction(parameter);
      
      console.log('✅ Midtrans transaction created:', transaction);
      
      return {
        snap_token: transaction.token,
        snap_redirect_url: transaction.redirect_url
      };
    } catch (error) {
      throw error;
    }
  }

  verifySignature(data) {
    const crypto = require('crypto');
    const { order_id, status_code, gross_amount, signature_key } = data;
    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    const hash = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex');

    return hash === signature_key;
  }
}

module.exports = new MidtransService();
