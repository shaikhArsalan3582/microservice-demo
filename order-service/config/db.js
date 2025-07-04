const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.PG_URI, // store full connection string in .env
});




pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL');
});

module.exports = pool;
