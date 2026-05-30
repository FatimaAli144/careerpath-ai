/* CareerPath AI — Onboarding wizards (student + employer) */

// ===== Skill picker (used in student onboarding + edit profile) =====
const SkillPicker = ({ skills, setSkills, suggestions = [] }) => {
  const [input, setInput] = useState("");
  const add = (s) => {
    const v = s.trim();
    if (!v || skills.includes(v)) return;
    setSkills([...skills, v]);
    setInput("");
  };
  const remove = (s) => setSkills(skills.filter((x) => x !== s));
  const filtered = suggestions.filter((s) => !skills.includes(s)).slice(0, 10);

  return (
    <div>
      <div className="skill-picker" onClick={(e) => {
        if (e.target.classList.contains("skill-picker")) e.currentTarget.querySelector("input").focus();
      }}>
        {skills.map((s) => (
          <span className="chip" key={s}>
            {s}
            <button onClick={() => remove(s)} aria-label={`Remove ${s}`}>×</button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(input); }
            else if (e.key === "Backspace" && !input && skills.length) remove(skills[skills.length - 1]);
          }}
          placeholder={skills.length ? "Add another…" : "Type a skill and press Enter…"}
        />
      </div>
      {filtered.length > 0 && (
        <div className="skill-suggestions">
          {filtered.map((s) => (
            <button key={s} className="suggestion" onClick={() => add(s)}>+ {s}</button>
          ))}
        </div>
      )}
    </div>
  );
};

// ===== Student Onboarding =====
const StudentOnboarding = ({ onDone, initialData = {} }) => {
  const M = window.MOCK;
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    fullName: initialData.name || "",
    phone: "",
    city: "Lahore",
    dob: "",
    university: M.universities[0],
    degree: "",
    gradYear: "",
    cgpa: "",
    skills: [],
    roleTypes: [],
    workMode: "",
    targetRoles: "",
    salaryMin: "",
    relocate: false,
  });
  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const steps = [
    { key: "personal", label: "About you" },
    { key: "education", label: "Education" },
    { key: "skills", label: "Skills" },
    { key: "preferences", label: "Preferences" },
  ];

  const isLast = step === steps.length - 1;
  const next = () => isLast ? onDone(data) : setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div className="onboarding">
      <div className="onb-card fade-up">
        <aside className="onb-rail">
          <div className="onb-rail-brand">
            <span className="brand-mark"><Icon name="compass" size={18} /></span>
            <span>CareerPath AI</span>
          </div>
          <div>
            <h2>Let's set up your profile.</h2>
            <p>This is what the AI advisor uses to match you with roles. Takes about a minute — you can edit any of it later.</p>
          </div>
          <div className="onb-steps">
            {steps.map((s, i) => (
              <div key={s.key} className={`onb-step ${i === step ? "current" : i < step ? "done" : ""}`}>
                <span className="num">{i < step ? <Icon name="check" size={11} /> : i + 1}</span>
                <span className="onb-step-label">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="onb-rail-foot">SDG 8 · VISION 2030 · 2035</div>
        </aside>

        <div className="onb-body">
          {step === 0 && (
            <>
              <div className="onb-eyebrow">Step 1 of 4</div>
              <h1 className="onb-title">About you</h1>
              <p className="onb-sub">Basic details so employers know who they're looking at. We never share your phone publicly.</p>
              <div className="onb-form grid-2">
                <div className="field field-full">
                  <label className="field-label">Full name</label>
                  <input className="input" value={data.fullName} onChange={(e) => set("fullName", e.target.value)} />
                </div>
                <div className="field">
                  <label className="field-label">Phone</label>
                  <input className="input" value={data.phone} onChange={(e) => set("phone", e.target.value)} />
                </div>
                <div className="field">
                  <label className="field-label">Date of birth</label>
                  <input className="input" type="date" value={data.dob} onChange={(e) => set("dob", e.target.value)} />
                </div>
                <div className="field field-full">
                  <label className="field-label">Current city</label>
                  <select className="select" value={data.city} onChange={(e) => set("city", e.target.value)}>
                    {M.cities.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="onb-eyebrow">Step 2 of 4</div>
              <h1 className="onb-title">Your education</h1>
              <p className="onb-sub">Most recent or current — the AI advisor uses this to anchor entry-level matches.</p>
              <div className="onb-form grid-2">
                <div className="field field-full">
                  <label className="field-label">University</label>
                  <select className="select" value={data.university} onChange={(e) => set("university", e.target.value)}>
                    {M.universities.map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div className="field field-full">
                  <label className="field-label">Degree</label>
                  <input className="input" value={data.degree} onChange={(e) => set("degree", e.target.value)} />
                </div>
                <div className="field">
                  <label className="field-label">Graduation year</label>
                  <input className="input" value={data.gradYear} onChange={(e) => set("gradYear", e.target.value)} />
                </div>
                <div className="field">
                  <label className="field-label">CGPA <span style={{ color: "var(--text-3)", fontWeight: 400 }}>(optional)</span></label>
                  <input className="input" value={data.cgpa} onChange={(e) => set("cgpa", e.target.value)} />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="onb-eyebrow">Step 3 of 4</div>
              <h1 className="onb-title">What can you do?</h1>
              <p className="onb-sub">Add 4–10 skills you'd be comfortable using on day one of a job. Don't pad — honesty makes the matches better.</p>
              <SkillPicker skills={data.skills} setSkills={(s) => set("skills", s)} suggestions={M.skills} />
            </>
          )}

          {step === 3 && (
            <>
              <div className="onb-eyebrow">Step 4 of 4</div>
              <h1 className="onb-title">What are you looking for?</h1>
              <p className="onb-sub">The advisor uses this to filter and rank roles. You can change it any time.</p>
              <div className="onb-form">
                <div className="field">
                  <label className="field-label">Role type</label>
                  <div className="option-grid cols-3">
                    {["Full-time", "Internship", "Part-time"].map((t) => {
                      const on = data.roleTypes.includes(t);
                      return (
                        <button key={t}
                          className={`option-card ${on ? "active" : ""}`}
                          onClick={() => {
                            const list = on ? data.roleTypes.filter((x) => x !== t) : [...data.roleTypes, t];
                            set("roleTypes", list);
                          }}>
                          <span className="opt-title">{t}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="field">
                  <label className="field-label">Work mode</label>
                  <div className="option-grid cols-3">
                    {["On-site", "Hybrid", "Remote"].map((t) => (
                      <button key={t}
                        className={`option-card ${data.workMode === t ? "active" : ""}`}
                        onClick={() => set("workMode", t)}>
                        <span className="opt-title">{t}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label className="field-label">Target roles (comma separated)</label>
                  <input className="input" value={data.targetRoles} onChange={(e) => set("targetRoles", e.target.value)} />
                </div>
                <div className="field">
                  <label className="field-label">Minimum expected salary <span style={{ color: "var(--text-3)", fontWeight: 400 }}>(₨ thousands / month)</span></label>
                  <input className="input" value={data.salaryMin} onChange={(e) => set("salaryMin", e.target.value)} />
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                  <input type="checkbox" checked={data.relocate} onChange={(e) => set("relocate", e.target.checked)} />
                  Open to relocation
                </label>
              </div>
            </>
          )}

          <div className="onb-actions">
            <span className="onb-progress-text">{step + 1} / {steps.length}</span>
            <div style={{ display: "flex", gap: 8 }}>
              {step > 0 && <Button variant="outline" onClick={back}>Back</Button>}
              <Button variant="primary" onClick={next}>{isLast ? "Finish setup →" : "Continue"}</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== Employer Onboarding =====
const EmployerOnboarding = ({ onDone, initialData = {} }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    company: "",
    industry: "Technology",
    size: "51–200",
    hq: "Karachi",
    website: "",
    contactName: initialData.name || "",
    contactRole: "",
    workEmail: initialData.email || "",
    rolesHired: [],
    targetCities: [],
  });
  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const steps = [
    { key: "company", label: "Company" },
    { key: "contact", label: "Your details" },
    { key: "hiring", label: "Hiring focus" },
  ];
  const isLast = step === steps.length - 1;
  const next = () => isLast ? onDone(data) : setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div className="onboarding">
      <div className="onb-card fade-up">
        <aside className="onb-rail">
          <div className="onb-rail-brand">
            <span className="brand-mark"><Icon name="compass" size={18} /></span>
            <span>CareerPath AI</span>
          </div>
          <div>
            <h2>Set up your hiring profile.</h2>
            <p>Tell us about your company so we can route the right candidates to your jobs and verify your account.</p>
          </div>
          <div className="onb-steps">
            {steps.map((s, i) => (
              <div key={s.key} className={`onb-step ${i === step ? "current" : i < step ? "done" : ""}`}>
                <span className="num">{i < step ? <Icon name="check" size={11} /> : i + 1}</span>
                <span className="onb-step-label">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="onb-rail-foot">EMPLOYER · PAKISTAN</div>
        </aside>

        <div className="onb-body">
          {step === 0 && (
            <>
              <div className="onb-eyebrow">Step 1 of 3</div>
              <h1 className="onb-title">Your company</h1>
              <p className="onb-sub">Public details that appear on your job listings.</p>
              <div className="onb-form grid-2">
                <div className="field field-full">
                  <label className="field-label">Company name</label>
                  <input className="input" value={data.company} onChange={(e) => set("company", e.target.value)} />
                </div>
                <div className="field">
                  <label className="field-label">Industry</label>
                  <select className="select" value={data.industry} onChange={(e) => set("industry", e.target.value)}>
                    <option>Technology</option><option>FMCG</option><option>Financial Services</option>
                    <option>Healthcare</option><option>Education</option><option>Logistics</option>
                    <option>Telecom</option><option>Other</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">Company size</label>
                  <select className="select" value={data.size} onChange={(e) => set("size", e.target.value)}>
                    <option>1–10</option><option>11–50</option><option>51–200</option>
                    <option>201–500</option><option>501–1000</option><option>1000+</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">HQ city</label>
                  <select className="select" value={data.hq} onChange={(e) => set("hq", e.target.value)}>
                    {window.MOCK.cities.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">Website</label>
                  <input className="input" value={data.website} onChange={(e) => set("website", e.target.value)} />
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="onb-eyebrow">Step 2 of 3</div>
              <h1 className="onb-title">Who's signing up?</h1>
              <p className="onb-sub">We'll use your work email to verify the account within 1–2 business days.</p>
              <div className="onb-form grid-2">
                <div className="field">
                  <label className="field-label">Your name</label>
                  <input className="input" value={data.contactName} onChange={(e) => set("contactName", e.target.value)} />
                </div>
                <div className="field">
                  <label className="field-label">Your role</label>
                  <input className="input" value={data.contactRole} onChange={(e) => set("contactRole", e.target.value)} />
                </div>
                <div className="field field-full">
                  <label className="field-label">Work email</label>
                  <input className="input" type="email" value={data.workEmail} onChange={(e) => set("workEmail", e.target.value)} />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="onb-eyebrow">Step 3 of 3</div>
              <h1 className="onb-title">What are you hiring for?</h1>
              <p className="onb-sub">We use these to pre-route candidates as soon as your account is verified.</p>
              <div className="onb-form">
                <div className="field">
                  <label className="field-label">Roles you typically hire</label>
                  <SkillPicker
                    skills={data.rolesHired}
                    setSkills={(s) => set("rolesHired", s)}
                    suggestions={["Data Analyst", "Frontend Engineer", "Backend Engineer", "Product Designer", "ML Engineer", "Marketing Analyst", "DevOps Engineer", "QA Engineer"]}
                  />
                </div>
                <div className="field">
                  <label className="field-label">Cities you hire in</label>
                  <SkillPicker
                    skills={data.targetCities}
                    setSkills={(s) => set("targetCities", s)}
                    suggestions={window.MOCK.cities}
                  />
                </div>
              </div>
            </>
          )}

          <div className="onb-actions">
            <span className="onb-progress-text">{step + 1} / {steps.length}</span>
            <div style={{ display: "flex", gap: 8 }}>
              {step > 0 && <Button variant="outline" onClick={back}>Back</Button>}
              <Button variant="primary" onClick={next}>{isLast ? "Enter dashboard →" : "Continue"}</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { SkillPicker, StudentOnboarding, EmployerOnboarding });
