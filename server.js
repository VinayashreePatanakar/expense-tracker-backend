import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import transactionsRouter from "./routers/transactions.js";
import authRoutes from "./routers/auth.js";
import userRoutes from "./routers/users.js";
import dotenv from "dotenv";
import budgetsRouter from "./routers/budgets.js";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://jazzy-medovik-bc0f68.netlify.app",
  "https://expense-tracker-vinaya.netlify.app"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());

// Routes
app.use("/api/transactions", transactionsRouter);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use("/api/budgets", budgetsRouter);

const uploadDir = "uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use("/uploads", express.static("uploads"));

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/expense_tracker";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Failed", err));

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));