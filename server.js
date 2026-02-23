const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const transactionsRouter = require("./routers/transactions"); // path to router
const authRoutes = require("./routers/auth");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Register router
app.use("/api/transactions", transactionsRouter);
app.use("/api/auth", authRoutes);

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/expense_tracker";

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Failed", err));

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));