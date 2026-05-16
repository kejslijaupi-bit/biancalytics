import { callWithFallback, extractJson } from "./_providers.js";

async function searchCompetitors(query) {
  if (!process.env.SERPER_API_KEY) {
    return [];
  }

  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.SERPER_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        q: query,
        num: 8
      })
    });

    const data = await response.json();

    return (data.organic || []).map((item) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet
    }));
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { mode, value } = req.body || {};

    if (!value || !mode) {
      return res.status(400).json({
        error: "Missing mode or value"
      });
    }

    const searchQuery = mode === "url"
  ? `"${value}" startup idea validation tool OR similar startup finder OR startup competitor checker`
  : `"${value}" existing startup OR similar SaaS OR startup validation platform OR competitor finder`;

const searchResults = await searchCompetitors(searchQuery);

    const prompt = `
The user submitted this startup idea or website:

${value}

Here are real Google search results related to it:

${JSON.stringify(searchResults, null, 2)}

Your task:
- The product is about checking whether a website/app/startup idea already exists online.
- Do NOT classify it as website analytics, user behavior analytics, or traffic analytics unless the user explicitly says that.
- Find competitors that help users validate ideas, find similar startups, check competitors, or research whether an idea already exists.
- Popularity does not matter. The question is: does something similar already exist?
- Avoid unrelated tools like Google Analytics, Hotjar, or Mixpanel unless the submitted idea is actually about analytics.
- ONLY return competitors that directly help users discover whether startup ideas or websites already exist.
- If search results are unrelated, ignore them instead of forcing a match.

Return ONLY valid JSON:

{
  "similar": [
    {
      "name": "site name",
      "description": "what it does",
      "similarity": "Very similar"
    }
  ],
  "originality": "unique",
  "competitors": [
    {
      "name": "site",
      "url": "https://...",
      "what_they_do": "description",
      "your_edge": "possible advantage"
    }
  ],
  "next_step": "helpful recommendation"
}
`;

    const { text, provider } = await callWithFallback(prompt, {
      jsonMode: true
    });

    const parsed = extractJson(text);

    parsed.provider_used = provider;

    return res.status(200).json(parsed);

  } catch (err) {
    return res.status(500).json({
      error: err.message || "Something went wrong"
    });
  }
}
