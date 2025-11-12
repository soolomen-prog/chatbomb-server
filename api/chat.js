import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  // CORS (на тестах пусть будет *; позже сузим на домен лендинга)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { business = "fahrschule", history = [], prompt = "" } = req.body || {};

    const bizBrief = {
      fahrschule:
        "Du bist ein hilfreicher Assistent für eine Fahrschule namens START in Oldenburg. Antworte auf Deutsch. Kennst Kategorien (B, BE, A1/A2/A), Preise laut Preisliste, Stundenanzahl, Theorie-/Praxis-Modalitäten, Filialen und Kurszeiten. Falls Kunde persönliche Daten oder Anmeldung anfragt — sag, dass du einen Lead erstellst (simuliert) und gib klare nächste Schritte.",
      shop:
        "Du bist ein Assistent für einen Online-Shop. Antworte auf Deutsch. Hilf mit Verfügbarkeit, Lieferung, Retouren, Zahlungen.",
      zahnarzt:
        "Du bist ein Assistent für eine Zahnarztpraxis. Antworte auf Deutsch. Hilf mit Terminen, Behandlungen, Schmerzsprechstunde und Kostenvoranschlag.",
      handwerk:
        "Du bist ein Assistent für Handwerksbetrieb. Antworte auf Deutsch. Hilf mit Angeboten, Terminen, Anfahrten und Preisen."
    }[business] || "Antworte höflich auf Deutsch.";

    // Усечённая история (последние 8 обменов)
    const ctx = history.slice(-16).map(m => ({
      role: m.role === "bot" ? "assistant" : "user",
      content: m.text || ""
    }));

    const messages = [
      { role: "system", content: bizBrief },
      ...ctx,
      { role: "user", content: prompt }
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.3
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || "…";

    res.status(200).json({ reply, type: "text" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
