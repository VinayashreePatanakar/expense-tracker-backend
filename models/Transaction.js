const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  amount: { type: Number, required: true },
  date: {
    type: Date,
    default: Date.now, // if not provided → today
  },
}, { timestamps: true });

module.exports = mongoose.model("Transaction", TransactionSchema);