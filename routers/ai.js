import express from "express";
import auth from "../middleware/auth.js";
import { generateFinancialInsight, askFinancialQuestion } from "../services/aiService.js";

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

router.post("/ask", auth, async (req, res) => {
  try {
    const { question, financialData } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    if (!financialData) {
      return res.status(400).json({
        success: false,
        message: "Financial data is required",
      });
    }

    console.log("🤖 AI financial question received");

    const answer = await askFinancialQuestion(
      question,
      financialData
    );

    console.log("✅ AI financial question answered");

    res.json({
      success: true,
      answer,
    });
  } catch (error) {
    console.error("❌ AI Question Error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to answer question",
    });
  }
});

export default router;