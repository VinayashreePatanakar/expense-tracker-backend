const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  category: { type: String, default: "General" }, // ✅ Add category
});

module.exports = mongoose.model("Transaction", TransactionSchema);
