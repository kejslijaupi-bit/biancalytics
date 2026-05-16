import { callWithFallback } from "./_providers.js";

export default async function handler(req, res) {
  try {
    const { question, results, originalInput } = req.body || {};

    if (!question) {
      return res.status(400).json({ error: "Missing question" });
    }

    const prompt = `
You are a startup idea analysis assistant.

The user analyzed this website/startup idea:

${originalInput || "Unknown"}

Analysis results:
${JSON.stringify(results, null, 2)}

User question:
"${question}"

Your job:
- Answer ONLY using the context above.
- Stay focused on the analyzed website/startup.
- Do not invent unrelated industries or products.
- If the question is unclear, politely ask for clarification.
- Keep answers short and useful.
- Speak naturally like a smart startup advisor.

Examples:
If the user asks:
"Is any of them free?"
You should answer:
"Yes, X and Y offer free plans."

If the user asks:
"Which one is most similar?"
Compare ONLY the competitors in the analysis.

If the user asks something vague like:
"is correlation free"
and there is no context for "correlation",
ask:
"Do you mean Correlation-One, the company mentioned earlier?"

Return plain text only.
`;

    const response = await callWithFallback(prompt);

    return res.status(200).json({
      answer: response.text,
      provider: response.provider
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message || "Something went wrong"
    });
  }
}
