/* CareerPath AI — Resume Builder */

const ResumeBuilder = ({ resume, setResume, onSnack }) => {
  const set        = (k, v)         => setResume((r) => ({ ...r, [k]: v }));
  const updateList = (key, i, patch) => setResume((r) => ({ ...r, [key]: r[key].map((it, idx) => idx === i ? { ...it, ...patch } : it) }));
  const addToList  = (key, item)     => setResume((r) => ({ ...r, [key]: [...r[key], item] }));
  const removeFromList = (key, i)    => setResume((r) => ({ ...r, [key]: r[key].filter((_, idx) => idx !== i) }));

  const [summaryBusy, setSummaryBusy] = useState(false);
  const [expBusy,     setExpBusy]     = useState({});  // { [index]: true }
  const [saving,      setSaving]      = useState(false);

  // ── AI improve helpers ──────────────────────────────────────────────────
  const aiImprove = async (type, content, context) => {
    const res = await fetch("/api/improve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, content, context }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.text;
  };

  const aiImproveSummary = async () => {
    setSummaryBusy(true);
    try {
      const improved = await aiImprove("summary", resume.summary, {
        name:      resume.name,
        title:     resume.title,
        skills:    resume.skills,
        education: resume.education?.[0] ? `${resume.education[0].school} — ${resume.education[0].degree}` : "",
      });
      set("summary", improved);
      onSnack && onSnack({ tone: "success", title: "Summary improved", sub: "Review and edit it to make it your own." });
    } catch (e) {
      onSnack && onSnack({ tone: "error", title: "AI error", sub: e.message });
    } finally {
      setSummaryBusy(false);
    }
  };

  const aiImproveExperience = async (i) => {
    const x = resume.experience[i];
    setExpBusy(b => ({ ...b, [i]: true }));
    try {
      const improved = await aiImprove("experience", x.body, {
        role:    x.role,
        company: x.company,
        period:  x.period,
      });
      updateList("experience", i, { body: improved });
      onSnack && onSnack({ tone: "success", title: "Experience improved", sub: `${x.role} at ${x.company} updated.` });
    } catch (e) {
      onSnack && onSnack({ tone: "error", title: "AI error", sub: e.message });
    } finally {
      setExpBusy(b => ({ ...b, [i]: false }));
    }
  };

  // ── Export handlers ─────────────────────────────────────────────────────
  const handlePreviewPDF = () => {
    const el = document.getElementById("resume-preview");
    if (!el) return;
    if (typeof html2pdf !== "undefined") {
      html2pdf().set({
        margin: 0.5,
        filename: (resume.name || "resume") + "_preview.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      }).from(el).outputPdf("bloburl").then(url => {
        window.open(url, "_blank");
      });
    } else {
      window.print();
    }
  };

  const handleSaveExport = () => {
    const el = document.getElementById("resume-preview");
    if (!el) return;
    if (typeof html2pdf !== "undefined") {
      setSaving(true);
      html2pdf().set({
        margin: 0.5,
        filename: (resume.name || "resume") + ".pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      }).from(el).save().then(() => {
        setSaving(false);
        onSnack && onSnack({ tone: "success", title: "Resume exported", sub: "PDF downloaded successfully." });
      });
    } else {
      window.print();
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Resume builder</h1>
          <p className="page-sub" style={{ marginBottom: 0 }}>Live preview on the right. Export when ready.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="outline" icon="eye" onClick={handlePreviewPDF}>Preview as PDF</Button>
          <Button variant="primary" icon="check" onClick={handleSaveExport} disabled={saving}>
            {saving
              ? <React.Fragment><span className="spinner" style={{ marginRight: 6 }} />Exporting…</React.Fragment>
              : "Save & export"}
          </Button>
        </div>
      </div>

      <div className="resume-shell">
        {/* ── LEFT: Form ── */}
        <div className="card resume-form">

          {/* Header */}
          <div className="resume-section">
            <div className="resume-section-head"><h4>Header</h4></div>
            <div className="field"><label className="field-label">Name</label>
              <input className="input" value={resume.name} onChange={(e) => set("name", e.target.value)} /></div>
            <div className="field"><label className="field-label">Headline</label>
              <input className="input" value={resume.title} onChange={(e) => set("title", e.target.value)} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div className="field"><label className="field-label">Email</label>
                <input className="input" value={resume.email} onChange={(e) => set("email", e.target.value)} /></div>
              <div className="field"><label className="field-label">Phone</label>
                <input className="input" value={resume.phone} onChange={(e) => set("phone", e.target.value)} /></div>
              <div className="field"><label className="field-label">Location</label>
                <input className="input" value={resume.location} onChange={(e) => set("location", e.target.value)} /></div>
              <div className="field"><label className="field-label">Website</label>
                <input className="input" value={resume.website} onChange={(e) => set("website", e.target.value)} /></div>
            </div>
          </div>

          {/* Summary */}
          <div className="resume-section">
            <div className="resume-section-head">
              <h4>Summary</h4>
              <Button variant="ghost" size="sm" icon="sparkle" onClick={aiImproveSummary} disabled={summaryBusy}>
                {summaryBusy
                  ? <React.Fragment><span className="spinner" style={{ marginRight: 6, borderColor: "rgba(59,130,246,0.3)", borderTopColor: "var(--primary)" }} />Improving…</React.Fragment>
                  : "AI improve"}
              </Button>
            </div>
            <textarea className="textarea" value={resume.summary} onChange={(e) => set("summary", e.target.value)}
              placeholder="Write a 2–3 sentence summary, or click AI improve to generate one." />
          </div>

          {/* Experience */}
          <div className="resume-section">
            <div className="resume-section-head">
              <h4>Experience</h4>
              <Button variant="ghost" size="sm" icon="plus"
                onClick={() => addToList("experience", { role: "", company: "", period: "", body: "" })}>
                Add
              </Button>
            </div>
            {resume.experience.map((x, i) => (
              <div className="resume-entry" key={i}>
                <button className="remove-btn" onClick={() => removeFromList("experience", i)}>
                  <Icon name="x" size={12} />
                </button>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div className="field"><label className="field-label">Role</label>
                    <input className="input" value={x.role} onChange={(e) => updateList("experience", i, { role: e.target.value })} /></div>
                  <div className="field"><label className="field-label">Company</label>
                    <input className="input" value={x.company} onChange={(e) => updateList("experience", i, { company: e.target.value })} /></div>
                </div>
                <div className="field"><label className="field-label">Period</label>
                  <input className="input" value={x.period} onChange={(e) => updateList("experience", i, { period: e.target.value })} /></div>
                <div className="field">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <label className="field-label" style={{ marginBottom: 0 }}>Description</label>
                    <Button variant="ghost" size="sm" icon="sparkle"
                      onClick={() => aiImproveExperience(i)}
                      disabled={expBusy[i]}>
                      {expBusy[i]
                        ? <React.Fragment><span className="spinner" style={{ marginRight: 4, borderColor: "rgba(59,130,246,0.3)", borderTopColor: "var(--primary)" }} />Improving…</React.Fragment>
                        : "AI improve"}
                    </Button>
                  </div>
                  <textarea className="textarea" style={{ minHeight: 70 }} value={x.body}
                    onChange={(e) => updateList("experience", i, { body: e.target.value })}
                    placeholder="Describe your role and achievements, or click AI improve." />
                </div>
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="resume-section">
            <div className="resume-section-head">
              <h4>Education</h4>
              <Button variant="ghost" size="sm" icon="plus"
                onClick={() => addToList("education", { school: "", degree: "", period: "", body: "" })}>
                Add
              </Button>
            </div>
            {resume.education.map((x, i) => (
              <div className="resume-entry" key={i}>
                <button className="remove-btn" onClick={() => removeFromList("education", i)}>
                  <Icon name="x" size={12} />
                </button>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div className="field"><label className="field-label">School</label>
                    <input className="input" value={x.school} onChange={(e) => updateList("education", i, { school: e.target.value })} /></div>
                  <div className="field"><label className="field-label">Degree</label>
                    <input className="input" value={x.degree} onChange={(e) => updateList("education", i, { degree: e.target.value })} /></div>
                </div>
                <div className="field"><label className="field-label">Period</label>
                  <input className="input" value={x.period} onChange={(e) => updateList("education", i, { period: e.target.value })} /></div>
                <div className="field"><label className="field-label">Notes</label>
                  <textarea className="textarea" style={{ minHeight: 60 }} value={x.body}
                    onChange={(e) => updateList("education", i, { body: e.target.value })} /></div>
              </div>
            ))}
          </div>

          {/* Projects */}
          <div className="resume-section">
            <div className="resume-section-head">
              <h4>Projects</h4>
              <Button variant="ghost" size="sm" icon="plus"
                onClick={() => addToList("projects", { name: "", period: "", body: "" })}>
                Add
              </Button>
            </div>
            {resume.projects.map((x, i) => (
              <div className="resume-entry" key={i}>
                <button className="remove-btn" onClick={() => removeFromList("projects", i)}>
                  <Icon name="x" size={12} />
                </button>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div className="field"><label className="field-label">Name</label>
                    <input className="input" value={x.name} onChange={(e) => updateList("projects", i, { name: e.target.value })} /></div>
                  <div className="field"><label className="field-label">Period</label>
                    <input className="input" value={x.period} onChange={(e) => updateList("projects", i, { period: e.target.value })} /></div>
                </div>
                <div className="field"><label className="field-label">Description</label>
                  <textarea className="textarea" style={{ minHeight: 60 }} value={x.body}
                    onChange={(e) => updateList("projects", i, { body: e.target.value })} /></div>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="resume-section" style={{ marginBottom: 0 }}>
            <div className="resume-section-head"><h4>Skills</h4></div>
            <SkillPicker skills={resume.skills} setSkills={(s) => set("skills", s)} suggestions={window.MOCK.skills} />
          </div>
        </div>

        {/* ── RIGHT: Preview ── */}
        <div style={{ position: "sticky", top: 88 }}>
          <div className="resume-preview" id="resume-preview">
            <div className="rp-head">
              <h2 className="rp-name">{resume.name}</h2>
              <div className="rp-title">{resume.title}</div>
              <div className="rp-contact">
                {resume.email   && <span>{resume.email}</span>}
                {resume.phone   && <><span>·</span><span>{resume.phone}</span></>}
                {resume.location&& <><span>·</span><span>{resume.location}</span></>}
                {resume.website && <><span>·</span><span>{resume.website}</span></>}
              </div>
            </div>

            {resume.summary && (
              <div className="rp-section">
                <h3 className="rp-section-title">Summary</h3>
                <p className="rp-summary">{resume.summary}</p>
              </div>
            )}

            {resume.experience.length > 0 && (
              <div className="rp-section">
                <h3 className="rp-section-title">Experience</h3>
                {resume.experience.map((x, i) => (
                  <div className="rp-entry" key={i}>
                    <div className="rp-entry-head">
                      <h4 className="rp-entry-title">{x.role}</h4>
                      <span className="rp-entry-meta">{x.period}</span>
                    </div>
                    <div className="rp-entry-sub">{x.company}</div>
                    {x.body && <p className="rp-entry-body">{x.body}</p>}
                  </div>
                ))}
              </div>
            )}

            {resume.education.length > 0 && (
              <div className="rp-section">
                <h3 className="rp-section-title">Education</h3>
                {resume.education.map((x, i) => (
                  <div className="rp-entry" key={i}>
                    <div className="rp-entry-head">
                      <h4 className="rp-entry-title">{x.school}</h4>
                      <span className="rp-entry-meta">{x.period}</span>
                    </div>
                    <div className="rp-entry-sub">{x.degree}</div>
                    {x.body && <p className="rp-entry-body">{x.body}</p>}
                  </div>
                ))}
              </div>
            )}

            {resume.projects.length > 0 && (
              <div className="rp-section">
                <h3 className="rp-section-title">Projects</h3>
                {resume.projects.map((x, i) => (
                  <div className="rp-entry" key={i}>
                    <div className="rp-entry-head">
                      <h4 className="rp-entry-title">{x.name}</h4>
                      <span className="rp-entry-meta">{x.period}</span>
                    </div>
                    {x.body && <p className="rp-entry-body">{x.body}</p>}
                  </div>
                ))}
              </div>
            )}

            {resume.skills.length > 0 && (
              <div className="rp-section" style={{ marginBottom: 0 }}>
                <h3 className="rp-section-title">Skills</h3>
                <div className="rp-skills">
                  {resume.skills.map((s) => <span className="tag" key={s}>{s}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { ResumeBuilder });
