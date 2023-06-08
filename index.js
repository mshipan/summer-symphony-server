const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// basic setup
app.get("/", (req, res) => {
  res.send("Summer Symphony Server is Running");
});

app.listen(port, () => {
  console.log(`Summer Symphony Server is Running on Port: ${port}`);
});
