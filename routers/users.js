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
router.put("/change-password/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) return res.status(403).json({ message: "Unauthorized" });

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ message: "Current password is incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("UPDATE ERROR:", err); // 👈 ADD THIS
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


export default router;