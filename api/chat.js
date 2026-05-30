// Vercel serverless function — POST /api/chat
// Proxies to OpenAI and parses job ID recommendations

function buildSystemPrompt(profile, jobs) {
  let profileSection = "No profile yet — encourage the student to complete their profile.";
  if (profile && (profile.fullName || profile.university)) {
    const lines = [];
    if (profile.fullName)  lines.push(`Name: ${profile.fullName}`);
    if (profile.university)lines.push(`University: ${profile.university}`);
    if (profile.degree)    lines.push(`Degree: ${profile.degree}`);
    if (profile.city)      lines.push(`City: ${profile.city}`);
    if (profile.skills?.length) lines.push(`Skills: ${profile.skills.join(", ")}`);
    if (profile.targetRoles)    lines.push(`Target roles: ${profile.targetRoles}`);
    if (profile.workMode)       lines.push(`Work mode: ${profile.workMode}`);
    if (profile.salaryMin)      lines.push(`Min salary: ₨ ${profile.salaryMin}k/month`);
    profileSection = lines.join("\n");
  }

  const jobsSection = (jobs || []).slice(0, 60).map(j => {
    const skills = Array.isArray(j.skills) ? j.skills.join(", ") : (j.skills || "");
    return `[${j.id}] ${j.title} at ${j.company} | ${j.location} | Skills: ${skills} | ${j.salary} | ${j.type}`;
  }).join("\n") || "No jobs available.";

  return `You are an AI career advisor for CareerPath AI — an SDG 8-aligned career guidance platform for Pakistani youth.

ABOUT CAREERPATH AI:
- Connects Pakistani university students with employers in Pakistan
- Aligned with SDG 8, Vision 2030, Vision 2035, Digital Pakistan
- Features: AI career chat, job matching, saved jobs, application tracker, resume builder

STUDENT PROFILE:
${profileSection}

AVAILABLE JOBS (use these IDs exactly when recommending):
${jobsSection}

YOUR ROLE:
- Give personalised career advice based on the student profile above
- Recommend specific jobs from the list with clear reasons why they fit
- Help identify skill gaps and suggest free learning resources
- Create actionable 90-day career plans when asked
- Suggest concrete resume improvements
- Use ₨ (Pakistani Rupees) for salary figures
- Reference real Pakistani companies and cities

RESPONSE STYLE:
- Max 2-3 short paragraphs
- Use **bold** for key skills, job titles, and action items
- Be specific — use numbers, company names, course names
- End with one short follow-up question

JOB RECOMMENDATION FORMAT (IMPORTANT):
When recommending specific jobs, append their IDs at the very end on a new line in EXACTLY this format:
[JOBS:j1,j5,j23]
Only use IDs from the list above. Include 2-4 jobs max. Omit if not recommending jobs.`;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { messages = [], profile, jobs } = req.body;
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(500).json({ error: "OPENAI_API_KEY not configured in Vercel environment variables." });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 800,
        messages: [{ role: "system", content: buildSystemPrompt(profile, jobs) }, ...messages],
      }),
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    let raw = data.choices?.[0]?.message?.content || "Sorry, I could not generate a response.";
    const match = raw.match(/\[JOBS:([\w,\s]+)\]/);
    const jobIds = match ? match[1].split(",").map(s => s.trim()).filter(Boolean) : [];
    const text = raw.replace(/\n?\[JOBS:[\w,\s]+\]/g, "").trim();

    res.json({ text, jobIds });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
