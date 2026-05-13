import { callWithFallback, extractJson } from "./_providers.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { mode, value } = req.body || {};
    if (!value || !mode) return res.status(400).json({ error: "Missing mode or value" });

    const concept = mode === "idea"
      ? `The user described their website idea as: "${value}"`
      : `The user's website is at: ${value}`;

    const prompt = `${concept}

You are a friendly startup advisor helping non-technical people understand whether their website idea already exists online.

Return ONLY valid JSON in this exact format:
{
  "similar": [
    {"name": "<site name>", "description": "<one sentence what it does>", "similarity": "<Very similar|Somewhat similar|Slightly similar>"},
    {"name": "<site name>", "description": "<one sentence what it does>", "similarity": "<Very similar|Somewhat similar|Slightly similar>"},
    {"name": "<site name>", "description": "<one sentence what it does>", "similarity": "<Very similar|Somewhat similar|Slightly similar>"}
  ],
  "originality": "<unique|some_competition|already_exists>",
  "competitors": [
    {"name": "<site name>", "url": "<https://... actual site url>", "what_they_do": "<one sentence>", "your_edge": "<one sentence>"},
    {"name": "<site name>", "url": "<https://... actual site url>", "what_they_do": "<one sentence>", "your_edge": "<one sentence>"},
    {"name": "<site name>", "url": "<https://... actual site url>", "what_they_do": "<one sentence>", "your_edge": "<one sentence>"}
  ],
  "next_step": "<one friendly, specific, actionable recommendation in plain English — 2-3 sentences max>"
}`;

    const { text, provider } = await callWithFallback(prompt, { jsonMode: true });
    const parsed = extractJson(text);
    parsed.provider_used = provider;
    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Something went wrong" });
  }
}
