require("dotenv").config();
const connectRabbit = require("../shared/rabbit");

async function start() {
  const channel = await connectRabbit();

  const queue = "notification_queue";

  await channel.assertQueue(queue);
  await channel.bindQueue(queue, process.env.EXCHANGE_NAME, "payment.*");

  channel.consume(queue, (msg) => {
    console.log("NOTIFICATION:", msg.content.toString());
    channel.ack(msg);
  });
}

start();