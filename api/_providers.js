export function getProviders() {
  const providers = [];

  const geminiKeys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
  ].filter(Boolean);

  for (const key of geminiKeys) {
    providers.push({
      name: "Gemini",
      async call(prompt, jsonMode = false) {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: jsonMode ? 0.3 : 0.5,
                ...(jsonMode
                  ? { responseMimeType: "application/json" }
                  : {})
              }
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error?.message || "Gemini request failed"
          );
        }

        return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }
    });
  }

  if (process.env.ANTHROPIC_API_KEY) {
    providers.push({
      name: "Anthropic",
      async call(prompt) {
        const response = await fetch(
          "https://api.anthropic.com/v1/messages",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": process.env.ANTHROPIC_API_KEY,
              "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
              model: "claude-3-5-haiku-latest",
              max_tokens: 1400,
              temperature: 0.4,
              messages: [{ role: "user", content: prompt }]
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error?.message || "Anthropic request failed"
          );
        }

        return data.content?.[0]?.text || "";
      }
    });
  }

  if (process.env.OPENAI_API_KEY) {
    providers.push({
      name: "OpenAI",
      async call(prompt, jsonMode = false) {
        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              temperature: jsonMode ? 0.3 : 0.5,
              messages: [{ role: "user", content: prompt }],
              ...(jsonMode
                ? { response_format: { type: "json_object" } }
                : {})
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error?.message || "OpenAI request failed"
          );
        }

        return data.choices?.[0]?.message?.content || "";
      }
    });
  }

  if (process.env.NVIDIA_API_KEY) {
    providers.push({
      name: "NVIDIA",
      async call(prompt) {
        const response = await fetch(
          "https://integrate.api.nvidia.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`
            },
            body: JSON.stringify({
              model: "meta/llama-3.1-8b-instruct",
              messages: [
                {
                  role: "user",
                  content: prompt
                }
              ],
              temperature: 0.4,
              max_tokens: 1200
            })
          }
        );

        const raw = await response.text();

        let data;

        try {
          data = JSON.parse(raw);
        } catch {
          throw new Error(
            `NVIDIA returned non-JSON response: ${raw.slice(0, 200)}`
          );
        }

        if (!response.ok) {
          throw new Error(
            data.error?.message ||
              data.detail ||
              raw.slice(0, 200) ||
              "NVIDIA request failed"
          );
        }

        return data.choices?.[0]?.message?.content || "";
      }
    });
  }

  return providers;
}

export async function callWithFallback(
  prompt,
  { jsonMode = false } = {}
) {
  const providers = getProviders();

  if (!providers.length) {
    throw new Error(
      "No API keys found. Add API keys in Vercel."
    );
  }

  const errors = [];

  for (const provider of providers) {
    try {
      const text = await provider.call(prompt, jsonMode);

      if (!text) {
        throw new Error(`${provider.name} returned empty text`);
      }

      return {
        text,
        provider: provider.name
      };
    } catch (err) {
      errors.push(`${provider.name}: ${err.message}`);
    }
  }

  throw new Error(`All providers failed. ${errors.join(" | ")}`);
}

export function extractJson(text) {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const match = cleaned.match(/\{[\s\S]*\}/);

  if (!match) {
    throw new Error("AI returned no valid JSON.");
  }

  return JSON.parse(match[0]);
}
