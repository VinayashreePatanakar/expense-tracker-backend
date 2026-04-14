import express from "express";
import Budget from "../models/Budget.js";
import auth from "../middleware/auth.js";

const router = express.Router();


// ✅ GET budget
router.get("/", auth, async (req, res) => {
  try {
    const { month } = req.query;

    const budget = await Budget.findOne({
      user: req.user.id,
      month,
    });

    if (!budget) {
      return res.json({
        totalBudget: 0,
        categories: {},
      });
    }

    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ SAVE budget
router.post("/", auth, async (req, res) => {
  try {
    const { month, totalBudget, categories } = req.body;

    const updated = await Budget.findOneAndUpdate(
      { user: req.user.id, month },
      { totalBudget, categories },
      { upsert: true, new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;