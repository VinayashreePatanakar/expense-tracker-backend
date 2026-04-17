import express from "express";
import User from "../models/User.js";
import upload from "../middleware/upload.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};

// GET user by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("UPDATE ERROR:", err); // 👈 ADD THIS
    res.status(500).json({ message: err.message });
  }
});

// CHANGE PASSWORD
router.put("/change-password/:id", async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // ✅ check inputs
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findById(req.params.id);

    // ✅ check user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔥 IMPORTANT FIX
    if (!user.password) {
      return res.status(500).json({ message: "User password missing in DB" });
    }

    console.log("oldPassword:", oldPassword);
    console.log("user.password:", user.password);

    // ✅ compare password
    /*const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Old password incorrect" });
    }*/

      // TEMP BYPASS (DEV ONLY)
console.log("Skipping old password check");

    // ✅ hash new password
    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.log("CHANGE PASSWORD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", verifyToken, upload.single("profilePic"), async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    console.log("BODY:", req.body); // 🔥 DEBUG
    console.log("FILE:", req.file);

    const updatedData = {
      name: req.body.name,
      email: req.body.email,
      currency: req.body.currency,
    };

    if (req.file) {
      updatedData.profilePic = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json(user);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});

// POST /api/users/verify-password
router.post("/verify-password", async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ message: "Missing data" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;