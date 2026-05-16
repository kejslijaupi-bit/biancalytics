import { callWithFallback, extractJson } from "./_providers.js";

async function fetchWebsiteText(url) {
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

    const visibleText = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 5000);

    return { title, description, visibleText };
  } catch {
    return null;
  }
}

async function searchWeb(query) {
  if (!process.env.SERPER_API_KEY) return [];

  const response = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": process.env.SERPER_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      q: query,
      num: 10
    })
  });

  const data = await response.json();

  return (data.organic || []).map((item) => ({
    title: item.title,
    link: item.link,
    snippet: item.snippet
  }));
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

    let websiteInfo = null;

    if (mode === "url") {
      websiteInfo = await fetchWebsiteText(value);
    }

    const understandingPrompt =
      mode === "url"
        ? `
The user submitted this website URL:

${value}

Here is the website content:

Title:
${websiteInfo?.title || "No title found"}

Meta description:
${websiteInfo?.description || "No description found"}

Visible text:
${websiteInfo?.visibleText || "Could not fetch visible text"}

Your task:
Identify what this website/product actually does.

Return ONLY valid JSON:
{
  "product_summary": "one clear sentence explaining what the website does",
  "product_category": "short category, for example: video sharing platform, language learning app, ride sharing marketplace",
  "search_query": "best Google search query to find direct competitors and alternatives"
}

Rules:
- Do not focus on the domain name.
- Do not focus on hosting/authentication pages.
- Focus on the real user-facing product or service.
- The search query should find websites/products that do the same thing.
`
        : `
The user described this website/app/startup idea:

${value}

Your task:
Identify what kind of product this is.

Return ONLY valid JSON:
{
  "product_summary": "one clear sentence explaining the idea",
  "product_category": "short category",
  "search_query": "best Google search query to find direct competitors and alternatives"
}

Rules:
- Focus on what the product does.
- The search query should find websites/products that solve the same problem.
`;

    const understandingResult = await callWithFallback(understandingPrompt, {
      jsonMode: true
    });

    const understanding = extractJson(understandingResult.text);

    const searchQuery =
      understanding.search_query ||
      `${understanding.product_category} competitors alternatives similar websites`;

    const searchResults = await searchWeb(searchQuery);

    const finalPrompt = `
The user submitted:

${value}

Product summary:
${understanding.product_summary}

Product category:
${understanding.product_category}

Search query used:
${searchQuery}

Real Google search results:
${JSON.stringify(searchResults, null, 2)}

Your task:
Find direct competitors or alternatives.

Important rules:
- Competitors must do the same main thing as the submitted website/product.
- If input is YouTube, competitors should be video platforms like Vimeo, Dailymotion, Twitch, TikTok, Rumble.
- If input is Airbnb, competitors should be rental marketplaces.
- If input is Duolingo, competitors should be language learning apps.
- Do NOT include SEO tools, audit tools, domain tools, name generators, blogs, podcasts, or unrelated websites.
- Popularity does not matter.
- The question is: "What other websites/products do the same thing?"
- If search results are weak, use your knowledge but stay in the same product category.

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
}
`;

    const finalResult = await callWithFallback(finalPrompt, {
      jsonMode: true
    });

    const parsed = extractJson(finalResult.text);

    parsed.provider_used = finalResult.provider;
    parsed.product_summary = understanding.product_summary;
    parsed.product_category = understanding.product_category;

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({
      error: err.message || "Something went wrong"
    });
  }
}
