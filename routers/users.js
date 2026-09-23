import express from "express";
import User from "../models/User.js";
import upload from "../middleware/upload.js";
import bcrypt from "bcryptjs";
import auth from "../middleware/auth.js";

const router = express.Router();

// GET current user by ID
router.get("/:id", auth, async (req, res) => {
  try {
    // User can only access their own profile
    if (req.user.id !== req.params.id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (err) {
    console.error("GET USER ERROR:", err);

    res.status(500).json({
      message: "Failed to get user",
    });
  }
});


// CHANGE PASSWORD
router.put("/change-password/:id", auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (req.user.id !== req.params.id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Old password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters long",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(
      oldPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    user.password = hashedPassword;

    await user.save();

    res.json({
      message: "Password updated successfully",
    });

  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);

    res.status(500).json({
      message: "Failed to update password",
    });
  }
});

// UPDATE PROFILE
router.put(
  "/:id",
  auth,
  upload.single("profilePic"),
  async (req, res) => {
    try {
      // User can only update their own profile
      if (req.user.id !== req.params.id) {
        return res.status(403).json({
          message: "Unauthorized",
        });
      }

      const updatedData = {
        name: req.body.name,
        email: req.body.email,
        currency: req.body.currency,
      };

      // Only update profile picture when a new file is uploaded
      if (req.file) {
        updatedData.profilePic = `/uploads/${req.file.filename}`;
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        updatedData,
        {
          new: true,
          runValidators: true,
        }
      ).select("-password");

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      res.status(200).json(user);

    } catch (err) {
      console.error("UPDATE USER ERROR:", err);

      res.status(500).json({
        message: "Update failed",
      });
    }
  }
);


// POST /api/users/verify-password
router.post("/verify-password", auth, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    // Get user from authenticated JWT
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.password) {
      return res.status(500).json({
        message: "User password is missing",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Wrong password",
      });
    }

    res.json({
      success: true,
    });

  } catch (err) {
    console.error("VERIFY PASSWORD ERROR:", err);

    res.status(500).json({
      message: "Server error",
    });
  }
});


export default router;