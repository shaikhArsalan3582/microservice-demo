// controllers/productController.js

const Product = require('../models/Product');

// Existing getProductById...
async function getProductById(req, res) {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error('[❌] Error fetching product:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ✅ NEW: Add Product
async function addProduct(req, res) {
  try {
    const { name, price, stock, description, category } = req.body;

    // Simple validation
    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required.' });
    }

    const newProduct = new Product({
      name,
      price,
      stock: stock || 0,
      description,
      category,
    });

    const savedProduct = await newProduct.save();

    res.status(201).json(savedProduct);
  } catch (err) {
    console.error('[❌] Error adding product:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  getProductById,
  addProduct,
};
