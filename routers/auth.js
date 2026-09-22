// routers/auth.js
import express from "express";
import User from "../models/User.js"; // make sure .js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const router = express.Router();

const createToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const publicUser = (user) => {
  const userData = user.toObject ? user.toObject() : { ...user };
  delete userData.password;
  return userData;
};

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashed });
    const saved = await newUser.save();

    const token = createToken(saved._id);

    res.json({ user: publicUser(saved), token });
  } catch (err) {
    const status = mongoose.connection.readyState === 1 ? 500 : 503;
    res.status(status).json({ message: status === 503 ? "Database unavailable" : err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = createToken(user._id);

    res.json({ user: publicUser(user), token });
  } catch (err) {
    const status = mongoose.connection.readyState === 1 ? 500 : 503;
    res.status(status).json({ message: status === 503 ? "Database unavailable" : err.message });
  }
});

export default router; // ✅ This is what you need!