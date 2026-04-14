import mongoose from "mongoose";

const BudgetSchema = new mongoose.Schema({
  month: {
    type: String, // "2026-04" OR "default"
    required: true,
  },

  totalBudget: {
    type: Number,
    default: 0,
  },

  categories: {
    type: Object, // { Food: 1000, Travel: 2000 }
    default: {},
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true });

export default mongoose.model("Budget", BudgetSchema);