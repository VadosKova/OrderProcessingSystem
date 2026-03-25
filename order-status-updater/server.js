require("dotenv").config();
const mongoose = require("mongoose");
const connectRabbit = require("./shared/rabbit");

const Order = mongoose.model(
  "Order",
  new mongoose.Schema({ status: String })
);

mongoose.connect(process.env.MONGO_URI_ORDER);

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

async function waitForRabbit() {
  let connected = false;
  let ch;

  while (!connected) {
    try {
      ch = await connectRabbit();
      connected = true;
      console.log("RabbitMQ connected");
    } catch (err) {
      console.log("Waiting for RabbitMQ");
      await new Promise(res => setTimeout(res, 2000));
    }
  }

  return ch;
}

async function start() {
  await waitForMongo();
  const channel = await waitForRabbit();

  const queue = "status_queue";
  const processed = new Set();

  await channel.assertQueue(queue);
  await channel.bindQueue(queue, process.env.EXCHANGE_NAME, "payment.*");

  channel.consume(queue, async (msg) => {
    const { orderId } = JSON.parse(msg.content.toString());

    if (processed.has(orderId)) {
      return channel.ack(msg);
    }

    const status =
      msg.fields.routingKey === "payment.success"
        ? "PAID"
        : "CANCELLED";

    await Order.findByIdAndUpdate(orderId, { status });

    processed.add(orderId);

    console.log("Order updated:", orderId, status);

    channel.ack(msg);
  });
}

start();