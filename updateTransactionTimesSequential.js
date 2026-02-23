require("dotenv").config();
const mongoose = require("mongoose");
const Transaction = require("./models/Transaction"); // adjust path

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/expense_tracker";

async function updateTransactionTimes() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");

    const allTransactions = await Transaction.find({}).sort({ _id: 1 });

    // Group by date
    const grouped = {};
    allTransactions.forEach((t) => {
      const dateObj = new Date(t.date); // <-- ensures Date object
      const dateKey = dateObj.toISOString().split("T")[0];
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(t);
    });

    // Assign sequential times
    for (const dateKey in grouped) {
      const items = grouped[dateKey];
      const total = items.length;

      items.forEach((t, index) => {
        const newDate = new Date(dateKey);
        // Spread items evenly across the day
        const hour = Math.floor((index / total) * 24);
        const minute = Math.floor(((index / total) * 1440) % 60);
        const second = Math.floor(((index / total) * 86400) % 60);

        newDate.setHours(hour, minute, second);

        t.date = newDate; // <-- store as Date object
      });

      // Bulk update
      const bulkOps = items.map((t) => ({
        updateOne: {
          filter: { _id: t._id },
          update: { date: t.date },
        },
      }));

      await Transaction.bulkWrite(bulkOps);
    }

    console.log("✅ Transactions updated with sequential times.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error updating transactions:", err);
    process.exit(1);
  }
}

updateTransactionTimes();