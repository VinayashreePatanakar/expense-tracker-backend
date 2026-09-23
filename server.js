import "dotenv/config";
import dns from "dns";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import transactionsRouter from "./routers/transactions.js";
import authRoutes from "./routers/auth.js";
import userRoutes from "./routers/users.js";
import dotenv from "dotenv";
import budgetsRouter from "./routers/budgets.js";
import aiRouter from "./routers/ai.js";
import fs from "fs";

dotenv.config();

// Use public DNS servers only when explicitly requested. Some hosting providers
// block outbound DNS requests, while their platform DNS resolver works normally.
if (process.env.USE_PUBLIC_DNS === "true") {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

mongoose.set("bufferCommands", false);

const app = express();
const PORT = process.env.PORT || 5000;

// ================= MIDDLEWARE =================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://jazzy-medovik-bc0f68.netlify.app",
  "https://expense-tracker-vinaya.netlify.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// ================= ROUTES =================

app.use("/api/transactions", transactionsRouter);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/budgets", budgetsRouter);

// ================= UPLOADS =================

const uploadDir = "uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use("/uploads", express.static("uploads"));

// ================= AI =================

app.use("/api/ai", aiRouter);

// ================= MONGODB =================

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/expense_tracker";

if (process.env.NODE_ENV === "production" && !process.env.MONGO_URI) {
  throw new Error("MONGO_URI must be configured in production");
}

console.log(
  "MongoDB connection:",
  MONGO_URI.replace(
    /(mongodb\+srv:\/\/[^:]+:)[^@]+@/,
    "$1********@"
  )
);

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("✅ MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);
    process.exit(1);
  }
};

startServer();