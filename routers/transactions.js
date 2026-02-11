const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction"); 


// GET all transactions
router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new transaction
router.post("/", async (req, res) => {
  const { text, amount } = req.body;
  const transaction = new Transaction({ text, amount });

  try {
    const newTransaction = await transaction.save();
    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE transaction by ID
router.delete("/:id", async (req, res) => {
  console.log("DELETE request received for ID:", req.params.id);
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
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { text: req.body.text, amount: req.body.amount },
      { new: true } // return updated document
    );
    if (!updatedTransaction)
      return res.status(404).json({ message: "Transaction not found" });
    res.json(updatedTransaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;