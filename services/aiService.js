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

Analyze and explain the financial data provided below.

IMPORTANT RULES:
- Use ONLY the provided financial data.
- Never invent or modify numbers.
- Positive amounts are income.
- Negative amounts are expenses.
- Do not treat income as an expense.
- Use highestExpenseCategory and highestExpenseAmount for the highest expense.
- Use highestExpensePercentage exactly as provided.
- Use categoryPercentages exactly as provided.
- Do not calculate percentages yourself.
- Do not determine the highest expense from recentTransactions.
- Do not give investment advice.
- Do not make predictions.
- Do not give generic financial advice.
- Keep the response concise and easy to understand.
- Do not include the raw JSON data in your response.
- Do not add a Note section.
- Do not add disclaimers.
- Do not add recommendations.

Return EXACTLY this structure:

Key Findings:

• Remaining Balance: [remainingBalance]

• Highest/Notable Expense: [highestExpenseCategory] — [highestExpenseAmount]

• Spending Pattern: [highestExpenseCategory] accounts for [highestExpensePercentage]% of total expenses.

Summary:
[One short sentence describing total income, total expenses, transaction count, and remaining balance.]

Financial data:
${JSON.stringify(financialData, null, 2)}
`;

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,

    messages: [
      {
        role: "system",
        content:
          "You are a precise financial analysis assistant. Follow the user's requested output format exactly.",
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
}

