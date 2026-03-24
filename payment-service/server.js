require("dotenv").config();
const connectRabbit = require("../shared/rabbit");

const processedOrders = new Set();

async function waitForMongo() {
  const mongoose = require("mongoose");
  let connected = false;
  while (!connected) {
    try {
      await mongoose.connect(process.env.MONGO_URI_ORDER, { useNewUrlParser: true });
      connected = true;
      console.log("MongoDB connected");
    } catch (err) {
      console.log("Waiting for MongoDB");
      await new Promise(res => setTimeout(res, 2000));
    }
  }
}

async function start() {
  await waitForMongo();
  const channel = await connectRabbit();

  const queue = "payment_queue";

  await channel.assertQueue(queue, { durable: true, deadLetterExchange: "dlq" });
  await channel.bindQueue(queue, process.env.EXCHANGE_NAME, "order.created");

  channel.consume(queue, (msg) => {
    const data = JSON.parse(msg.content.toString());
    const { orderId, retries = 0 } = data;

    if (processedOrders.has(orderId)) {
      console.log("Duplicate ignored:", orderId);
      return channel.ack(msg);
    }

    if (success) {
      processedOrders.add(orderId);

      channel.publish(
        process.env.EXCHANGE_NAME,
        "payment.success",
        Buffer.from(JSON.stringify({ orderId }))
      );

      console.log("Payment success:", orderId);
      return channel.ack(msg);
    }

    if (retries < process.env.RETRY_COUNT) {
      console.log("Retry:", orderId, "attempt:", retries + 1);

      channel.publish(
        process.env.EXCHANGE_NAME,
        "order.created",
        Buffer.from(
          JSON.stringify({
            orderId,
            retries: retries + 1,
          })
        )
      );

      return channel.ack(msg);
    }

    console.log("Sent to DLQ:", orderId);

    channel.publish(
      "dlq",
      "",
      Buffer.from(JSON.stringify({ orderId }))
    );

    channel.ack(msg);
  });
}

start();