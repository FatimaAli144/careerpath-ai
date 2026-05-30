/* CareerPath AI — Modals + App Root */

// ── Compact CV Preview (used inside Apply modal) ───────────────────────────
const CVCompactPreview = ({ resume }) => (
  <div className="cv-preview">
    <div className="cv-head">
      <h3 className="cv-name">{resume.name}</h3>
      <div className="cv-title">{resume.title}</div>
      <div className="cv-contact">
        <span>{resume.email}</span><span>·</span>
        <span>{resume.phone}</span><span>·</span>
        <span>{resume.location}</span>
      </div>
    </div>
    {resume.summary && (
      <div className="cv-section">
        <h4 className="cv-section-title">Summary</h4>
        <p className="cv-summary">{resume.summary}</p>
      </div>
    )}
    {resume.experience && resume.experience.length > 0 && (
      <div className="cv-section">
        <h4 className="cv-section-title">Experience</h4>
        {resume.experience.map((x, i) => (
          <div className="cv-entry" key={i}>
            <div className="cv-entry-head">
              <h5 className="cv-entry-title">{x.role}</h5>
              <span className="cv-entry-meta">{x.period}</span>
            </div>
            <div className="cv-entry-sub">{x.company}</div>
            <p className="cv-entry-body">{x.body}</p>
          </div>
        ))}
      </div>
    )}
    {resume.education && resume.education.length > 0 && (
      <div className="cv-section">
        <h4 className="cv-section-title">Education</h4>
        {resume.education.map((x, i) => (
          <div className="cv-entry" key={i}>
            <div className="cv-entry-head">
              <h5 className="cv-entry-title">{x.school}</h5>
              <span className="cv-entry-meta">{x.period}</span>
            </div>
            <div className="cv-entry-sub">{x.degree}</div>
          </div>
        ))}
      </div>
    )}
    {resume.skills && resume.skills.length > 0 && (
      <div className="cv-section">
        <h4 className="cv-section-title">Skills</h4>
        <div className="cv-skills">
          {resume.skills.map((s) => <span className="tag" key={s}>{s}</span>)}
        </div>
      </div>
    )}
  </div>
);

// ── Apply Modal ────────────────────────────────────────────────────────────
const ApplyModal = ({ job, profile, resume, onClose, onConfirm }) => {
  const [cvSource, setCvSource] = useState("templated");
  const [uploaded, setUploaded] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) setUploaded({ name: f.name, size: f.size });
  };

  const canConfirm = cvSource === "templated" || !!uploaded;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal wide" onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "92vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexShrink: 0 }}>
          <div>
            <h3 className="modal-title">Apply to {job.title}</h3>
            <p className="modal-sub" style={{ marginBottom: 0 }}>{job.company} · {job.location}</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose} style={{ padding: "6px 8px" }}>
            <Icon name="x" size={14} />
          </button>
        </div>

        <div style={{ overflowY: "auto", flex: 1, paddingRight: 4 }}>
          <div className="info-box" style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, letterSpacing: 0.06, textTransform: "uppercase", color: "var(--text-3)", marginBottom: 10, fontFamily: "var(--font-mono)" }}>
              Application snapshot
            </div>
            <div className="info-row"><span className="key">Applicant</span>   <span className="val">{profile.fullName}</span></div>
            <div className="info-row"><span className="key">Email</span>        <span className="val">{profile.email}</span></div>
            <div className="info-row"><span className="key">University</span>   <span className="val">{profile.university || "—"}</span></div>
            <div className="info-row"><span className="key">Match score</span>  <span className="val" style={{ color: "var(--green)" }}>{job.match}%</span></div>
            <div className="info-row"><span className="key">Skills shared</span><span className="val">{(job.skills || []).slice(0, 3).join(", ")}</span></div>
          </div>

          <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <h4 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Your CV</h4>
            <span style={{ fontSize: 11.5, color: "var(--text-2)" }}>This is what {job.company} sees.</span>
          </div>

          <div className="cv-tabs">
            <button className={`cv-tab ${cvSource === "templated" ? "active" : ""}`} onClick={() => setCvSource("templated")}>
              <Icon name="sparkle" size={13} /> Use my templated CV
            </button>
            <button className={`cv-tab ${cvSource === "upload" ? "active" : ""}`} onClick={() => setCvSource("upload")}>
              <Icon name="edit" size={13} /> Upload a different CV
            </button>
          </div>

          {cvSource === "templated" ? (
            <>
              {resume && <CVCompactPreview resume={resume} />}
              <div style={{ marginTop: 8, fontSize: 11.5, color: "var(--text-2)", display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="check-circle" size={13} style={{ color: "var(--green)" }} />
                Live from your Resume builder — edits sync automatically.
              </div>
            </>
          ) : (
            <>
              {!uploaded ? (
                <>
                  <div className="cv-upload-zone" onClick={() => fileInputRef.current?.click()}>
                    <span className="icon"><Icon name="plus" size={18} /></span>
                    <h5>Drop a PDF or click to choose</h5>
                    <p>Max 5 MB · PDF, DOCX, or PNG</p>
                  </div>
                  <input ref={fileInputRef} type="file" hidden accept=".pdf,.docx,.png,.jpg" onChange={handleFile} />
                </>
              ) : (
                <div className="cv-file">
                  <span className="icon"><Icon name="book-open" size={15} /></span>
                  <div className="info">
                    <div className="name">{uploaded.name}</div>
                    <div className="size">{(uploaded.size / 1024).toFixed(1)} KB · Uploaded</div>
                  </div>
                  <button className="remove" onClick={() => setUploaded(null)}><Icon name="x" size={13} /></button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-actions" style={{ flexShrink: 0 }}>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!canConfirm}
            onClick={() => { onConfirm(job, { cvSource, uploaded }); onClose(); }}>
            Confirm apply
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Post Job Modal ─────────────────────────────────────────────────────────
const PostJobModal = ({ onClose, onPosted }) => {
  const [form, setForm] = useState({
    title: "", description: "", salary: "", location: "", skills: "", type: "Full-time",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal wide" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <h3 className="modal-title">Post a job</h3>
            <p className="modal-sub" style={{ marginBottom: 0 }}>Reach 12,000+ students across Pakistan.</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose} style={{ padding: "6px 8px" }}>
            <Icon name="x" size={14} />
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label className="field-label">Job title</label>
            <input className="input" value={form.title} placeholder="e.g. Data Analyst" onChange={(e) => set("title", e.target.value)} />
          </div>
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label className="field-label">Description</label>
            <textarea className="textarea" value={form.description} placeholder="Describe the role and responsibilities…" onChange={(e) => set("description", e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Salary range</label>
            <input className="input" value={form.salary} placeholder="e.g. ₨ 150–200k" onChange={(e) => set("salary", e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Location</label>
            <input className="input" value={form.location} placeholder="e.g. Karachi · Hybrid" onChange={(e) => set("location", e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Required skills (comma separated)</label>
            <input className="input" value={form.skills} placeholder="e.g. Python, SQL, Tableau" onChange={(e) => set("skills", e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Job type</label>
            <select className="select" value={form.type} onChange={(e) => set("type", e.target.value)}>
              <option>Full-time</option><option>Part-time</option>
              <option>Internship</option><option>Contract</option><option>Remote</option>
            </select>
          </div>
        </div>
        <div className="modal-actions">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" icon="plus" onClick={() => { onPosted && onPosted(form); onClose(); }}>
            Post job
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Helpers ────────────────────────────────────────────────────────────────

// Calculate profile strength 0–100 based on filled fields
const calculateProfileStrength = (profile, resume) => {
  if (!profile) return 0;
  let score = 0;
  if (profile.fullName?.trim())   score += 10;
  if (profile.email?.trim())      score += 10;
  if (profile.phone?.trim())      score += 10;
  if (profile.university?.trim()) score += 10;
  if (profile.degree?.trim())     score += 10;
  if ((profile.skills?.length || 0) >= 3)      score += 15;
  else if ((profile.skills?.length || 0) >= 1) score += 5;
  if (profile.targetRoles?.trim()) score += 10;
  if (profile.city?.trim())        score += 5;
  if (profile.salaryMin?.trim())   score += 5;
  if (resume?.summary?.trim())     score += 10;
  if ((resume?.experience?.length || 0) > 0) score += 5;
  return Math.min(score, 100);
};

// Build a flat profile object from a user record
const buildStudentProfile = (user) => ({
  fullName:        user.name,
  email:           user.email,
  phone:           user.profile?.phone        || "",
  city:            user.profile?.city         || "",
  dob:             user.profile?.dob          || "",
  university:      user.profile?.university   || "",
  degree:          user.profile?.degree       || "",
  gradYear:        user.profile?.gradYear     || "",
  cgpa:            user.profile?.cgpa         || "",
  skills:          user.profile?.skills       || [],
  roleTypes:       user.profile?.roleTypes    || [],
  workMode:        user.profile?.workMode     || "Hybrid",
  targetRoles:     user.profile?.targetRoles  || "",
  salaryMin:       user.profile?.salaryMin    || "",
  relocate:        user.profile?.relocate     || false,
  profileStrength: 0, // will be updated when resume is available
});

// Build a blank resume pre-filled with profile data
const buildDefaultResume = (profile) => ({
  name:       profile.fullName,
  title:      profile.degree ? `${profile.degree} Student` : "Student",
  email:      profile.email,
  phone:      profile.phone || "",
  location:   profile.city ? `${profile.city}, Pakistan` : "Pakistan",
  website:    "",
  summary:    "",
  skills:     profile.skills || [],
  education:  profile.university
    ? [{ school: profile.university, degree: profile.degree || "", period: `${parseInt(profile.gradYear) - 4 || "—"} — ${profile.gradYear || "Present"}`, body: profile.cgpa ? `CGPA ${profile.cgpa}` : "" }]
    : [],
  experience: [],
  projects:   [],
});

// ── App Root ───────────────────────────────────────────────────────────────
const App = () => {
  const [screen,         setScreen]         = useState("splash");
  const [currentUser,    setCurrentUser]    = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [resume,         setResumeState]    = useState(null);
  const [savedJobs,      setSavedJobs]      = useState([]);
  const [appliedJobs,    setAppliedJobs]    = useState([]);
  const [allJobs,        setAllJobs]        = useState(window.MOCK.jobs);
  const [applyJob,       setApplyJob]       = useState(null);
  const [postJob,        setPostJob]        = useState(false);
  const [snacks,         setSnacks]         = useState([]);
  const snackIdRef = useRef(0);

  // ── Snackbar helpers ──
  const pushSnack = (s) => {
    const id = ++snackIdRef.current;
    setSnacks(cur => [...cur, { id, ...s }]);
    setTimeout(() => setSnacks(cur => cur.filter(x => x.id !== id)), 4200);
  };
  const dismissSnack = (id) => setSnacks(cur => cur.filter(x => x.id !== id));

  // ── Load a user into app state and navigate to their screen ──
  const loadUser = (user) => {
    setCurrentUser(user);
    if (user.role === "student") {
      const baseProfile = buildStudentProfile(user);
      const res = user.resume || buildDefaultResume(baseProfile);
      const profile = { ...baseProfile, profileStrength: calculateProfileStrength(baseProfile, res) };
      setStudentProfile(profile);
      setResumeState(res);
      setSavedJobs(user.savedJobs   || []);
      setAppliedJobs(user.appliedJobs || []);
      setScreen(user.onboarded ? "student" : "onboarding-student");
    } else if (user.role === "admin") {
      setScreen("admin");
    } else if (user.role === "employer") {
      setScreen(user.onboarded ? "employer" : "onboarding-employer");
    }
  };

  // ── On first mount: init auth, restore session, load dataset ──
  useEffect(() => {
    window.LocalAuth.init();
    const user = window.LocalAuth.getCurrentUser();
    if (user) loadUser(user);

    // Fetch full job dataset from server (Kaggle CSV)
    fetch("/api/dataset")
      .then(r => r.json())
      .then(rows => {
        if (!Array.isArray(rows) || rows.length === 0) return;
        const transformed = rows.map(r => ({
          id:       r.id,
          title:    r.title,
          company:  r.company,
          location: r.location,
          city:     r.city || "",
          skills:   (r.skills || "").split(",").map(s => s.trim()).filter(Boolean),
          salary:   r.salary || "₨ Negotiable",
          match:    parseInt(r.match) || 80,
          type:     r.type || "Full-time",
          posted:   r.posted || "1 week ago",
          experience: r.experience || "",
          description: r.description || "",
        }));
        setAllJobs(transformed);
        window.ALL_JOBS = transformed; // shared with admin/employer helpers
      })
      .catch(() => { window.ALL_JOBS = window.MOCK.jobs; });
  }, []);

  // ── Recompute profileStrength when resume changes ──
  useEffect(() => {
    if (studentProfile) {
      const strength = calculateProfileStrength(studentProfile, resume);
      setStudentProfile((p) => p ? { ...p, profileStrength: strength } : p);
    }
  }, [resume]);

  // ── Auth success callback (login or signup) ──
  const handleAuthSuccess = (user) => loadUser(user);

  // ── Onboarding completion ──
  const completeStudentOnboarding = (data) => {
    const updated = window.LocalAuth.updateUser(currentUser.id, {
      onboarded: true,
      name:      data.fullName,
      profile:   data,
    });
    const baseProfile = buildStudentProfile(updated);
    const res         = buildDefaultResume(baseProfile);
    const profile     = { ...baseProfile, profileStrength: calculateProfileStrength(baseProfile, res) };
    setStudentProfile(profile);
    setResumeState(res);
    window.LocalAuth.updateUser(updated.id, { resume: res });
    setCurrentUser(updated);
    setScreen("student");
    pushSnack({ tone: "success", title: "Welcome to CareerPath AI", sub: "Your AI advisor is ready — start with Career chat." });
  };

  const completeEmployerOnboarding = (data) => {
    const updated = window.LocalAuth.updateUser(currentUser.id, {
      onboarded: true,
      name:      data.contactName,
      profile:   data,
    });
    setCurrentUser(updated);
    setScreen("employer");
    pushSnack({ tone: "success", title: "Account ready", sub: "You can post jobs right away." });
  };

  // ── Save / Apply — persist to localStorage ──
  const toggleSave = (job) => {
    setSavedJobs(s => {
      const exists = s.find(j => j.id === job.id);
      const next   = exists ? s.filter(j => j.id !== job.id) : [...s, job];
      window.LocalAuth.updateUser(currentUser.id, { savedJobs: next });
      pushSnack({ tone: "success",
        title: exists ? "Removed from saved jobs" : "Saved for later",
        sub:   job.title + " · " + job.company,
      });
      return next;
    });
  };

  const handleApply = (job, payload) => {
    if (appliedJobs.find(j => j.id === job.id)) return;
    const entry = {
      ...job,
      appliedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: "Applied",
      tone:   "blue",
    };
    const next = [...appliedJobs, entry];
    setAppliedJobs(next);
    window.LocalAuth.updateUser(currentUser.id, { appliedJobs: next });
    const cvNote = payload.cvSource === "upload" && payload.uploaded
      ? `Sent ${payload.uploaded.name} to ${job.company}.`
      : `Sent your templated CV to ${job.company}.`;
    pushSnack({ tone: "success", title: "Application sent", sub: cvNote });
  };

  // ── Profile update — persist to localStorage ──
  const handleProfileUpdate = (newProfileData) => {
    const newProfile = { ...newProfileData, profileStrength: calculateProfileStrength(newProfileData, resume) };
    setStudentProfile(newProfile);
    window.LocalAuth.updateUser(currentUser.id, { profile: newProfile, name: newProfile.fullName });
  };

  // ── Resume update — persist to localStorage ──
  const handleResumeUpdate = (setter) => {
    setResumeState(prev => {
      const next = typeof setter === "function" ? setter(prev) : setter;
      window.LocalAuth.updateUser(currentUser.id, { resume: next });
      return next;
    });
  };

  const handlePostedJob = (form) => {
    const company = currentUser?.profile?.company || currentUser?.name || "";
    const newJob = {
      id:          `posted_${Date.now()}`,
      title:       form.title,
      company,
      location:    form.location || `${company} · On-site`,
      city:        (form.location || "").split("·")[0].trim() || "Pakistan",
      skills:      (form.skills || "").split(",").map(s => s.trim()).filter(Boolean),
      salary:      form.salary || "₨ Negotiable",
      type:        form.type || "Full-time",
      posted:      "Just now",
      status:      "Open",
      tone:        "green",
      applicants:  0,
      description: form.description || "",
    };
    const postedJobs = [...(currentUser.postedJobs || []), newJob];
    const updated = window.LocalAuth.updateUser(currentUser.id, { postedJobs });
    setCurrentUser(updated);
    pushSnack({ tone: "success", title: "Job posted", sub: `"${form.title}" is now live — students can apply.` });
  };

  const handleLogout = () => {
    window.LocalAuth.logout();
    setCurrentUser(null);
    setStudentProfile(null);
    setResumeState(null);
    setSavedJobs([]);
    setAppliedJobs([]);
    setScreen("auth");
  };

  // ── Header user ──
  const headerUser = currentUser
    ? {
        name:     currentUser.name,
        initials: currentUser.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
      }
    : { name: "", initials: "" };

  return (
    <>
      {screen === "splash" && <SplashScreen onStart={() => setScreen("auth")} />}
      {screen === "auth"   && <AuthScreen onSuccess={handleAuthSuccess} />}

      {screen === "onboarding-student" && (
        <StudentOnboarding onDone={completeStudentOnboarding}
          initialData={{ name: currentUser?.name, email: currentUser?.email }} />
      )}
      {screen === "onboarding-employer" && (
        <EmployerOnboarding onDone={completeEmployerOnboarding}
          initialData={{ name: currentUser?.name, email: currentUser?.email }} />
      )}

      {(screen === "student" || screen === "admin" || screen === "employer") && (
        <div className="app">
          <Header role={screen} user={headerUser} onLogout={handleLogout} />

          {screen === "student" && studentProfile && (
            <StudentDashboard
              profile={studentProfile}
              onProfileUpdate={handleProfileUpdate}
              savedJobs={savedJobs}
              appliedJobs={appliedJobs}
              onApply={setApplyJob}
              onSave={toggleSave}
              resume={resume}
              setResume={handleResumeUpdate}
              onSnack={pushSnack}
              allJobs={allJobs}
            />
          )}
          {screen === "admin"    && <AdminDashboard allJobs={allJobs} />}
          {screen === "employer" && <EmployerDashboard onPostJobOpen={() => setPostJob(true)} user={currentUser} allJobs={allJobs} />}
        </div>
      )}

      {applyJob && (
        <ApplyModal
          job={applyJob}
          profile={studentProfile}
          resume={resume}
          onClose={() => setApplyJob(null)}
          onConfirm={handleApply}
        />
      )}
      {postJob && <PostJobModal onClose={() => setPostJob(false)} onPosted={handlePostedJob} />}

      <SnackbarStack items={snacks} onDismiss={dismissSnack} />
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
