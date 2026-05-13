import { callWithFallback, extractJson } from "./_providers.js";

async function fetchWebsiteSummary(url) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 BiancalyticsBot/1.0"
      }
    });

    const html = await response.text();

    const title =
      html.match(/<title[^>]*>(.*?)<\/title>/is)?.[1]?.trim() || "";

    const description =
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim() ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)?.[1]?.trim() ||
      "";

    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 4000);

    return {
      title,
      description,
      text
    };
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { mode, value } = req.body || {};

    if (!value || !mode) {
      return res.status(400).json({ error: "Missing mode or value" });
    }

    let concept;

    if (mode === "url") {
      const site = await fetchWebsiteSummary(value);

      concept = site
        ? `The user's website URL is: ${value}

Website title:
${site.title}

Website meta description:
${site.description}

Visible website text:
${site.text}

Analyze what this website actually does based on the title, description, and visible text. Do not guess from the URL alone.`
        : `The user's website is at: ${value}. The website content could not be fetched, so analyze cautiously and say that the comparison may be limited.`;
    } else {
      concept = `The user described their website idea as: "${value}"`;
    }

    const prompt = `${concept}

You are a friendly startup advisor helping non-technical people understand whether their website idea already exists online.

Important:
- If the user provided a URL, compare based on the website's actual content, not the domain name alone.
- Do not invent unrelated competitors.
- Competitors must match the same core product/problem.
- If uncertain, say "possible competitor" and explain why.
- Return practical, useful results.

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
