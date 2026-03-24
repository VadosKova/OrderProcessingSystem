require("dotenv").config();
const mongoose = require("mongoose");
const connectRabbit = require("../shared/rabbit");

const Order = mongoose.model(
  "Order",
  new mongoose.Schema({ status: String })
);

mongoose.connect(process.env.MONGO_URI_ORDER);