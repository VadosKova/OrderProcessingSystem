require("dotenv").config();
const connectRabbit = require("../shared/rabbit");

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

  const queue = "notification_queue";

  await channel.assertQueue(queue);
  await channel.bindQueue(queue, process.env.EXCHANGE_NAME, "payment.*");

  channel.consume(queue, (msg) => {
    console.log("NOTIFICATION:", msg.content.toString());
    channel.ack(msg);
  });
}

start();