const express = require('express');
const morgan = require('morgan');
require('dotenv').config();

const setupSwagger = require('./config/swagger'); // Import the function
const orderRoutes = require('./routes/orderRoutes');
const pool = require('./config/db');  // PostgreSQL pool
const { connectRabbitMQ } = require('./config/rabbitmq');  // RabbitMQ connection

const app = express();

app.use(morgan('dev'));
app.use(express.json());

// Setup swagger middleware and expose /swagger.json
setupSwagger(app);

app.use('/orders', orderRoutes);

app.get('/', (req, res) => {
  res.send('✅ Order Service is up. Visit /api-docs for API docs.');
});

const PORT = process.env.PORT || 3003;

const init = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL');

    await connectRabbitMQ();
    console.log('✅ Connected to RabbitMQ');

    console.log(`🚀 Order Service running on port ${PORT}`);
    console.log(`[📚] Swagger docs available at http://localhost:${PORT}/api-docs`);
  } catch (err) {
    console.error('[❌] Startup error:', err);
    process.exit(1);
  }
};

app.listen(PORT, () => {
  init();
});
