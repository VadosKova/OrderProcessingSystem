require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const ORDER_SERVICE_URL = "http://order-service:3000";

app.post("/orders", async (req, res) => {
  const response = await axios.post(
    `${ORDER_SERVICE_URL}/orders`,
    req.body
  );
  res.json(response.data);
});