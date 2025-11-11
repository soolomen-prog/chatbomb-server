// api/chat.js
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// CORS helper
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

module.exports = async (req, res) => {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const {
      message,
      history = [], // массив [{role:'user'|'assistant'|'system', content:'...'}]
      locale = "de",
      biz = "school",
    } = body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ ok: false, error: "Missing 'message' string" });
    }

    // Базовый "системный" промпт под автошколу START
    const systemPrompt = `
Du bist ein hilfreicher Assistent der Fahrschule "START".
- Antworte **kurz und klar** auf Deutsch (${locale}).
- Wenn dich nach Preisen, Klassen, Ratenzahlung (0% Finanzierung), Geschenkgutscheinen, Filialen, Öffnungszeiten oder Kursplänen fragen — gib strukturierte, freundliche Antworten.
- Wenn dir Fakten fehlen, sag ehrlich, dass du das intern nachschauen musst und biete an, den Kontakt aufzunehmen.
- Nutze neutrale, freundliche Tonalität; kein Marketing-Blabla, sondern echte Hilfe.
`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history, // если передаёшь переписку — добавится сюда
      { role: "user", content: message },
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // можно заменить на свой
      temperature: 0.3,
      messages,
    });

    const answer =
      completion?.choices?.[0]?.message?.content?.trim() || "Entschuldigung, das habe ich nicht ganz verstanden.";

    return res.status(200).json({
      ok: true,
      answer,
      meta: {
        model: completion?.model,
        usage: completion?.usage || null,
      },
    });
  } catch (err) {
    console.error("CHAT API ERROR:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};
