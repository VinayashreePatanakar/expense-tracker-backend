const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");

// GET all transactions (optionally filter by date)
router.get("/", async (req, res) => {
  try {
    const { date } = req.query;

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);

      const transactions = await Transaction.find({
        date: { $gte: start, $lt: end },
      });
      return res.json(transactions);
    }

    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new transaction
router.post("/", async (req, res) => {
  const { text, amount, date, category } = req.body; // ✅ category included
  const transaction = new Transaction({
    text,
    amount,
    date,
    category, // default if not sent
  });

  try {
    const newTransaction = await transaction.save();
    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE transaction by ID
router.delete("/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    res.status(200).json({ message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/transactions/:id
router.put("/:id", async (req, res) => {
  try {
    const { text, amount, category, date } = req.body; // ✅ include category
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { text, amount, category: category || "General", date: date || new Date() },
      { new: true }
    );
    if (!updatedTransaction)
      return res.status(404).json({ message: "Transaction not found" });
    res.json(updatedTransaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
