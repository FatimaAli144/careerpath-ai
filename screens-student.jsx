/* CareerPath AI — Student Dashboard */

const StudentSidebar = ({ current, onSelect, profile, savedCount, appliedCount }) => {
  const initials = profile.fullName ? profile.fullName.split(" ").map(w => w[0]).join("").slice(0, 2) : "??";
  const skills = (profile.skills || []).slice(0, 4);

  const navItems = [
    { id: "chat",         label: "Career chat",    icon: "chat",      badge: "AI" },
    { id: "jobs",         label: "Browse jobs",    icon: "briefcase"              },
    { id: "saved",        label: "Saved jobs",     icon: "bookmark",  count: savedCount   },
    { id: "applications", label: "Applications",   icon: "list",      count: appliedCount },
    { id: "resume",       label: "Resume builder", icon: "edit"                   },
    { id: "profile",      label: "My profile",     icon: "user"                   },
  ];

  return (
    <aside className="sidebar">
      <div className="profile-card">
        <div className="who">
          <Avatar initials={initials} size="lg" />
          <div className="text">
            <div className="name">{profile.fullName || "—"}</div>
            <div className="meta">{profile.university || "Not set"}</div>
          </div>
        </div>
        {skills.length > 0 && <TagsRow tags={skills} tone="blue" />}
        <Progress label="Profile strength" value={profile.profileStrength || 30} tone="green" />
      </div>

      <div>
        <div className="nav-section-label">Workspace</div>
        <nav className="nav-list">
          {navItems.map((it) => (
            <div key={it.id}
              className={`nav-item ${current === it.id ? "active" : ""}`}
              onClick={() => onSelect(it.id)}>
              <Icon name={it.icon} size={16} className="nav-icon" />
              <span style={{ flex: 1 }}>{it.label}</span>
              {it.badge && (
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 9.5, padding: "2px 6px",
                  borderRadius: 999, background: "var(--primary-50)", color: "var(--primary-600)",
                }}>{it.badge}</span>
              )}
              {it.count > 0 && (
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 11,
                  color: current === it.id ? "var(--primary-600)" : "var(--text-3)",
                }}>{it.count}</span>
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
};

// ── Career Chat — persists across tab switches ─────────────────────────────
const ChatPage = ({ onApply, onSave, savedSet, appliedSet, profile, allJobs, msgs, setMsgs }) => {
  const [draft,    setDraft]    = useState("");
  const [typing,   setTyping]   = useState(false);
  const [sendBusy, setSendBusy] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs, typing]);

  const sendMessage = async (text) => {
    if (!text.trim() || sendBusy) return;
    const userMsg = { from: "user", text };
    setMsgs((m) => [...m, userMsg]);
    setDraft("");
    setTyping(true);
    setSendBusy(true);

    // Build conversation history (text only — job cards are visual only)
    const history = [...msgs, userMsg]
      .filter((m) => m.text)
      .map((m) => ({ role: m.from === "user" ? "user" : "assistant", content: m.text }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, profile, jobs: allJobs }),
      });
      const data = await res.json();
      setTyping(false);
      setSendBusy(false);
      if (data.error) {
        setMsgs((m) => [...m, { from: "ai", text: `Error: ${data.error}` }]);
        return;
      }
      const replyText = data.text || "Sorry, something went wrong.";
      // Look up job objects for any returned IDs
      const suggestedJobs = (data.jobIds || [])
        .map(id => allJobs.find(j => j.id === id))
        .filter(Boolean);
      setMsgs((m) => [...m, { from: "ai", text: replyText, jobs: suggestedJobs.length ? suggestedJobs : undefined }]);
    } catch (err) {
      setTyping(false);
      setSendBusy(false);
      setMsgs((m) => [...m, { from: "ai", text: "Could not reach the AI server. Make sure `npm start` is running and your API key is set in `.env`." }]);
    }
  };

  const renderBubble = (text) =>
    text.split("\n").map((line, li) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <React.Fragment key={li}>
          {li > 0 && <br />}
          {parts.map((p, i) =>
            p.startsWith("**")
              ? <strong key={i}>{p.slice(2, -2)}</strong>
              : <React.Fragment key={i}>{p}</React.Fragment>
          )}
        </React.Fragment>
      );
    });

  return (
    <div className="chat-wrap">
      <div className="chat-card">
        <div className="chat-header">
          <Avatar initials="AI" tone={{ bg: "var(--primary-50)", fg: "var(--primary-600)" }} />
          <div style={{ flex: 1 }}>
            <div className="name">Career advisor</div>
            <div className="meta"><span className="chat-online-dot" /> online · trained on Pakistan job market</div>
          </div>
          <span className="pill pill-blue"><Icon name="sparkle" size={11} /> AI</span>
        </div>

        <div className="chat-body" ref={bodyRef}>
          {msgs.map((m, i) => (
            <div key={i} className={`bubble-row ${m.from}`}>
              <div className={`bubble ${m.from}`}>
                {m.text && <div>{renderBubble(m.text)}</div>}
                {m.jobs && m.jobs.map((j) => (
                  <div className="chat-jobcard" key={j.id}>
                    <div className="head">
                      <div>
                        <h4 className="title">{j.title}</h4>
                        <p className="company">{j.company} · {j.location}</p>
                      </div>
                      <span className="match">{j.match}%</span>
                    </div>
                    <div className="body">
                      {j.skills.map((s) => <Tag key={s} tone="blue">{s}</Tag>)}
                      <Tag tone="amber">{j.salary}</Tag>
                    </div>
                    <div className="actions">
                      <Button variant="primary" size="sm"
                        disabled={appliedSet[j.id]}
                        onClick={() => onApply(j)}>
                        {appliedSet[j.id] ? "Applied ✓" : "Apply now"}
                      </Button>
                      <Button variant="outline" size="sm" icon={savedSet[j.id] ? "check" : "bookmark"}
                        onClick={() => onSave(j)}>
                        {savedSet[j.id] ? "Saved" : "Save"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {typing && (
            <div className="bubble-row ai">
              <div className="bubble ai" style={{ display: "flex", gap: 4, padding: "12px 14px" }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--text-3)", animation: "typing-dot 1.2s infinite", animationDelay: "0s" }} />
                <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--text-3)", animation: "typing-dot 1.2s infinite", animationDelay: "0.2s" }} />
                <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--text-3)", animation: "typing-dot 1.2s infinite", animationDelay: "0.4s" }} />
              </div>
            </div>
          )}
        </div>

        <div className="quick-chips">
          {[
            "What jobs match my skills?",
            "What skills am I missing?",
            "Give me a 90-day career plan",
            "Help me write my CV summary",
            "Which companies should I target?",
            "How do I prepare for interviews?",
          ].map((q, i) => (
            <button key={i} className="chip" onClick={() => sendMessage(q)}>{q}</button>
          ))}
        </div>

        <div className="chat-input-row">
          <input className="chat-input" placeholder="Ask anything about your career path…"
            value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(draft)} />
          <button className="send-btn" onClick={() => sendMessage(draft)} disabled={sendBusy}>
            {sendBusy ? <span className="spinner" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} /> : <Icon name="send" size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Browse Jobs ────────────────────────────────────────────────────────────
const JobsPage = ({ onApply, onSave, savedSet, appliedSet, appliedJobs, allJobs }) => {
  const [search,     setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const jobTypes = ["All", "Full-time", "Internship", "Part-time", "Contract"];

  const filtered = allJobs.filter(j => {
    const q = search.toLowerCase().trim();
    const matchesSearch = !q ||
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      (j.location || "").toLowerCase().includes(q) ||
      (Array.isArray(j.skills) ? j.skills : (j.skills || "").split(","))
        .some(s => s.toLowerCase().includes(q));
    const matchesType = typeFilter === "All" || j.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div>
      <h1 className="page-title">Browse jobs</h1>
      <p className="page-sub">{filtered.length} job{filtered.length !== 1 ? "s" : ""} · search or filter to narrow down.</p>

      {/* Search + filter bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Icon name="search" size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }} />
          <input
            className="input"
            placeholder="Search by title, company or skill…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 34 }}
          />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {jobTypes.map(t => (
            <button key={t}
              onClick={() => setTypeFilter(t)}
              style={{
                padding: "7px 14px", borderRadius: "var(--r-pill)", fontSize: 12, fontWeight: 500,
                cursor: "pointer", border: "1px solid",
                background: typeFilter === t ? "var(--primary)" : "var(--surface)",
                color: typeFilter === t ? "#fff" : "var(--text-2)",
                borderColor: typeFilter === t ? "var(--primary)" : "var(--border-strong)",
                transition: "all 120ms",
              }}>
              {t}
            </button>
          ))}
        </div>
        {(search || typeFilter !== "All") && (
          <button className="btn btn-outline btn-sm" onClick={() => { setSearch(""); setTypeFilter("All"); }}>
            Clear
          </button>
        )}
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        <div className="stack-md">
          {filtered.length === 0 && (
            <Card>
              <div className="empty-state">
                <span className="icon"><Icon name="search" size={20} /></span>
                <h4>No jobs found</h4>
                <p>Try a different search term or clear the filters.</p>
              </div>
            </Card>
          )}
          {filtered.map((j) => (
            <div className="card job-card" key={j.id}>
              <div className="head">
                <div>
                  <h3 className="title">{j.title}</h3>
                  <p className="sub">{j.company} · {j.location} · {j.posted}</p>
                </div>
                <span className="match-badge">{j.match}% match</span>
              </div>
              <TagsRow tags={j.skills} tone="blue" />
              <div className="meta">
                <span className="salary-tag">{j.salary}</span>
                <span>·</span>
                <span>{j.type}</span>
              </div>
              <div className="actions">
                <Button variant="primary" size="sm"
                  disabled={appliedSet[j.id]}
                  onClick={() => onApply(j)}>
                  {appliedSet[j.id] ? "Applied ✓" : "Apply now"}
                </Button>
                <Button variant="outline" size="sm" icon={savedSet[j.id] ? "check" : "bookmark"}
                  onClick={() => onSave(j)}>
                  {savedSet[j.id] ? "Saved" : "Save"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Card title="My applications" sub={`${appliedJobs.length} applied`}>
          {appliedJobs.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>
              No applications yet — apply from a job card or the chat.
            </p>
          ) : (
            <div className="stack-sm">
              {appliedJobs.map((a, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 0",
                  borderBottom: i < appliedJobs.length - 1 ? "1px solid var(--border)" : "none",
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{a.title}</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-2)" }}>{a.company}</div>
                  </div>
                  <Pill tone={a.tone || "blue"}>{a.status || "Applied"}</Pill>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// ── Saved Jobs ─────────────────────────────────────────────────────────────
const SavedJobsPage = ({ savedJobs, onApply, onSave, appliedSet }) => {
  if (!savedJobs.length) {
    return (
      <div>
        <h1 className="page-title">Saved jobs</h1>
        <p className="page-sub">Jobs you've bookmarked for later.</p>
        <Card>
          <div className="empty-state">
            <span className="icon"><Icon name="bookmark" size={20} /></span>
            <h4>Nothing saved yet</h4>
            <p>Save a job from Browse jobs or the chat and it'll appear here.</p>
          </div>
        </Card>
      </div>
    );
  }
  return (
    <div>
      <h1 className="page-title">Saved jobs</h1>
      <p className="page-sub">{savedJobs.length} job{savedJobs.length === 1 ? "" : "s"} saved.</p>
      <div className="stack-md" style={{ maxWidth: 760 }}>
        {savedJobs.map((j) => (
          <div className="card job-card" key={j.id}>
            <div className="head">
              <div>
                <h3 className="title">{j.title}</h3>
                <p className="sub">{j.company} · {j.location} · {j.posted}</p>
              </div>
              <span className="match-badge">{j.match}% match</span>
            </div>
            <TagsRow tags={j.skills} tone="blue" />
            <div className="meta">
              <span className="salary-tag">{j.salary}</span>
              <span>·</span>
              <span>{j.type}</span>
            </div>
            <div className="actions">
              <Button variant="primary" size="sm"
                disabled={appliedSet[j.id]}
                onClick={() => onApply(j)}>
                {appliedSet[j.id] ? "Applied ✓" : "Apply now"}
              </Button>
              <Button variant="outline" size="sm" icon="x" onClick={() => onSave(j)}>Remove</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── My Profile — full-width card ───────────────────────────────────────────
const StudentProfilePage = ({ profile, onEdit }) => {
  const initials = profile.fullName
    ? profile.fullName.split(" ").map(w => w[0]).join("").slice(0, 2)
    : "??";

  return (
    <div>
      <h1 className="page-title">My profile</h1>
      <p className="page-sub">How employers see you.</p>

      <Card style={{ padding: "28px 32px" }}>
        {/* Header row: avatar + name + edit button */}
        <div style={{
          display: "flex", alignItems: "center", gap: 20,
          paddingBottom: 24, marginBottom: 24, borderBottom: "1px solid var(--border)",
        }}>
          <Avatar initials={initials} size="xl" />
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em" }}>
              {profile.fullName || "—"}
            </h2>
            <p style={{ margin: "0 0 2px", fontSize: 13.5, color: "var(--text-2)" }}>
              {profile.email}
            </p>
            {profile.university && (
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)" }}>
                {profile.university}
                {profile.degree   && ` · ${profile.degree}`}
                {profile.gradYear && ` · Class of ${profile.gradYear}`}
              </p>
            )}
          </div>
          <Button variant="primary" icon="edit" onClick={onEdit}>Edit profile</Button>
        </div>

        {/* Profile strength */}
        <div style={{ marginBottom: 28, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
          <Progress label="Profile strength" value={profile.profileStrength || 30} tone="green" />
        </div>

        {/* Two-column: Personal info + Skills & Preferences */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
          {/* Left */}
          <div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.08em",
              textTransform: "uppercase", color: "var(--text-3)", marginBottom: 16,
            }}>Personal</div>
            <div className="stat-rows">
              {profile.city     && <div className="stat-row"><span className="label">City</span>              <span className="value">{profile.city}</span></div>}
              {profile.phone    && <div className="stat-row"><span className="label">Phone</span>             <span className="value">{profile.phone}</span></div>}
              {profile.workMode && <div className="stat-row"><span className="label">Work mode</span>         <span className="value">{profile.workMode}</span></div>}
              {profile.salaryMin&& <div className="stat-row"><span className="label">Min. salary</span>       <span className="value">₨ {profile.salaryMin}k / month</span></div>}
              <div className="stat-row">
                <span className="label">Open to relocation</span>
                <span className="value">{profile.relocate ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>

          {/* Right */}
          <div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.08em",
              textTransform: "uppercase", color: "var(--text-3)", marginBottom: 16,
            }}>Skills</div>
            {profile.skills && profile.skills.length > 0
              ? <TagsRow tags={profile.skills} tone="blue" />
              : <p style={{ margin: 0, fontSize: 13, color: "var(--text-3)" }}>No skills added yet — edit your profile.</p>
            }

            {profile.targetRoles && (
              <>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.08em",
                  textTransform: "uppercase", color: "var(--text-3)", margin: "24px 0 12px",
                }}>Target roles</div>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text)" }}>{profile.targetRoles}</p>
              </>
            )}

            {profile.roleTypes && profile.roleTypes.length > 0 && (
              <>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.08em",
                  textTransform: "uppercase", color: "var(--text-3)", margin: "24px 0 12px",
                }}>Role type</div>
                <TagsRow tags={profile.roleTypes} />
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

// ── Applications ───────────────────────────────────────────────────────────
const ApplicationsPage = ({ appliedJobs }) => {
  if (!appliedJobs.length) {
    return (
      <div>
        <h1 className="page-title">My applications</h1>
        <p className="page-sub">Track all the jobs you've applied to.</p>
        <Card>
          <div className="empty-state">
            <span className="icon"><Icon name="list" size={20} /></span>
            <h4>No applications yet</h4>
            <p>Apply to jobs from Browse jobs or the Career chat.</p>
          </div>
        </Card>
      </div>
    );
  }
  return (
    <div>
      <h1 className="page-title">My applications</h1>
      <p className="page-sub">{appliedJobs.length} job{appliedJobs.length === 1 ? "" : "s"} applied to.</p>
      <Card flush style={{ overflow: "hidden" }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Job title</th>
                <th>Company</th>
                <th>Applied</th>
                <th style={{ textAlign: "right" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {appliedJobs.map((a, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{a.title}</td>
                  <td>{a.company}</td>
                  <td className="col-id">{a.appliedAt || "—"}</td>
                  <td style={{ textAlign: "right" }}><Pill tone={a.tone || "blue"}>{a.status || "Applied"}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ── Edit Profile Modal ─────────────────────────────────────────────────────
const EditProfileModal = ({ profile, onSave, onClose }) => {
  const M = window.MOCK;
  const [draft, setDraft] = useState(profile);
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal wide" onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexShrink: 0 }}>
          <div>
            <h3 className="modal-title">Edit profile</h3>
            <p className="modal-sub" style={{ marginBottom: 0 }}>Changes apply immediately.</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose} style={{ padding: "6px 8px" }}>
            <Icon name="x" size={14} />
          </button>
        </div>

        <div style={{ overflowY: "auto", flex: 1, paddingRight: 4 }}>
          <div className="resume-section">
            <div className="resume-section-head"><h4>Personal</h4></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="field"><label className="field-label">Full name</label>
                <input className="input" value={draft.fullName || ""} onChange={(e) => set("fullName", e.target.value)} /></div>
              <div className="field"><label className="field-label">Email</label>
                <input className="input" value={draft.email || ""} onChange={(e) => set("email", e.target.value)} /></div>
              <div className="field"><label className="field-label">Phone</label>
                <input className="input" value={draft.phone || ""} onChange={(e) => set("phone", e.target.value)} /></div>
              <div className="field"><label className="field-label">City</label>
                <select className="select" value={draft.city || ""} onChange={(e) => set("city", e.target.value)}>
                  {M.cities.map((c) => <option key={c}>{c}</option>)}
                </select></div>
            </div>
          </div>

          <div className="resume-section">
            <div className="resume-section-head"><h4>Education</h4></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label className="field-label">University</label>
                <select className="select" value={draft.university || ""} onChange={(e) => set("university", e.target.value)}>
                  {M.universities.map((u) => <option key={u}>{u}</option>)}
                </select></div>
              <div className="field"><label className="field-label">Degree</label>
                <input className="input" value={draft.degree || ""} onChange={(e) => set("degree", e.target.value)} /></div>
              <div className="field"><label className="field-label">Graduation year</label>
                <input className="input" value={draft.gradYear || ""} onChange={(e) => set("gradYear", e.target.value)} /></div>
            </div>
          </div>

          <div className="resume-section">
            <div className="resume-section-head"><h4>Skills</h4></div>
            <SkillPicker skills={draft.skills || []} setSkills={(s) => set("skills", s)} suggestions={M.skills} />
          </div>

          <div className="resume-section" style={{ marginBottom: 0 }}>
            <div className="resume-section-head"><h4>Preferences</h4></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="field"><label className="field-label">Work mode</label>
                <select className="select" value={draft.workMode || "Hybrid"} onChange={(e) => set("workMode", e.target.value)}>
                  <option>On-site</option><option>Hybrid</option><option>Remote</option>
                </select></div>
              <div className="field"><label className="field-label">Min. salary (₨k/month)</label>
                <input className="input" value={draft.salaryMin || ""} onChange={(e) => set("salaryMin", e.target.value)} /></div>
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label className="field-label">Target roles</label>
                <input className="input" value={draft.targetRoles || ""} onChange={(e) => set("targetRoles", e.target.value)} /></div>
            </div>
          </div>
        </div>

        <div className="modal-actions" style={{ flexShrink: 0 }}>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" icon="check" onClick={() => onSave(draft)}>Save changes</Button>
        </div>
      </div>
    </div>
  );
};

// ── Student Dashboard Shell ────────────────────────────────────────────────
const StudentDashboard = ({ profile, onProfileUpdate, savedJobs, appliedJobs, onApply, onSave, resume, setResume, onSnack, allJobs }) => {
  const [page,    setPage]    = useState("chat");
  const [editing, setEditing] = useState(false);

  // Chat messages lifted here so they persist across tab switches
  const [chatMsgs, setChatMsgs] = useState(() => {
    const firstName = profile && profile.fullName ? profile.fullName.split(" ")[0] : "there";
    const greeting = profile && profile.fullName
      ? `Hi ${firstName}! I'm your AI career advisor on CareerPath AI. Ask me anything — I can match you to jobs from our listings, identify skill gaps, help write your CV, or build a 90-day plan.`
      : `Hi! I'm your AI career advisor. Complete your profile so I can give you personalised job matches and advice. What would you like to know?`;
    return [{ from: "ai", text: greeting }];
  });

  const savedSet   = Object.fromEntries(savedJobs.map((j) => [j.id, true]));
  const appliedSet = Object.fromEntries(appliedJobs.map((j) => [j.id, true]));

  return (
    <>
      <div className="shell">
        <StudentSidebar current={page} onSelect={setPage} profile={profile}
          savedCount={savedJobs.length} appliedCount={appliedJobs.length} />
        <main className="main">
          {page === "chat"         && <ChatPage onApply={onApply} onSave={onSave} savedSet={savedSet} appliedSet={appliedSet} profile={profile} allJobs={allJobs} msgs={chatMsgs} setMsgs={setChatMsgs} />}
          {page === "jobs"         && <JobsPage onApply={onApply} onSave={onSave} savedSet={savedSet} appliedSet={appliedSet} appliedJobs={appliedJobs} allJobs={allJobs} />}
          {page === "saved"        && <SavedJobsPage savedJobs={savedJobs} onApply={onApply} onSave={onSave} appliedSet={appliedSet} />}
          {page === "applications" && <ApplicationsPage appliedJobs={appliedJobs} />}
          {page === "resume"       && <ResumeBuilder resume={resume} setResume={setResume} onSnack={onSnack} />}
          {page === "profile"      && <StudentProfilePage profile={profile} onEdit={() => setEditing(true)} />}
        </main>
      </div>

      {editing && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditing(false)}
          onSave={(p) => {
            onProfileUpdate(p);
            setEditing(false);
            onSnack && onSnack({ tone: "success", title: "Profile updated", sub: "Changes saved." });
          }}
        />
      )}
    </>
  );
};

Object.assign(window, { StudentDashboard });
