import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import transactionsRouter from "./routers/transactions.js";
import authRoutes from "./routers/auth.js";
import usersRouter from "./routers/users.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/transactions", transactionsRouter);
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRouter);

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/expense_tracker";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Failed", err));

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));