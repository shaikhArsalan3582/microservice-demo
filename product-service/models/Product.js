// models/Product.js
const mongoose = require('mongoose');

// Define Product schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
  },
});

// Export Product model
module.exports = mongoose.model('Product', productSchema);
