require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const connectRabbit = require("../shared/rabbit");
const Order = require("./models/Order");

const app = express();
app.use(express.json());

let channel;

mongoose.connect(process.env.MONGO_URI_ORDER);

connectRabbit().then((ch) => {
  channel = ch;
});

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