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
              contents: [{ parts: [{ text: prompt }] }]
            })
          }
        );

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Gemini request failed");
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }
    });
  }

  if (process.env.OPENAI_API_KEY) {
    providers.push({
      name: "OpenAI",
      async call(prompt) {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }]
          })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "OpenAI failed");
        return data.choices?.[0]?.message?.content || "";
      }
    });
  }

  if (process.env.ANTHROPIC_API_KEY) {
    providers.push({
      name: "Anthropic",
      async call(prompt) {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify({
            model: "claude-3-5-haiku-latest",
            max_tokens: 1400,
            messages: [{ role: "user", content: prompt }]
          })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Anthropic failed");
        return data.content?.[0]?.text || "";
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
              model: "meta/llama3-70b-instruct",
              messages: [{ role: "user", content: prompt }],
              temperature: 0.4,
              max_tokens: 1400
            })
          }
        );

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "NVIDIA failed");
        return data.choices?.[0]?.message?.content || "";
      }
    });
  }

  return providers;
}
