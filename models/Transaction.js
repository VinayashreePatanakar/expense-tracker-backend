import mongoose from "mongoose";

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

  // ✅ ADD THIS
  user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,
},
},
{ timestamps: true } // 🔥 ADD THIS
 );

export default mongoose.model("Transaction", TransactionSchema);