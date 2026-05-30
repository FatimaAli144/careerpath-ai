/* CareerPath AI — Admin Dashboard */

// ── Helpers — compute live stats from localStorage ────────────────────────
function getAdminStats() {
  const all      = window.LocalAuth.getUsers() || [];
  const students = all.filter(u => u.role === "student");
  const employers = all.filter(u => u.role === "employer");
  const totalApps = students.reduce((n, s) => n + (s.appliedJobs || []).length, 0);
  const openJobs  = (window.MOCK.myJobs || []).filter(j => j.status === "Open").length;
  return [
    { label: "Total students",  value: students.length.toLocaleString(),  delta: students.filter(s => s.onboarded).length + " active" },
    { label: "Employers",       value: employers.length.toLocaleString(), delta: employers.filter(e => e.onboarded).length + " verified" },
    { label: "Job postings",    value: openJobs.toLocaleString(),         delta: "open right now" },
    { label: "Applications",    value: totalApps.toLocaleString(),        delta: "across all students" },
  ];
}

function getLiveSkillCloud() {
  const students = (window.LocalAuth.getUsers() || []).filter(u => u.role === "student");
  const counts = {};
  students.forEach(s => (s.profile?.skills || []).forEach(sk => { counts[sk] = (counts[sk] || 0) + 1; }));
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 15);
  return sorted.length
    ? sorted.map(([name, count]) => ({ name, count }))
    : window.MOCK.skillCloud;
}

function getLiveTopRoles() {
  const students = (window.LocalAuth.getUsers() || []).filter(u => u.role === "student");
  const counts = {};
  students.forEach(s => (s.appliedJobs || []).forEach(j => { if (j.title) counts[j.title] = (counts[j.title] || 0) + 1; }));
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  if (!sorted.length) return window.MOCK.topRoles;
  const max = sorted[0][1];
  return sorted.map(([label, value]) => ({ label, value, pct: Math.round((value / max) * 100) }));
}

function getLiveFunnel() {
  const students = (window.LocalAuth.getUsers() || []).filter(u => u.role === "student");
  const total = students.reduce((n, s) => n + (s.appliedJobs || []).length, 0);
  if (!total) return window.MOCK.applicationFunnel;
  return [
    { label: "Applied",     value: total,                      pct: 100  },
    { label: "Reviewed",    value: Math.floor(total * 0.50),   pct: 50   },
    { label: "Shortlisted", value: Math.floor(total * 0.20),   pct: 20   },
    { label: "Interview",   value: Math.floor(total * 0.075),  pct: 7.5  },
    { label: "Offer",       value: Math.floor(total * 0.025),  pct: 2.5  },
  ];
}

function getLiveUniversityCounts() {
  const students = (window.LocalAuth.getUsers() || []).filter(u => u.role === "student");
  const counts = {};
  students.forEach(s => {
    const uni = s.profile?.university;
    if (uni) counts[uni] = (counts[uni] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  if (!sorted.length) return window.MOCK.universityCounts;
  const max = sorted[0][1];
  return sorted.map(([label, value]) => ({ label, value, pct: Math.round((value / max) * 100) }));
}

// ── Admin Sidebar ─────────────────────────────────────────────────────────
const AdminSidebar = ({ current, onSelect }) => {
  const navItems = [
    { id: "overview",  label: "Overview",  icon: "grid"           },
    { id: "students",  label: "Students",  icon: "graduation-cap" },
    { id: "employers", label: "Employers", icon: "building"       },
    { id: "analytics", label: "Analytics", icon: "chart"          },
  ];

  const all      = window.LocalAuth.getUsers() || [];
  const students = all.filter(u => u.role === "student").length;
  const employers = all.filter(u => u.role === "employer").length;

  return (
    <aside className="sidebar">
      <div className="profile-card">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar initials="AD" size="lg" tone={{ bg: "#FEF3C7", fg: "#B45309" }} />
          <div>
            <div className="name">Admin console</div>
            <div className="meta">careerpath.pk</div>
          </div>
        </div>
        <div className="stat-rows">
          <div className="stat-row" style={{ padding: "6px 0" }}>
            <span className="label">Students</span>
            <span className="value">{students}</span>
          </div>
          <div className="stat-row" style={{ padding: "6px 0" }}>
            <span className="label">Employers</span>
            <span className="value">{employers}</span>
          </div>
        </div>
      </div>
      <div>
        <div className="nav-section-label">Navigate</div>
        <SidebarNav items={navItems} current={current} onSelect={onSelect} />
      </div>
    </aside>
  );
};

// ── Overview ──────────────────────────────────────────────────────────────
const AdminOverview = () => {
  const M       = window.MOCK;
  const stats   = getAdminStats();
  const cloud   = getLiveSkillCloud();
  const funnel  = getLiveFunnel();

  return (
    <div>
      <h1 className="page-title">Platform overview</h1>
      <p className="page-sub">Live snapshot from registered users.</p>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        {stats.map((s, i) => <StatCard key={i} label={s.label} value={s.value} delta={s.delta} />)}
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        <Card title="Top job roles applied" sub="From student applications">
          <BarChart data={getLiveTopRoles()} />
        </Card>

        <div className="stack-md">
          <Card title="Top skills in pool" sub="Across all student profiles">
            <div className="skills-cloud">
              {cloud.map((s, i) => {
                const big = s.count > 2;
                return (
                  <span key={i} className="tag" style={{
                    fontSize: big ? 13 : 11,
                    background: big ? "var(--primary-50)" : "#F1F5F9",
                    color: big ? "var(--primary-600)" : "var(--text-2)",
                    padding: big ? "5px 12px" : "4px 10px",
                  }}>
                    {s.name}
                    {s.count > 0 && <span style={{ opacity: 0.55, marginLeft: 4 }}>{s.count}</span>}
                  </span>
                );
              })}
            </div>
          </Card>
          <Card title="Application funnel" sub="All applications">
            <BarChart data={funnel} tone="green" />
          </Card>
        </div>
      </div>
    </div>
  );
};

// ── Students ──────────────────────────────────────────────────────────────
const AdminStudents = () => {
  const M = window.MOCK;

  const realUsers = (window.LocalAuth.getUsers() || [])
    .filter(u => u.role === "student")
    .map(u => ({
      name:       u.name || "—",
      email:      u.email || "—",
      university: u.profile?.university || "—",
      skills:     u.profile?.skills || [],
      joined:     new Date(parseInt(u.id) || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status:     u.onboarded ? "Active" : "Onboarding",
      tone:       u.onboarded ? "green" : "amber",
      real:       true,
    }));

  const rows = realUsers.length
    ? realUsers
    : M.studentTable.map(s => ({ ...s, real: false }));

  return (
    <div>
      <h1 className="page-title">Students</h1>
      <p className="page-sub">
        {realUsers.length
          ? `${realUsers.length} registered student${realUsers.length !== 1 ? "s" : ""}.`
          : "No students registered yet — showing sample data."}
      </p>
      <Card flush style={{ overflow: "hidden" }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>University</th>
                <th>Skills</th>
                <th>Joined</th>
                <th style={{ textAlign: "right" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s, i) => (
                <tr key={i} style={!s.real ? { opacity: 0.5 } : {}}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar initials={s.name.split(" ").map(w => w[0]).join("").slice(0, 2)} size="sm" />
                      <div className="stack">
                        <span className="primary">{s.name}</span>
                        <span className="secondary">{s.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>{s.university}</td>
                  <td><div className="tag-row">{(s.skills || []).map((t, k) => <Tag key={k} tone="blue">{t}</Tag>)}</div></td>
                  <td className="col-id">{s.joined}</td>
                  <td style={{ textAlign: "right" }}><Pill tone={s.tone}>{s.status}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ── Employers ─────────────────────────────────────────────────────────────
const AdminEmployers = () => {
  const M = window.MOCK;

  // Count applicants per employer company
  const allStudents = (window.LocalAuth.getUsers() || []).filter(u => u.role === "student");
  const countApplicants = (company) =>
    allStudents.reduce((n, s) =>
      n + (s.appliedJobs || []).filter(j => j.company?.toLowerCase() === company?.toLowerCase()).length, 0);

  const realEmployers = (window.LocalAuth.getUsers() || [])
    .filter(u => u.role === "employer")
    .map(u => ({
      name:     u.profile?.company || u.name || "—",
      email:    u.email || "—",
      location: u.profile?.hq || "—",
      postings: (window.MOCK.myJobs || []).filter(j => j.status === "Open").length,
      applicants: countApplicants(u.profile?.company || u.name || ""),
      joined:   new Date(parseInt(u.id) || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status:   u.onboarded ? "Verified" : "Pending",
      tone:     u.onboarded ? "green" : "amber",
      real:     true,
    }));

  const rows = realEmployers.length
    ? realEmployers
    : M.employerTable.map(e => ({ ...e, applicants: "—", real: false }));

  return (
    <div>
      <h1 className="page-title">Employers</h1>
      <p className="page-sub">
        {realEmployers.length
          ? `${realEmployers.length} registered employer${realEmployers.length !== 1 ? "s" : ""}.`
          : "No employers registered yet — showing sample data."}
      </p>
      <Card flush style={{ overflow: "hidden" }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Location</th>
                <th style={{ textAlign: "right" }}>Applicants</th>
                <th>Joined</th>
                <th style={{ textAlign: "right" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e, i) => (
                <tr key={i} style={!e.real ? { opacity: 0.5 } : {}}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar initials={e.name.split(" ").map(w => w[0]).join("").slice(0, 2)} size="sm"
                        tone={{ bg: "#FEF3C7", fg: "#B45309" }} />
                      <div className="stack">
                        <span className="primary">{e.name}</span>
                        <span className="secondary">{e.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>{e.location}</td>
                  <td style={{ textAlign: "right", fontFamily: "var(--font-mono)" }}>{e.applicants}</td>
                  <td className="col-id">{e.joined}</td>
                  <td style={{ textAlign: "right" }}><Pill tone={e.tone}>{e.status}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ── Analytics ─────────────────────────────────────────────────────────────
const AdminAnalytics = () => (
  <div>
    <h1 className="page-title">Analytics</h1>
    <p className="page-sub">Trends across the talent pool.</p>
    <div className="grid-2-eq" style={{ alignItems: "start" }}>
      <Card title="Applications per role" sub="From student applications">
        <BarChart data={getLiveTopRoles()} tone="primary" />
      </Card>
      <Card title="Top contributing universities" sub="By student registration">
        <BarChart data={getLiveUniversityCounts()} tone="green" />
      </Card>
    </div>
  </div>
);

// ── Dashboard shell ───────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [page, setPage] = useState("overview");
  return (
    <div className="shell">
      <AdminSidebar current={page} onSelect={setPage} />
      <main className="main">
        {page === "overview"  && <AdminOverview />}
        {page === "students"  && <AdminStudents />}
        {page === "employers" && <AdminEmployers />}
        {page === "analytics" && <AdminAnalytics />}
      </main>
    </div>
  );
};

Object.assign(window, { AdminDashboard });
