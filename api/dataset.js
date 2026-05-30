// Vercel serverless function — GET /api/dataset
// Fetches jobs CSV from Kaggle, extracts ZIP, returns JSON

const AdmZip = require("adm-zip");

const KAGGLE_URL = "https://www.kaggle.com/api/v1/datasets/download/fatimaali01/careerpath-ai-pakistani-tech-jobs-2026";

// In-memory cache (lives as long as the Vercel function instance is warm)
let cache = null;

function parseCSV(raw) {
  const lines = raw.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map(line => {
    const fields = [];
    let cur = "", inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === "," && !inQ) { fields.push(cur.trim()); cur = ""; }
      else { cur += ch; }
    }
    fields.push(cur.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (fields[i] || "").replace(/^"|"$/g, ""); });
    return obj;
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  // Serve from cache if warm
  if (cache) return res.json(cache);

  try {
    // Download ZIP directly from Kaggle
    const response = await fetch(KAGGLE_URL, { redirect: "follow" });
    if (!response.ok) throw new Error(`Kaggle returned ${response.status}`);

    const buffer = Buffer.from(await response.arrayBuffer());
    const zip = new AdmZip(buffer);
    const entry = zip.getEntries().find(e => e.entryName.endsWith(".csv"));
    if (!entry) throw new Error("No CSV file found in Kaggle dataset ZIP");

    const csv = entry.getData().toString("utf8");
    cache = parseCSV(csv);

    res.setHeader("X-Data-Source", "Kaggle: fatimaali01/careerpath-ai-pakistani-tech-jobs-2026");
    res.json(cache);
  } catch (e) {
    // Fallback message — Vercel doesn't have local filesystem access for CSV
    console.error("Kaggle fetch failed:", e.message);
    res.status(500).json({ error: `Failed to load dataset from Kaggle: ${e.message}` });
  }
};
