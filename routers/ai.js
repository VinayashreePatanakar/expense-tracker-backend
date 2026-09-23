import express from "express";
import auth from "../middleware/auth.js";
import { generateFinancialInsight } from "../services/aiService.js";

const router = express.Router();

router.post("/insights", auth, async (req, res) => {
  try {
    const financialData = req.body;
    console.log("🤖 AI request received");

    const insight = await generateFinancialInsight(financialData);
    console.log("✅ AI insight generated");

    res.json({
      success: true,
      insight,
    });
  } catch (error) {
    console.error("❌ AI Insight Error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate AI insight",
    });
  }
});

export default router;