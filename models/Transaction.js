const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  text: { type: String, required: true },

  amount: { type: Number, required: true },

  date: {
    type: Date,
    default: Date.now,
  },

  category: {
    type: String,
    default: "General",
  },

  mode: {
    type: String,
    enum: ["cash", "debit", "credit", "swish"],
    default: "debit",
  },

  description: {
    type: String,
    default: "",
  },
},
{ timestamps: true } // 🔥 ADD THIS
 );

module.exports = mongoose.model("Transaction", TransactionSchema);