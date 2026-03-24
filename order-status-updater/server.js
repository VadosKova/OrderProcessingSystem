require("dotenv").config();
const mongoose = require("mongoose");
const connectRabbit = require("../shared/rabbit");

const Order = mongoose.model(
  "Order",
  new mongoose.Schema({ status: String })
);

mongoose.connect(process.env.MONGO_URI_ORDER);

async function start() {
  const channel = await connectRabbit();

  const queue = "status_queue";

  await channel.assertQueue(queue);
  await channel.bindQueue(queue, process.env.EXCHANGE_NAME, "payment.*");

  channel.consume(queue, async (msg) => {
    const { orderId } = JSON.parse(msg.content.toString());

    const status =
      msg.fields.routingKey === "payment.success"
        ? "PAID"
        : "CANCELLED";

    await Order.findByIdAndUpdate(orderId, { status });

    console.log("Order updated:", orderId, status);

    channel.ack(msg);
  });
}

start();