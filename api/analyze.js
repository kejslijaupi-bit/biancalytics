fexport default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { mode, value } = req.body || {};

    if (!value || !mode) {
      return res.status(400).json({ error: "Missing mode or value" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    }

    const concept = mode === "idea"
      ? `The user described their website idea as: "${value}"`
      : `The user's website is at: ${value}`;

    const prompt = `${concept}

You are a friendly startup advisor helping non-technical people understand whether their website idea already exists online.

Do the following:
1. Understand the core concept.
2. Identify likely similar existing websites, tools, apps, or products.
3. Identify the top 3 most direct competitors or competitor search directions.
4. Decide how original the idea is.
5. Give one honest, friendly, actionable recommendation.

Return ONLY valid JSON in this exact format:
{
  "similar": [
    {"name": "<site name>", "description": "<one sentence what it does>", "similarity": "<Very similar|Somewhat similar|Slightly similar>"},
    {"name": "<site name>", "description": "<one sentence what it does>", "similarity": "<Very similar|Somewhat similar|Slightly similar>"},
    {"name": "<site name>", "description": "<one sentence what it does>", "similarity": "<Very similar|Somewhat similar|Slightly similar>"}
  ],
  "originality": "<unique|some_competition|already_exists>",
  "competitors": [
    {"name": "<site name>", "url": "<https://... actual site url>", "what_they_do": "<one sentence>", "your_edge": "<one sentence how the user's idea is different or could be better>"},
    {"name": "<site name>", "url": "<https://... actual site url>", "what_they_do": "<one sentence>", "your_edge": "<one sentence>"},
    {"name": "<site name>", "url": "<https://... actual site url>", "what_they_do": "<one sentence>", "your_edge": "<one sentence>"}
  ],
  "next_step": "<one friendly, specific, actionable recommendation in plain English — 2-3 sentences max>"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            responseMimeType: "application/json"
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || "Gemini request failed" });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const parsed = JSON.parse(text);

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Something went wrong" });
  }
}
