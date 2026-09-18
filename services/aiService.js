const OLLAMA_URL = "http://localhost:11434/api/generate";
const OLLAMA_MODEL = "llama3.2";

export async function generateFinancialInsight(financialData) {
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

  const response = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Ollama API error: ${response.status} ${errorText}`
    );
  }

  const data = await response.json();

  return data.response;
}