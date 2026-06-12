require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const https = require("https");
const { execSync } = require("child_process");

const app = express();
const PORT = process.env.PORT || 3000;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ── Serve UI ───────────────────────────────────────────────
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "CareerPath AI.html"));
});

// ── SYSTEM PROMPT BUILDER ─────────────────────────────────
function buildSystemPrompt(profile, jobs) {
  let profileSection =
    "No profile provided — encourage the student to complete their profile first.";

  if (profile && (profile.fullName || profile.university)) {
    const lines = [];
    if (profile.fullName) lines.push(`Name: ${profile.fullName}`);
    if (profile.university) lines.push(`University: ${profile.university}`);
    if (profile.degree) lines.push(`Degree: ${profile.degree}`);
    if (profile.city) lines.push(`City: ${profile.city}`);
    if (profile.skills?.length)
      lines.push(`Skills: ${profile.skills.join(", ")}`);
    if (profile.targetRoles) lines.push(`Target roles: ${profile.targetRoles}`);
    if (profile.workMode) lines.push(`Work mode: ${profile.workMode}`);
    if (profile.salaryMin)
      lines.push(`Minimum salary: ₨ ${profile.salaryMin}k/month`);

    profileSection = lines.join("\n");
  }

  const jobsSection =
    (jobs || [])
      .slice(0, 60)
      .map((j) => {
        const skills = Array.isArray(j.skills)
          ? j.skills.join(", ")
          : j.skills || "";

        return `[${j.id}] ${j.title} at ${j.company} | ${j.location} | Skills: ${skills} | ${j.salary} | ${j.type}`;
      })
      .join("\n") || "No jobs available.";

  return `You are an AI career advisor for CareerPath AI — an SDG 8-aligned platform for Pakistani youth.

ABOUT:
- Connects Pakistani students with employers
- Focus: careers, skills, job matching, resume help

STUDENT PROFILE:
${profileSection}

AVAILABLE JOBS:
${jobsSection}

ROLE:
- Recommend jobs using IDs
- Give career guidance
- Identify skill gaps
- Suggest learning resources
- Create 90-day plans

STYLE:
- 2–3 short paragraphs max
- Bold important skills and job titles
- Be specific and actionable

JOB FORMAT:
If recommending jobs, end with:
[JOBS:j1,j5,j9]
Only use valid IDs.`;
}

// ── CHAT ENDPOINT (CLAUDE) ────────────────────────────────
app.post("/api/chat", async (req, res) => {
  const { messages = [], profile, jobs } = req.body;

  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: "ANTHROPIC_API_KEY is not set in .env",
    });
  }

  try {
    const claudeMessages = messages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 800,
        system: buildSystemPrompt(profile, jobs),
        messages: claudeMessages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: data?.error?.message || "Anthropic API error",
      });
    }

    const raw =
      data.content?.find((c) => c.type === "text")?.text ||
      "No response generated.";

    const jobMatch = raw.match(/\[JOBS:([\w,\s-]+)\]/);

    const jobIds = jobMatch
      ? jobMatch[1].split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const text = raw.replace(/\n?\[JOBS:[\w,\s-]+\]/g, "").trim();

    res.json({ text, jobIds });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── IMPROVE RESUME ENDPOINT ───────────────────────────────
app.post("/api/improve", async (req, res) => {
  const { type, content, context = {} } = req.body;

  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: "ANTHROPIC_API_KEY not set in .env",
    });
  }

  let prompt = "";

  if (type === "summary") {
    prompt = `Improve this CV summary:

Name: ${context.name || ""}
Title: ${context.title || ""}
Skills: ${(context.skills || []).join(", ") || ""}
Education: ${context.education || ""}

Current:
"${content || ""}"

Return only improved summary.`;
  } else if (type === "experience") {
    prompt = `Improve this experience:

Role: ${context.role || ""} at ${context.company || ""}

Current:
"${content || ""}"

Return only improved text.`;
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system: "You are a professional CV writer.",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: data?.error?.message || "Anthropic API error",
      });
    }

    const text =
      data.content?.find((c) => c.type === "text")?.text?.trim() ||
      "Could not improve text.";

    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── KAGGLE DATASET ────────────────────────────────────────
const KAGGLE_URL =
  "https://www.kaggle.com/api/v1/datasets/download/fatimaali01/careerpath-ai-pakistani-tech-jobs-2026";

let datasetCache = null;

function parseCSV(raw) {
  const lines = raw.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const obj = {};
    headers.forEach((h, i) => (obj[h] = values[i] || ""));
    return obj;
  });
}

async function fetchKaggleDataset() {
  const tmpZip = "/tmp/kaggle.zip";
  const tmpDir = "/tmp/kaggle_extract";

  execSync(`curl -L -s -o "${tmpZip}" "${KAGGLE_URL}"`);
  execSync(`rm -rf "${tmpDir}" && mkdir -p "${tmpDir}"`);
  execSync(`unzip -o "${tmpZip}" -d "${tmpDir}"`);

  const files = fs.readdirSync(tmpDir).filter((f) => f.endsWith(".csv"));
  if (!files.length) throw new Error("No CSV found");

  const csv = fs.readFileSync(path.join(tmpDir, files[0]), "utf8");
  return parseCSV(csv);
}

// ── DATA API ──────────────────────────────────────────────
app.get("/api/dataset", async (req, res) => {
  if (datasetCache) return res.json(datasetCache);

  try {
    datasetCache = await fetchKaggleDataset();
    res.json(datasetCache);
  } catch (err) {
    const fallback = path.join(__dirname, "dataset/careerpath_jobs.csv");

    if (!fs.existsSync(fallback)) {
      return res.status(500).json({ error: "No dataset found" });
    }

    datasetCache = parseCSV(fs.readFileSync(fallback, "utf8"));
    res.json(datasetCache);
  }
});

// ── REFRESH DATASET ───────────────────────────────────────
app.get("/api/dataset/refresh", async (req, res) => {
  try {
    datasetCache = null;
    datasetCache = await fetchKaggleDataset();
    res.json({ message: `Refreshed ${datasetCache.length} jobs` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── START SERVER ───────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\nServer running: http://localhost:${PORT}`);

  if (!ANTHROPIC_API_KEY) {
    console.warn("⚠ ANTHROPIC_API_KEY missing");
  } else {
    console.log("Claude AI connected ✓");
  }
});







// require("dotenv").config();
// const express = require("express");
// const path = require("path");
// const fs = require("fs");
// const https = require("https");

// const app = express();
// const PORT = process.env.PORT || 3000;
// const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// app.use(express.json());
// app.use(express.static(path.join(__dirname)));

// // Serve the main HTML file at root
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "CareerPath AI.html"));
// });

// // ── Build system prompt from profile + jobs ───────────────────────────────
// function buildSystemPrompt(profile, jobs) {
//   let profileSection = "No profile provided — encourage the student to complete their profile first.";
//   if (profile && (profile.fullName || profile.university)) {
//     const lines = [];
//     if (profile.fullName)    lines.push(`Name: ${profile.fullName}`);
//     if (profile.university)  lines.push(`University: ${profile.university}`);
//     if (profile.degree)      lines.push(`Degree: ${profile.degree}`);
//     if (profile.city)        lines.push(`City: ${profile.city}`);
//     if (profile.skills && profile.skills.length > 0)
//       lines.push(`Skills: ${profile.skills.join(", ")}`);
//     if (profile.targetRoles) lines.push(`Target roles: ${profile.targetRoles}`);
//     if (profile.workMode)    lines.push(`Work mode preference: ${profile.workMode}`);
//     if (profile.salaryMin)   lines.push(`Minimum salary: ₨ ${profile.salaryMin}k/month`);
//     profileSection = lines.join("\n");
//   }

//   let jobsSection = "No jobs available at the moment.";
//   if (jobs && jobs.length > 0) {
//     // Send up to 60 jobs to stay within token limits
//     jobsSection = jobs.slice(0, 60)
//       .map((j) => {
//         const skillStr = Array.isArray(j.skills) ? j.skills.join(", ") : (j.skills || "");
//         return `[${j.id}] ${j.title} at ${j.company} | ${j.location} | Skills: ${skillStr} | ${j.salary} | ${j.type}`;
//       })
//       .join("\n");
//   }

//   return `You are an AI career advisor for CareerPath AI — an SDG 8-aligned career guidance platform for Pakistani youth.

// ABOUT CAREERPATH AI:
// - Connects Pakistani university students with employers in Pakistan
// - Aligned with SDG 8 (Decent Work), Vision 2030, Vision 2035, Digital Pakistan initiative
// - Features: AI career chat, job matching, saved jobs, application tracker, resume builder

// STUDENT PROFILE:
// ${profileSection}

// AVAILABLE JOBS ON THE PLATFORM (use these IDs exactly when recommending):
// ${jobsSection}

// YOUR ROLE:
// - Give personalised career advice based on the student profile above
// - Recommend specific jobs from the list above with clear reasons why they fit
// - Help identify skill gaps and suggest free learning resources
// - Create actionable 90-day career plans when asked
// - Suggest concrete resume improvements with examples
// - Use ₨ (Pakistani Rupees) for salary figures
// - Reference real Pakistani companies and cities

// RESPONSE STYLE:
// - Max 2-3 short paragraphs
// - Use **bold** for key skills, job titles, and action items
// - Be specific — use numbers, company names, course names
// - End with one short follow-up question
// - If student has no profile, ask them to complete it first for better matches

// JOB RECOMMENDATION FORMAT (IMPORTANT):
// When you recommend specific jobs from the list, you MUST append their IDs at the very end of your response on a new line in EXACTLY this format — no spaces, no punctuation outside brackets:
// [JOBS:j1,j5,j23]
// Only use IDs that exist in the list above. Include 2-4 jobs max. Omit the tag entirely if you are not recommending jobs.`;
// }

// // ── POST /api/chat ─────────────────────────────────────────────────────────
// app.post("/api/chat", (req, res) => {
//   const { messages = [], profile, jobs } = req.body;

//   if (!OPENAI_API_KEY) {
//     return res.status(500).json({ error: "OPENAI_API_KEY is not set in .env" });
//   }

//   const systemPrompt = buildSystemPrompt(profile, jobs);

//   // OpenAI format: system message prepended to messages array
//   const openAiMessages = [
//     { role: "system", content: systemPrompt },
//     ...messages,
//   ];

//   const requestBody = JSON.stringify({
//     model: "gpt-4o-mini",
//     max_tokens: 800,
//     messages: openAiMessages,
//   });

//   const options = {
//     hostname: "api.openai.com",
//     port: 443,
//     path: "/v1/chat/completions",
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Authorization": `Bearer ${OPENAI_API_KEY}`,
//       "Content-Length": Buffer.byteLength(requestBody),
//     },
//   };

//   const apiReq = https.request(options, (apiRes) => {
//     let data = "";
//     apiRes.on("data", (chunk) => { data += chunk; });
//     apiRes.on("end", () => {
//       try {
//         const parsed = JSON.parse(data);
//         if (parsed.error) {
//           return res.status(500).json({ error: parsed.error.message });
//         }
//         let raw = parsed.choices && parsed.choices[0] && parsed.choices[0].message
//           ? parsed.choices[0].message.content
//           : "Sorry, I could not generate a response.";
//         // Extract job IDs from [JOBS:j1,j2] tag
//         const jobMatch = raw.match(/\[JOBS:([\w,\s]+)\]/);
//         const jobIds = jobMatch ? jobMatch[1].split(",").map(s => s.trim()).filter(Boolean) : [];
//         const text = raw.replace(/\n?\[JOBS:[\w,\s]+\]/g, "").trim();
//         res.json({ text, jobIds });
//       } catch (e) {
//         res.status(500).json({ error: "Failed to parse API response" });
//       }
//     });
//   });

//   apiReq.on("error", (e) => {
//     res.status(500).json({ error: "Network error reaching OpenAI API: " + e.message });
//   });

//   apiReq.write(requestBody);
//   apiReq.end();
// });

// // ── POST /api/improve — AI-powered resume text improvement ────────────────
// app.post("/api/improve", (req, res) => {
//   const { type, content, context = {} } = req.body;

//   if (!OPENAI_API_KEY) {
//     return res.status(500).json({ error: "OPENAI_API_KEY not set in .env" });
//   }

//   let prompt = "";

//   if (type === "summary") {
//     prompt = `You are a professional CV writer. Improve this professional summary.

// Candidate: ${context.name || ""}
// Headline: ${context.title || "Student"}
// Skills: ${(context.skills || []).join(", ") || "Not listed"}
// Education: ${context.education || ""}

// Current summary:
// "${content || "No summary yet — write a strong one based on the details above."}"

// Write an improved summary that:
// - Is 2–3 sentences max
// - Opens with a strong positioning statement
// - Highlights their most relevant skills and value
// - Sounds confident and specific, not generic
// - Is tailored to the Pakistani job market

// Return ONLY the improved summary text. No quotes, no explanation.`;

//   } else if (type === "experience") {
//     prompt = `You are a professional CV writer. Improve this job experience description.

// Role: ${context.role || "Role"} at ${context.company || "Company"} (${context.period || ""})

// Current description:
// "${content || "No description yet."}"

// Write an improved description that:
// - Opens with a strong action verb
// - Shows 2–3 achievements or key responsibilities
// - Uses numbers/percentages/time saved where it makes sense
// - Is concise — 2 to 4 lines
// - Avoids weak phrases like "responsible for" or "worked on"

// Return ONLY the improved text. No quotes, no bullet points, no explanation.`;
//   }

//   const requestBody = JSON.stringify({
//     model: "gpt-4o-mini",
//     max_tokens: 300,
//     messages: [{ role: "user", content: prompt }],
//   });

//   const options = {
//     hostname: "api.openai.com",
//     port: 443,
//     path: "/v1/chat/completions",
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Authorization": `Bearer ${OPENAI_API_KEY}`,
//       "Content-Length": Buffer.byteLength(requestBody),
//     },
//   };

//   const apiReq = https.request(options, (apiRes) => {
//     let data = "";
//     apiRes.on("data", chunk => { data += chunk; });
//     apiRes.on("end", () => {
//       try {
//         const parsed = JSON.parse(data);
//         if (parsed.error) return res.status(500).json({ error: parsed.error.message });
//         const text = parsed.choices?.[0]?.message?.content?.trim() || "Could not improve text.";
//         res.json({ text });
//       } catch (e) {
//         res.status(500).json({ error: "Failed to parse response" });
//       }
//     });
//   });

//   apiReq.on("error", e => res.status(500).json({ error: e.message }));
//   apiReq.write(requestBody);
//   apiReq.end();
// });

// // ── Kaggle dataset config ──────────────────────────────────────────────────
// const KAGGLE_URL = "https://www.kaggle.com/api/v1/datasets/download/fatimaali01/careerpath-ai-pakistani-tech-jobs-2026";
// let datasetCache = null; // in-memory cache so we don't hit Kaggle on every request

// function parseCSV(raw) {
//   const lines = raw.trim().split("\n");
//   if (lines.length < 2) return [];
//   const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
//   return lines.slice(1).map(line => {
//     const fields = [];
//     let cur = "", inQ = false;
//     for (const ch of line) {
//       if (ch === '"') { inQ = !inQ; }
//       else if (ch === "," && !inQ) { fields.push(cur.trim()); cur = ""; }
//       else { cur += ch; }
//     }
//     fields.push(cur.trim());
//     const obj = {};
//     headers.forEach((h, i) => { obj[h] = (fields[i] || "").replace(/^"|"$/g, ""); });
//     return obj;
//   });
// }

// async function fetchKaggleDataset() {
//   const { execSync } = require("child_process");
//   const tmpZip = "/tmp/kaggle_careerpath_latest.zip";
//   const tmpDir = "/tmp/kaggle_careerpath_extract";

//   console.log("  Fetching dataset from Kaggle…");
//   // Download ZIP
//   execSync(`curl -L -s -o "${tmpZip}" "${KAGGLE_URL}"`);

//   // Extract
//   execSync(`rm -rf "${tmpDir}" && mkdir -p "${tmpDir}" && unzip -o "${tmpZip}" -d "${tmpDir}"`);

//   // Find CSV
//   const files = fs.readdirSync(tmpDir).filter(f => f.endsWith(".csv"));
//   if (!files.length) throw new Error("No CSV found in Kaggle ZIP");

//   const csv = fs.readFileSync(path.join(tmpDir, files[0]), "utf8");
//   const data = parseCSV(csv);
//   console.log(`  ✓ Loaded ${data.length} jobs from Kaggle dataset`);
//   return data;
// }

// // ── GET /api/dataset — live from Kaggle, fallback to local CSV ─────────────
// app.get("/api/dataset", async (req, res) => {
//   // Return cache if available (cleared on server restart)
//   if (datasetCache) return res.json(datasetCache);

//   try {
//     datasetCache = await fetchKaggleDataset();
//     return res.json(datasetCache);
//   } catch (kaggleErr) {
//     console.warn("  Kaggle fetch failed, falling back to local CSV:", kaggleErr.message);
//     // Fallback: local CSV
//     const csvPath = path.join(__dirname, "dataset", "careerpath_jobs.csv");
//     if (!fs.existsSync(csvPath)) return res.status(404).json({ error: "Dataset not found", jobs: [] });
//     try {
//       datasetCache = parseCSV(fs.readFileSync(csvPath, "utf8"));
//       return res.json(datasetCache);
//     } catch (e) {
//       return res.status(500).json({ error: e.message });
//     }
//   }
// });

// // ── GET /api/dataset/refresh — force re-fetch from Kaggle ─────────────────
// app.get("/api/dataset/refresh", async (req, res) => {
//   try {
//     datasetCache = null;
//     datasetCache = await fetchKaggleDataset();
//     res.json({ message: `Refreshed — ${datasetCache.length} jobs loaded from Kaggle.` });
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

// // ── Start ──────────────────────────────────────────────────────────────────
// app.listen(PORT, () => {
//   console.log(`\n  CareerPath AI server running at http://localhost:${PORT}`);
//   console.log(`  Open: http://localhost:${PORT}/CareerPath%20AI.html\n`);
//   if (!OPENAI_API_KEY) {
//     console.warn("  WARNING: OPENAI_API_KEY is not set in .env — AI chat will not work.");
//     console.warn("  Add your OpenAI key to .env: OPENAI_API_KEY=sk-...\n");
//   } else {
//     console.log("  AI chat: connected via OpenAI gpt-4o-mini ✓\n");
//   }
// });
