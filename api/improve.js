// Vercel serverless function — POST /api/improve
// AI-powered resume text improvement

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { type, content, context = {} } = req.body;
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(500).json({ error: "OPENAI_API_KEY not configured." });

  let prompt = "";

  if (type === "summary") {
    prompt = `You are a professional CV writer. Improve this professional summary.

Candidate: ${context.name || ""}
Headline: ${context.title || "Student"}
Skills: ${(context.skills || []).join(", ") || "Not listed"}
Education: ${context.education || ""}

Current summary:
"${content || "No summary yet — write a strong one based on the details above."}"

Write an improved summary that:
- Is 2–3 sentences max
- Opens with a strong positioning statement
- Highlights their most relevant skills and value
- Sounds confident and specific, not generic
- Is tailored to the Pakistani job market

Return ONLY the improved summary text. No quotes, no explanation.`;

  } else if (type === "experience") {
    prompt = `You are a professional CV writer. Improve this job experience description.

Role: ${context.role || "Role"} at ${context.company || "Company"} (${context.period || ""})

Current description:
"${content || "No description yet."}"

Write an improved description that:
- Opens with a strong action verb
- Shows 2–3 achievements or key responsibilities
- Uses numbers/percentages/time saved where possible
- Is concise — 2 to 4 lines
- Avoids weak phrases like "responsible for" or "worked on"

Return ONLY the improved text. No quotes, no bullet points, no explanation.`;
  } else {
    return res.status(400).json({ error: "Invalid type. Use 'summary' or 'experience'." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const text = data.choices?.[0]?.message?.content?.trim() || "Could not improve text.";
    res.json({ text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
