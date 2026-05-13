import { callWithFallback } from "./_providers.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { question, results } = req.body || {};
    if (!question) return res.status(400).json({ error: "Missing question" });

    const prompt = `You are a friendly startup advisor. A user analyzed their website idea and received these results:

${JSON.stringify(results, null, 2)}

The user asks: "${question}"

Answer in plain, friendly English. Keep it short, 2-4 sentences max. No jargon.`;

    const { text, provider } = await callWithFallback(prompt);
    return res.status(200).json({ answer: text, provider_used: provider });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Something went wrong" });
  }
}
