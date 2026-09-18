import express from "express";
import { generateFinancialInsight } from "../services/aiService.js";

const router = express.Router();

router.post("/insights", async (req, res) => {
  try {
    const financialData = req.body;

    const insight = await generateFinancialInsight(financialData);

    res.json({
      success: true,
      insight,
    });
  } catch (error) {
    console.error("AI Insight Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate AI insight",
    });
  }
});

export default router;