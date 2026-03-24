const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  status: String,
});

module.exports = mongoose.model("Order", OrderSchema);