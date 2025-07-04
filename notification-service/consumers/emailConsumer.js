const amqp = require('amqplib'); // RabbitMQ client
const { sendEmail } = require('../mailer/mailer'); // Function to send emails
const logger = require('../utils/logger'); // Logger utility

const queue = 'order_created'; // Queue name to listen on

/**
 * Starts the RabbitMQ consumer to listen for order_created messages.
 */
async function startConsumer() {
  try {
    // Connect to RabbitMQ using the provided URL
    const connection = await amqp.connect(process.env.RABBITMQ_URL);

    // Create a channel over the connection
    const channel = await connection.createChannel();

    // Ensure the queue exists; durable = true makes it survive broker restarts
    await channel.assertQueue(queue, { durable: true });

    logger.info(`[x] Waiting for messages in ${queue}...`);

    // Set up consumer to receive messages from the queue
    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        try {
          // Parse message content into JSON
          const payload = JSON.parse(msg.content.toString());
          logger.info(`Received message to send email: ${JSON.stringify(payload)}`);

          const { email, orderId, productId, quantity, status } = payload;

          // Compose email details
          const emailPayload = {
            to: email,
            subject: `Order placed - #${orderId}`,
            template: 'order', // Email template name (e.g., order.hbs)
            context: {
              orderId,
              productId,
              quantity,
              status,
            },
          };

          // Send email and acknowledge message
          await sendEmail(emailPayload);
          channel.ack(msg); // Acknowledge successful processing
          logger.info(`✅ Email processed and acknowledged`);
        } catch (err) {
          logger.error(`Failed to process message: ${err.message}`, { stack: err.stack });
          // Do not acknowledge so it can be retried or handled later
        }
      }
    });
  } catch (err) {
    logger.error(`Consumer failed to start: ${err.message}`, { stack: err.stack });
    process.exit(1); // Exit process on startup failure
  }
}

module.exports = { startConsumer };
