import express from "express";
import Transaction from "../models/Transaction.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// GET all transactions for logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id });
    res.json(transactions);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST new transaction for logged-in user
router.post("/", auth, async (req, res) => {
  try {
    const newTransaction = new Transaction({
      ...req.body,
      user: req.user.id,
    });

    const saved = await newTransaction.save();
    res.json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE transaction (owner only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) return res.status(404).json({ message: "Not found" });

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE transaction (owner only)
router.put("/:id", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );

    if (!transaction) return res.status(404).json({ message: "Not found" });

    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;