const mysql = require('mysql2/promise');
const QRCode = require('qrcode');

async function simulatePayment(orderId) {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tickuy_order_db'
  });

  try {
    console.log(`\n🔄 Simulating payment for order ID: ${orderId}\n`);

    // Update order status
    await conn.query('UPDATE orders SET status = ? WHERE id = ?', ['PAID', orderId]);
    await conn.query('UPDATE payments SET status = ?, paid_at = NOW() WHERE order_id = ?', ['settlement', orderId]);
    console.log('✅ Order updated to PAID');

    // Get order details
    const [orders] = await conn.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    const order = orders[0];

    if (!order) {
      console.log('❌ Order not found!');
      return;
    }

    console.log(`📦 Order: ${order.order_number}`);
    console.log(`🎫 Generating ${order.quantity} tickets...\n`);

    // Generate tickets
    for (let i = 1; i <= order.quantity; i++) {
      const ticket_number = `TKT-EVENT${order.event_id}-CAT${order.ticket_category_id}-${String(i).padStart(5, '0')}`;
      
      // Insert ticket
      const [result] = await conn.query(
        'INSERT INTO tickets (ticket_number, order_id, event_id, ticket_category_id, qr_code_data, status) VALUES (?, ?, ?, ?, ?, ?)',
        [ticket_number, order.id, order.event_id, order.ticket_category_id, '', 'ACTIVE']
      );

      const ticketId = result.insertId;

      // Generate QR Code
      const qrData = JSON.stringify({
        ticket_id: ticketId,
        ticket_number: ticket_number,
        event_id: order.event_id
      });
      const qrCode = await QRCode.toDataURL(qrData);

      // Update QR code
      await conn.query('UPDATE tickets SET qr_code_data = ? WHERE id = ?', [qrCode, ticketId]);

      console.log(`✅ Created ticket: ${ticket_number} (ID: ${ticketId})`);
    }

    // Show results
    console.log('\n📊 Final Results:');
    const [tickets] = await conn.query('SELECT id, ticket_number, status FROM tickets WHERE order_id = ?', [orderId]);
    console.table(tickets);

    console.log('\n✅ Payment simulation completed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await conn.end();
  }
}

// Get order ID from command line argument
const orderId = process.argv[2] || 9;
simulatePayment(orderId);
