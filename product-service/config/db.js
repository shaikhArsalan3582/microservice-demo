// config/db.js
const mongoose = require('mongoose');
require('dotenv').config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[✔] MongoDB Connected!');
  } catch (err) {
    console.error('[❌] MongoDB connection failed:', err);
    process.exit(1);
  }
}

module.exports = connectDB;
