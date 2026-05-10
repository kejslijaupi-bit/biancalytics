export default async function handler(req, res) {
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
    const prompt = `${concept}\nYou are a friendly startup advisor. Return ONLY raw JSON, no markdown, no backticks:\n{"similar":[{"name":"x","description":"x","similarity":"Very similar"},{"name":"x","description":"x","similarity":"Somewhat similar"},{"name":"x","description":"x","similarity":"Slightly similar"}],"originality":"unique","competitors":[{"name":"x","url":"https://x.com","what_they_do":"x","your_edge":"x"},{"name":"x","url":"https://x.com","what_they_do":"x","your_edge":"x"},{"name":"x","url":"https://x.com","what_they_do":"x","your_edge":"x"}],"next_step":"x"}`;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4 }
        })
      }
    );
    const data = await response.json();
    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || "Gemini request failed" });
    }
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(text);
    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Something went wrong" });
  }
}
