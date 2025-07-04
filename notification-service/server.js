require('dotenv').config();
const { startConsumer } = require('./consumers/emailConsumer');

startConsumer();