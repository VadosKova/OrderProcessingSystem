const amqp = require("amqplib");

async function connectRabbit() {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await connection.createChannel();

  const exchange = process.env.EXCHANGE_NAME;

  await channel.assertExchange(exchange, "topic", { durable: true });

  await channel.assertExchange("dlq", "fanout", { durable: true });

  await channel.assertQueue("dead_letter_queue", { durable: true });
  await channel.bindQueue("dead_letter_queue", "dlq", "");

  return channel;
}

module.exports = connectRabbit;