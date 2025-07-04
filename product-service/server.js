// server.js

const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const setupSwagger = require('./config/swagger'); // ✅ Import function instead of raw spec

dotenv.config();

const app = express();

app.use(express.json());
app.use(morgan('dev'));

// Connect DB
connectDB();

// Swagger UI + /swagger.json
setupSwagger(app);

// Routes
app.use('/products', productRoutes);

app.get('/', (req, res) => {
  res.send('✅ Product Service is up. Visit /api-docs for API docs.');
});

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`[🚀] Product Service running on port ${PORT}`);
});
