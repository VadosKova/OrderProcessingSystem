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