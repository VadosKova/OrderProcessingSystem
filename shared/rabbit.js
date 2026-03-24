const amqp = require("amqplib");

async function connectRabbit() {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertExchange(process.env.EXCHANGE_NAME, "topic", {
    durable: true,
  });

  return channel;
}

module.exports = connectRabbit;