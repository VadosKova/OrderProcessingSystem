require("dotenv").config();
const connectRabbit = require("../shared/rabbit");

async function start() {
  const channel = await connectRabbit();

  const queue = "payment_queue";

  await channel.assertQueue(queue);
  await channel.bindQueue(queue, process.env.EXCHANGE_NAME, "order.created");

  channel.consume(queue, (msg) => {
    const { orderId } = JSON.parse(msg.content.toString());

    const success = Math.random() > 0.5;
    const event = success ? "payment.success" : "payment.failed";

    console.log("Payment:", event, orderId);

    channel.publish(
      process.env.EXCHANGE_NAME,
      event,
      Buffer.from(JSON.stringify({ orderId }))
    );

    channel.ack(msg);
  });
}

start();