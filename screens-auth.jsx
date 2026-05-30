/* CareerPath AI — Splash + Auth Screens */

const SplashScreen = ({ onStart }) => (
  <div className="splash">
    <div className="splash-grid" />
    <svg className="splash-paths" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="pathGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <linearGradient id="pathGrad2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(147,197,253,0)" />
          <stop offset="50%" stopColor="rgba(147,197,253,0.45)" />
          <stop offset="100%" stopColor="rgba(147,197,253,0)" />
        </linearGradient>
      </defs>
      <path d="M -100 720 Q 360 360 720 540 T 1540 320" fill="none" stroke="url(#pathGrad)"  strokeWidth="1.2" />
      <path d="M -100 820 Q 460 580 800 640 T 1540 480" fill="none" stroke="url(#pathGrad2)" strokeWidth="1" />
      <path d="M -100 200 Q 360 420 760 280 T 1540 600" fill="none" stroke="url(#pathGrad)"  strokeWidth="0.9" />
      <path d="M -100 380 Q 500 220 900 380 T 1540 760" fill="none" stroke="url(#pathGrad2)" strokeWidth="0.9" />
    </svg>
    <div className="splash-glow" />

    <div className="splash-fragment f1">
      <div className="frag-head">
        <span className="frag-avatar"><Icon name="sparkle" size={12} /></span>
        <span className="frag-head-text">Career advisor</span>
      </div>
      <div style={{ fontSize: 12, lineHeight: 1.4, opacity: 0.92 }}>
        Found <strong>3 roles</strong> that match your profile — top match is a Data Analyst at Careem.
      </div>
    </div>

    <div className="splash-fragment f2">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>Data Analyst</div>
          <div style={{ fontSize: 11, opacity: 0.75, whiteSpace: "nowrap" }}>Careem · Karachi</div>
        </div>
        <span className="frag-match">94%</span>
      </div>
      <div className="frag-tagrow">
        <span className="frag-tag">Python</span>
        <span className="frag-tag">SQL</span>
        <span className="frag-tag">Tableau</span>
      </div>
    </div>

    <div className="splash-fragment f3">
      <div className="frag-head">
        <span className="frag-avatar"><Icon name="target" size={12} /></span>
        <span className="frag-head-text">Your skills</span>
      </div>
      <div className="frag-tagrow">
        <span className="frag-tag">React</span>
        <span className="frag-tag">Python</span>
        <span className="frag-tag">SQL</span>
        <span className="frag-tag">Figma</span>
        <span className="frag-tag">+4</span>
      </div>
    </div>

    <div className="splash-fragment f4">
      <div className="frag-label">Youth guided</div>
      <div className="frag-stat">12,438</div>
      <div style={{ fontSize: 11, opacity: 0.78, display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
        <Icon name="trending-up" size={11} /> +8.2% this month
      </div>
    </div>

    <div className="splash-hero">
      <div className="splash-logo">
        <svg width="112" height="112" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" />
          <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(255,255,255,0.20)" strokeWidth="1" strokeDasharray="2 4" />
          <g stroke="#fff" strokeWidth="2" strokeLinecap="round">
            <line x1="50" y1="6"  x2="50" y2="14" />
            <line x1="50" y1="86" x2="50" y2="94" />
            <line x1="6"  y1="50" x2="14" y2="50" />
            <line x1="86" y1="50" x2="94" y2="50" />
          </g>
          <path d="M50 18 L60 50 L50 82 L40 50 Z" fill="#fff" />
          <path d="M18 50 L50 40 L82 50 L50 60 Z" fill="#fff" opacity="0.4" />
          <circle cx="50" cy="50" r="3.5" fill="#3B82F6" />
        </svg>
      </div>
      <h1 className="splash-title">CareerPath <span className="ai">AI</span></h1>
      <p className="splash-tag">An AI advisor for Pakistani youth — built around SDG 8 to bridge education, industry, and a digital-first future.</p>
      <div className="splash-badges">
        <span className="splash-badge">SDG 8</span>
        <span className="splash-badge">VISION 2030</span>
        <span className="splash-badge">VISION 2035</span>
        <span className="splash-badge">DIGITAL PAKISTAN</span>
      </div>
      <div className="splash-progress">
        <div className="splash-progress-fill" />
      </div>
      <button className="splash-btn" onClick={onStart}>
        Get started <span className="arrow">→</span>
      </button>
    </div>
  </div>
);

// ── Auth Screen — real localStorage-based auth ─────────────────────────────
const AuthScreen = ({ onSuccess }) => {
  const [tab,          setTab]          = useState("login");
  const [role,         setRole]         = useState("student");
  const [name,         setName]         = useState("");
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [error,        setError]        = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);

  const clearError = () => setError("");

  const handleSubmit = () => {
    setError("");
    setLoading(true);
    setTimeout(() => {
      const result = tab === "login"
        ? window.LocalAuth.login(email, password, role)
        : window.LocalAuth.signup(name, email, password, role);
      setLoading(false);
      if (result.error) { setError(result.error); return; }
      onSuccess(result.user);
    }, 400);
  };

  return (
    <div className="auth">
      <div className="auth-card fade-up">

        {/* Left branding panel */}
        <div className="auth-left">
          <div className="auth-left-brand">
            <span className="brand-mark"><Icon name="compass" size={18} /></span>
            <span>CareerPath AI</span>
          </div>
          <div>
            <h2 className="auth-left-title">Your career, mapped.</h2>
            <p className="auth-left-sub">An AI advisor that understands the Pakistani job market and helps you close the gap between where you are and where you want to be.</p>
            {[
              "AI advisor trained on local market signals",
              "Roles and pay ranges from real employers",
              "Personalised skill gaps and learning plans",
              "Built around SDG 8 and Vision 2030 / 2035",
            ].map((f, i) => (
              <div className="auth-feature" key={i}>
                <span className="dot"><Icon name="check" size={11} /></span>
                <span>{f}</span>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, opacity: 0.7 }}>v1.0 · Pakistan</div>
        </div>

        {/* Right form panel */}
        <div className="auth-right">
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === "login"  ? "active" : ""}`}
              onClick={() => { setTab("login");  clearError(); }}>Log in</button>
            <button className={`auth-tab ${tab === "signup" ? "active" : ""}`}
              onClick={() => { setTab("signup"); clearError(); }}>Sign up</button>
          </div>

          <div className="field" style={{ marginBottom: 14 }}>
            <label className="field-label">I am a…</label>
            <div className="role-grid">
              {[
                { id: "student",  name: "Student",  icon: "graduation-cap" },
                { id: "admin",    name: "Admin",    icon: "settings"       },
                { id: "employer", name: "Employer", icon: "building"       },
              ].map((r) => (
                <div key={r.id}
                  className={`role-card ${role === r.id ? "active" : ""}`}
                  onClick={() => { setRole(r.id); clearError(); }}>
                  <Icon name={r.icon} size={22} />
                  <span className="role-name">{r.name}</span>
                </div>
              ))}
            </div>
          </div>

          {tab === "signup" && (
            <div className="field" style={{ marginBottom: 12 }}>
              <label className="field-label">Full name</label>
              <input className="input" placeholder="e.g. Zara Ahmed"
                value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}

          <div className="field" style={{ marginBottom: 12 }}>
            <label className="field-label">Email</label>
            <input className="input" type="email" placeholder="your@email.com"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="field" style={{ marginBottom: error ? 10 : 16 }}>
            <label className="field-label">Password</label>
            <div style={{ position: "relative" }}>
              <input className="input"
                style={{ paddingRight: 40 }}
                type={showPassword ? "text" : "password"}
                placeholder={tab === "signup" ? "Min. 6 characters" : ""}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
              <button type="button"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute", right: 10, top: "50%",
                  transform: "translateY(-50%)",
                  background: "none", border: "none", padding: 0,
                  cursor: "pointer", display: "flex", alignItems: "center",
                  color: "var(--text-3)", lineHeight: 1,
                }}>
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <Icon name="eye" size={16} />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: "var(--red-50)", border: "1px solid #FCA5A5",
              borderRadius: "var(--r-input)", padding: "10px 12px",
              fontSize: 12.5, color: "#B91C1C", marginBottom: 12,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <Icon name="x" size={13} strokeWidth={2.5} />
              {error}
            </div>
          )}

          <Button variant="primary" size="lg" block onClick={handleSubmit} disabled={loading}>
            {loading
              ? <React.Fragment><span className="spinner" style={{ borderTopColor: "#fff", marginRight: 8 }} />{tab === "login" ? "Signing in…" : "Creating account…"}</React.Fragment>
              : (tab === "login" ? "Sign in" : "Create account")
            }
          </Button>

          {role === "admin" && (
            <div className="demo-box" style={{ marginTop: 14 }}>
              <div className="demo-title">Default admin account</div>
              <div className="demo-line"><span>email</span><span>admin@careerpath.pk</span></div>
              <div className="demo-line"><span>password</span><span>admin123</span></div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

Object.assign(window, { SplashScreen, AuthScreen });
