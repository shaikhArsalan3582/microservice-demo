const amqp = require('amqplib');

let channel, connection;

async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log('✅ Connected to RabbitMQ');
  } catch (err) {
    console.error('[❌] RabbitMQ connection error:', err);
  }
}

function publishToQueue(queueName, data) {
  channel.assertQueue(queueName, { durable: true });
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
}

module.exports = {
  connectRabbitMQ,
  publishToQueue,
};
