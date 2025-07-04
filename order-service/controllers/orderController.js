const { publishToQueue } = require('../config/rabbitmq');
const axios = require('axios');
const pool = require('../config/db');


exports.createOrder = async (req, res) => {
  try {
    const { productId, quantity, price, shippingAddress } = req.body;

    // ✅ Get userId from decoded JWT
    const userId = req.user._id;

    if (!productId || !quantity || !price || !shippingAddress) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // ✅ Verify product
    const productServiceURL = `http://localhost:3002/products/${productId}`;
    let product;
    try {
      const response = await axios.get(productServiceURL);
      product = response.data;
    } catch (err) {
      console.error('[❌] Axios error:', err.message);
      console.error('[❌] Axios config:', err.config);
      if (err.response) {
        console.error('[❌] Axios response:', err.response.data);
      }
      return res.status(404).json({ message: 'Product not found' });
    }


    // ✅ Insert order
    const result = await pool.query(
      'INSERT INTO orders (user_id, product_id, quantity, shipping_address, price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, productId, quantity, shippingAddress, price]
    );

    const order = result.rows[0];

    // ✅ Prepare payload
    const payload = {
      orderId: order.id,
      userId: order.user_id,
      email: req.user.email,
      productId: order.product_id,
      quantity: order.quantity,
      status: order.status,
    };

    // ✅ Print to console
    console.log('Publishing order_created event with payload:', payload);

    // ✅ Publish event
    publishToQueue('order_created', payload);

    res.status(201).json({ order });

  } catch (err) {
    console.error('[❌] Error creating order:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
