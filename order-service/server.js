require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const connectRabbit = require("../shared/rabbit");
const Order = require("./models/Order");

const app = express();
app.use(express.json());

let channel;

async function waitForMongo() {
  let connected = false;
  while (!connected) {
    try {
      await mongoose.connect(process.env.MONGO_URI_ORDER, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      connected = true;
      console.log("MongoDB connected");
    } catch (err) {
      console.log("Waiting for MongoDB");
      await new Promise((res) => setTimeout(res, 2000));
    }
  }
}

async function waitForRabbit() {
  let ch;
  let connected = false;
  while (!connected) {
    try {
      ch = await connectRabbit();
      connected = true;
      console.log("RabbitMQ connected");
    } catch (err) {
      console.log("Waiting for RabbitMQ");
      await new Promise((res) => setTimeout(res, 2000));
    }
  }
  return ch;
}

async function start() {
  await waitForMongo();
  channel = await waitForRabbit();

  app.post("/orders", async (req, res) => {
    const order = await Order.create({ status: "NEW" });

    channel.publish(
      process.env.EXCHANGE_NAME,
      "order.created",
      Buffer.from(JSON.stringify({ orderId: order._id }))
    );

    res.json(order);
  });

  app.get("/orders/:id", async (req, res) => {
    const order = await Order.findById(req.params.id);
    res.json(order);
  });

  app.listen(3000, () => console.log("Order Service running"));
}

start();