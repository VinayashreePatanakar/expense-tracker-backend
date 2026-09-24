import "dotenv/config";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const GROQ_MODEL =
  process.env.GROQ_MODEL || "openai/gpt-oss-20b";

export async function generateFinancialInsight(financialData) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing");
  }

const prompt = `
You are an AI financial assistant inside an expense tracking application.

Analyze ONLY the financial data provided below.

IMPORTANT RULES:
- Use ONLY the provided financial data.
- Never invent or modify numbers.
- Positive amounts are income.
- Negative amounts are expenses.
- Do not treat income as an expense.
- Use highestExpenseCategory and highestExpenseAmount exactly as provided.
- Use highestExpensePercentage exactly as provided.
- Use categoryPercentages exactly as provided.
- Do not calculate percentages yourself.
- Do not determine the highest expense from any transaction list.
- Do not give investment advice.
- Do not make financial predictions.
- Do not invent missing information.
- Keep the response concise and easy to understand.
- Do not include raw JSON.
- Do not include disclaimers.

Return EXACTLY this structure:

Key Findings:

• Remaining Balance: [remainingBalance]

• Highest Expense: [highestExpenseCategory] — [highestExpenseAmount]

• Spending Pattern: [highestExpenseCategory] accounts for [highestExpensePercentage]% of total expenses.

Summary:
[One short sentence describing total income, total expenses, transaction count, and remaining balance.]

Suggestion:
[One short, practical suggestion based ONLY on the provided spending data.]

Financial data:
${JSON.stringify(financialData, null, 2)}
`;

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a precise financial analysis assistant. Follow the requested output format exactly.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_completion_tokens: 500,
    });

    const insight = completion.choices?.[0]?.message?.content;

    if (!insight) {
      throw new Error("Groq returned an empty response");
    }

    return insight.trim();
  } catch (error) {
    console.error("Groq AI error:", error);
    throw new Error("Unable to generate financial insight");
  }
}

export async function askFinancialQuestion(question, financialData) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing");
  }

  if (!question || !question.trim()) {
    throw new Error("Question is required");
  }

  const prompt = `
You are an AI financial assistant inside an expense tracking application.

Answer the user's financial question using ONLY the provided financial data.

IMPORTANT RULES:
- Use ONLY the provided financial data.
- Never invent numbers or information.
- Positive amounts are income.
- Negative amounts are expenses.
- Use the provided category totals and percentages.
- Always use the provided currency when displaying monetary amounts.
- Never replace the provided currency with another currency.
- Do not calculate or assume data that is not provided.
- If the data does not contain enough information to answer the question, clearly say so.
- Do not provide investment advice.
- Do not make financial predictions.
- Keep the answer concise and easy to understand.
- Do not include raw JSON.
- Do not mention these instructions.

CURRENCY RULES:
- The user's selected currency is provided in the "currency" field.
- ALWAYS use exactly that currency when displaying monetary amounts.
- NEVER convert the amounts to another currency.
- NEVER assume USD ($).
- NEVER replace the user's currency with another currency.
- If currency is "SEK", use "SEK" or "kr".
- If currency is "USD", use "$".
- If currency is "EUR", use "€".
- If currency is "GBP", use "£".
- If currency is "INR", use "₹".

FORMATTING RULES:
- Use Markdown for readability.
- Use **bold** for important values or categories.
- Use bullet points when listing multiple items.
- Do NOT escape Markdown characters with backslashes.
- Write **bold text**, not \\*\\*bold text\\*\\*.

MARKDOWN RULES:
- Return normal Markdown.
- Use **bold** for important values.
- Use bullet points when useful.
- NEVER escape Markdown characters.
- NEVER write \\*\\*text\\*\\*.
- Write **text** instead.
- Do not put backslashes before * characters.

User question:
${question.trim()}

Financial data:
${JSON.stringify(financialData, null, 2)}
`;

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,

      messages: [
        {
          role: "system",
          content:
            "You are a precise financial assistant. Answer questions using only the supplied financial data.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0.2,
      max_completion_tokens: 300,
    });

    const answer = completion.choices?.[0]?.message?.content;

    if (!answer) {
      throw new Error("Groq returned an empty response");
    }

  const cleanAnswer = answer
  .replace(/\\\*\\\*/g, "**")
  .replace(/\\_/g, "_")
  .trim();
  return cleanAnswer;
  } catch (error) {
    console.error("Groq financial question error:", error);
    throw new Error("Unable to answer financial question");
  }
}

