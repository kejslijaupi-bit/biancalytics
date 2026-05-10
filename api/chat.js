export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { question, results } = req.body || {};
    if (!question) return res.status(400).json({ error: "Missing question" });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing GEMINI_API_KEY" });

    const prompt = `You are a friendly startup advisor. A user analyzed their website idea and received these results:

${JSON.stringify(results, null, 2)}

The user asks: "${question}"

Answer in plain, friendly English. Keep it short, 2-4 sentences max. No jargon.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.5 }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || "Gemini request failed" });
    }

    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't answer that right now.";
    return res.status(200).json({ answer });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Something went wrong" });
  }
}
