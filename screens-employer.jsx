/* CareerPath AI — Employer Dashboard */

// ── Helpers ───────────────────────────────────────────────────────────────
function getApplicantsForCompany(company) {
  const all = window.LocalAuth.getUsers() || [];
  return all
    .filter(u => u.role === "student")
    .flatMap(student =>
      (student.appliedJobs || [])
        .filter(j => j.company?.toLowerCase() === company?.toLowerCase())
        .map(j => ({ student, appliedJob: j }))
    );
}

function getApplicantsForJob(company, jobTitle) {
  // Match on first two words of title for flexibility
  const titleKey = (jobTitle || "").toLowerCase().split(" ").slice(0, 2).join(" ");
  return getApplicantsForCompany(company).filter(a =>
    a.appliedJob.title?.toLowerCase().includes(titleKey)
  );
}

// ── View Applicants Modal ─────────────────────────────────────────────────
const ViewApplicantsModal = ({ job, company, onClose }) => {
  const applicants = getApplicantsForJob(company, job.title);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal wide" onClick={e => e.stopPropagation()}
        style={{ maxHeight: "85vh", display: "flex", flexDirection: "column" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexShrink: 0 }}>
          <div>
            <h3 className="modal-title">Applicants — {job.title}</h3>
            <p className="modal-sub" style={{ marginBottom: 0 }}>
              {applicants.length} student{applicants.length !== 1 ? "s" : ""} applied
            </p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose} style={{ padding: "6px 8px" }}>
            <Icon name="x" size={14} />
          </button>
        </div>

        {applicants.length === 0 ? (
          <div className="empty-state">
            <span className="icon"><Icon name="users" size={20} /></span>
            <h4>No applicants yet</h4>
            <p>Students who apply to this role will appear here.</p>
          </div>
        ) : (
          <div style={{ overflowY: "auto", flex: 1 }}>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>University</th>
                    <th>Skills</th>
                    <th>Applied</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.map((a, i) => {
                    const initials = a.student.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                    return (
                      <tr key={i}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <Avatar initials={initials} size="sm" />
                            <div className="stack">
                              <span className="primary">{a.student.name}</span>
                              <span className="secondary">{a.student.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>{a.student.profile?.university || "—"}</td>
                        <td>
                          <div className="tag-row">
                            {(a.student.profile?.skills || []).slice(0, 3).map((s, k) =>
                              <Tag key={k} tone="blue">{s}</Tag>
                            )}
                          </div>
                        </td>
                        <td className="col-id">{a.appliedJob.appliedAt || "—"}</td>
                        <td style={{ textAlign: "right" }}>
                          <Button variant="ghost" size="sm">Shortlist</Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="modal-actions" style={{ flexShrink: 0 }}>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

// ── Employer Sidebar ──────────────────────────────────────────────────────
const EmployerSidebar = ({ current, onSelect, user }) => {
  const navItems = [
    { id: "talent", label: "Talent overview", icon: "users"     },
    { id: "jobs",   label: "My jobs",         icon: "briefcase" },
    { id: "sdg",    label: "SDG alignment",   icon: "target"    },
  ];

  const company   = user?.profile?.company || user?.name || "Company";
  const city      = user?.profile?.hq || "Pakistan";
  const verified  = user?.onboarded;
  const initials  = company.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const openJobs  = (window.MOCK.myJobs || []).filter(j => j.status === "Open").length;
  const appCount  = getApplicantsForCompany(company).length;

  return (
    <aside className="sidebar">
      <div className="profile-card">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar initials={initials} size="lg" tone={{ bg: "#FEF3C7", fg: "#B45309" }} />
          <div>
            <div className="name">{company}</div>
            <div className="meta">{city} · {verified ? "Verified" : "Pending"}</div>
          </div>
        </div>
        <div className="stat-rows">
          <div className="stat-row" style={{ padding: "6px 0" }}>
            <span className="label">Active jobs</span>
            <span className="value">{openJobs}</span>
          </div>
          <div className="stat-row" style={{ padding: "6px 0" }}>
            <span className="label">Applicants</span>
            <span className="value">{appCount}</span>
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

// ── Talent Overview ───────────────────────────────────────────────────────
const TalentOverview = ({ user }) => {
  const M       = window.MOCK;
  const company = user?.profile?.company || user?.name || "";
  const applicants = getApplicantsForCompany(company);

  const openJobs  = M.myJobs.filter(j => j.status === "Open").length;
  const avgMatch  = applicants.length
    ? Math.round(applicants.reduce((s, a) => s + (Number(a.appliedJob.match) || 80), 0) / applicants.length)
    : 0;

  const dynamicStats = [
    { label: "Applicants (total)", value: String(applicants.length) },
    { label: "Avg. match score",   value: applicants.length ? avgMatch + "%" : "—" },
    { label: "Active jobs",        value: String(openJobs) },
    { label: "Shortlisted",        value: "0" },
  ];

  // Skills from real applicant profiles
  const skillCounts = {};
  applicants.forEach(a =>
    (a.student.profile?.skills || []).forEach(s => { skillCounts[s] = (skillCounts[s] || 0) + 1; })
  );
  const topSkills = Object.entries(skillCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const skillsToShow = topSkills.length
    ? topSkills.map(([name], i) => ({ name, i }))
    : M.skillCloud.slice(0, 10).map((s, i) => ({ ...s, i }));

  return (
    <div>
      <h1 className="page-title">Talent overview</h1>
      <p className="page-sub">
        {company ? `Applicants and pipeline for ${company}.` : "Complete your profile to see your applicants."}
      </p>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        {dynamicStats.map((s, i) => <StatCard key={i} label={s.label} value={s.value} />)}
      </div>

      <div className="grid-2-eq" style={{ alignItems: "start", marginBottom: 20 }}>
        <Card title="Top skills in applicant pool" sub={applicants.length ? "From real applicant profiles" : "No applicants yet"}>
          <div className="skills-cloud">
            {skillsToShow.map((s, i) => (
              <span key={i} className="tag" style={{
                fontSize: i < 4 ? 13 : 11,
                background: i < 4 ? "var(--primary-50)" : "#F1F5F9",
                color: i < 4 ? "var(--primary-600)" : "var(--text-2)",
                padding: i < 4 ? "5px 12px" : "4px 10px",
              }}>{s.name}</span>
            ))}
          </div>
          {applicants.length > 0 && (
            <div style={{ marginTop: 14, padding: 12, background: "#F8FAFC", borderRadius: 8, fontSize: 12, color: "var(--text-2)" }}>
              <strong style={{ color: "var(--text)" }}>{applicants.length} student{applicants.length !== 1 ? "s" : ""}</strong> applied to your roles so far.
            </div>
          )}
        </Card>

        <Card title="Hiring pipeline" sub="Based on your real applicants">
          <BarChart data={(() => {
            const t = applicants.length;
            return [
              { label: "Applied",     value: t,                     pct: 100 },
              { label: "Reviewed",    value: Math.floor(t * 0.6),   pct: 60  },
              { label: "Shortlisted", value: Math.floor(t * 0.3),   pct: 30  },
              { label: "Interview",   value: Math.floor(t * 0.15),  pct: 15  },
              { label: "Offer",       value: Math.floor(t * 0.05),  pct: 5   },
            ];
          })()} tone="primary" />
        </Card>
      </div>

      <Card title="Recent applicants"
        sub={applicants.length ? `${applicants.length} total across your open roles` : "No applicants yet"}
        flush>
        {applicants.length === 0 ? (
          <div className="empty-state" style={{ padding: "32px 20px" }}>
            <span className="icon"><Icon name="users" size={20} /></span>
            <h4>No applicants yet</h4>
            <p>Students who apply to your jobs will appear here. Make sure your company name in your profile matches the company listed on jobs.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>University</th>
                  <th>Skills</th>
                  <th>Applied for</th>
                  <th>Applied</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((a, i) => {
                  const initials = a.student.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <tr key={i}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar initials={initials} size="sm" />
                          <div className="stack">
                            <span className="primary">{a.student.name}</span>
                            <span className="secondary">{a.student.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>{a.student.profile?.university || "—"}</td>
                      <td><div className="tag-row">{(a.student.profile?.skills || []).slice(0, 3).map((s, k) => <Tag key={k} tone="blue">{s}</Tag>)}</div></td>
                      <td style={{ fontSize: 13 }}>{a.appliedJob.title}</td>
                      <td className="col-id">{a.appliedJob.appliedAt || "—"}</td>
                      <td style={{ textAlign: "right" }}>
                        <Button variant="ghost" size="sm">Shortlist</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

// ── My Jobs ───────────────────────────────────────────────────────────────
const MyJobsPage = ({ onPostJob, user, allJobs }) => {
  const company = user?.profile?.company || user?.name || "";
  const [viewJob, setViewJob] = useState(null);

  // Jobs from the dataset matching this employer's company
  const datasetJobs = (allJobs || window.ALL_JOBS || window.MOCK.jobs || [])
    .filter(j => j.company?.toLowerCase() === company.toLowerCase());

  // Jobs posted via the modal (saved in localStorage)
  const postedJobs = (user?.postedJobs || []).map(j => ({
    ...j,
    status: j.status || "Open",
    tone:   j.tone   || "green",
  }));

  // Combine: newly posted first, then dataset jobs
  const myJobs = [...postedJobs, ...datasetJobs];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <h1 className="page-title">My jobs</h1>
          <p className="page-sub" style={{ marginBottom: 0 }}>
            {myJobs.length} listing{myJobs.length !== 1 ? "s" : ""} · {company || "your company"}.
          </p>
        </div>
        <Button variant="primary" icon="plus" onClick={onPostJob}>Post a job</Button>
      </div>

      {myJobs.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <span className="icon"><Icon name="briefcase" size={20} /></span>
            <h4>No jobs yet</h4>
            <p>Post a job above, or make sure your company name in your profile matches the job listings.</p>
          </div>
        </div>
      ) : (
        <div className="stack-md">
          {myJobs.map((j) => {
            const appCount = getApplicantsForJob(company, j.title).length;
            return (
              <div className="card" key={j.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 4px" }}>{j.title}</h3>
                    <p style={{ fontSize: 12.5, color: "var(--text-2)", margin: 0 }}>
                      Posted {j.posted} · <strong style={{ color: "var(--text)" }}>{appCount}</strong> applicant{appCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Pill tone={j.tone || "green"} large>{j.status || "Open"}</Pill>
                </div>
                <TagsRow tags={j.skills || []} tone="blue" />
                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", margin: "12px 0", fontSize: 12.5, color: "var(--text-2)" }}>
                  <span className="salary-tag">{j.salary}</span>
                  <span>·</span>
                  <span>{j.location}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button variant="primary" size="sm" onClick={() => setViewJob(j)}>
                    View applicants ({appCount})
                  </Button>
                  {(j.status || "Open") === "Open"
                    ? <Button variant="outline" size="sm">Close listing</Button>
                    : <Button variant="outline" size="sm">Reopen</Button>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewJob && (
        <ViewApplicantsModal job={viewJob} company={company} onClose={() => setViewJob(null)} />
      )}
    </div>
  );
};

// ── SDG Alignment ─────────────────────────────────────────────────────────
const SDGAlignment = ({ user }) => {
  const M       = window.MOCK;
  const company = user?.profile?.company || user?.name || "";
  const appCount = getApplicantsForCompany(company).length;
  const openJobs = M.myJobs.filter(j => j.status === "Open").length;

  const impactStats = [
    { label: "Youth guided",        value: (window.LocalAuth.getUsers() || []).filter(u => u.role === "student").length.toString() },
    { label: "Your jobs posted",    value: String(openJobs) },
    { label: "Your applicants",     value: String(appCount) },
    { label: "Avg. skill coverage", value: "78%" },
  ];

  return (
    <div>
      <div className="sdg-banner" style={{ marginBottom: 20 }}>
        <h2>SDG 8 — Decent work & economic growth</h2>
        <p>Every job you post on CareerPath AI counts toward SDG 8 — promoting sustained, inclusive economic growth, full and productive employment, and decent work for the youth of Pakistan.</p>
        <div className="sdg-badges">
          <span className="sdg-badge">SDG 8</span>
          <span className="sdg-badge">VISION 2030</span>
          <span className="sdg-badge">VISION 2035</span>
          <span className="sdg-badge">DIGITAL PAKISTAN</span>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        {impactStats.map((s, i) => <StatCard key={i} label={s.label} value={s.value} />)}
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        <Card title="How CareerPath AI aligns" sub="National development frameworks">
          <div className="vision-section">
            <div className="label">Vision 2030</div>
            <div className="title">Bridge education and industry</div>
            <p className="body">Translate university skill-sets into market-ready talent through AI-guided gap analysis, pushing the youth employment rate toward the 2030 target.</p>
          </div>
          <div className="vision-section">
            <div className="label">Vision 2035</div>
            <div className="title">A digital-first workforce</div>
            <p className="body">Prepare graduates for jobs that don't exist yet — software, design, data, AI — by routing them toward roles where Pakistan has the strongest export advantage.</p>
          </div>
          <div className="vision-section">
            <div className="label">SDG 8</div>
            <div className="title">Decent work, equitably distributed</div>
            <p className="body">Surface roles by match and city — not by reputation — so high-quality work reaches students outside the Karachi–Lahore–Islamabad triangle.</p>
          </div>
        </Card>
        <Card title="Pakistan digital economy" sub="Latest reported figures">
          <BarChart data={M.digitalEconomyStats} tone="green" />
          <div style={{ marginTop: 16, padding: 12, background: "var(--primary-50)", borderRadius: 8, fontSize: 12, color: "var(--primary-600)", display: "flex", gap: 8, alignItems: "flex-start" }}>
            <Icon name="trending-up" size={14} style={{ marginTop: 2, flexShrink: 0 }} />
            <span>IT exports crossed <strong>USD 3.2B</strong> in the last fiscal year — the fastest-growing services category in Pakistan.</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── Dashboard shell ───────────────────────────────────────────────────────
const EmployerDashboard = ({ onPostJobOpen, user, allJobs }) => {
  const [page, setPage] = useState("talent");
  return (
    <div className="shell">
      <EmployerSidebar current={page} onSelect={setPage} user={user} />
      <main className="main">
        {page === "talent" && <TalentOverview user={user} />}
        {page === "jobs"   && <MyJobsPage onPostJob={onPostJobOpen} user={user} allJobs={allJobs} />}
        {page === "sdg"    && <SDGAlignment user={user} />}
      </main>
    </div>
  );
};

Object.assign(window, { EmployerDashboard });
