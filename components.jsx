/* CareerPath AI — Shared Components */
const { useState, useEffect, useRef } = React;

// ===== Atoms =====
const Pill = ({ tone = "blue", children, dot = false, large = false }) => (
  <span className={`pill pill-${tone} ${large ? "lg" : ""}`}>
    {dot && <span className="pill-dot" />}
    {children}
  </span>
);

const Tag = ({ tone = "", children }) => (
  <span className={`tag ${tone ? "tag-" + tone : ""}`}>{children}</span>
);

const Button = ({ variant = "primary", size = "md", icon, children, block = false, ...rest }) => (
  <button className={`btn btn-${variant} ${size !== "md" ? "btn-" + size : ""} ${block ? "btn-block" : ""}`} {...rest}>
    {icon && <Icon name={icon} size={14} />}
    {children}
  </button>
);

const StatCard = ({ label, value, delta, deltaTone }) => (
  <div className="stat-card">
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
    {delta && <div className={`stat-delta ${deltaTone === "down" ? "down" : ""}`}>{delta}</div>}
  </div>
);

const Progress = ({ label, value, tone = "primary" }) => (
  <div className="progress-row">
    <div className="progress-head">
      <span className="label">{label}</span>
      <span className="value">{value}%</span>
    </div>
    <div className="progress-track">
      <div className={`progress-fill ${tone === "green" ? "green" : tone === "amber" ? "amber" : ""}`}
        style={{ width: value + "%" }} />
    </div>
  </div>
);

const BarChart = ({ data, tone = "primary" }) => (
  <div className="barchart">
    {data.map((d, i) => (
      <div className="bar-row" key={i}>
        <div className="bar-label">{d.label}</div>
        <div className="bar-track">
          <div className={`bar-fill ${tone === "green" ? "green" : tone === "amber" ? "amber" : ""}`}
            style={{ width: d.pct + "%" }} />
        </div>
        <div className="bar-value">{d.suffix ? d.value + d.suffix : d.value.toLocaleString()}</div>
      </div>
    ))}
  </div>
);

const Avatar = ({ initials, size = "md", tone }) => (
  <div className={`avatar ${size === "lg" ? "lg" : size === "xl" ? "xl" : size === "sm" ? "sm" : ""}`}
    style={tone ? { background: tone.bg, color: tone.fg } : undefined}>
    {initials}
  </div>
);

const Card = ({ title, sub, action, children, className = "", style, flush = false }) => (
  <div className={`card ${flush ? "flush" : ""} ${className}`} style={style}>
    {(title || action) && (
      <div className="card-header">
        <div>
          {title && <h3 className="card-title">{title}</h3>}
          {sub && <p className="card-sub">{sub}</p>}
        </div>
        {action}
      </div>
    )}
    {children}
  </div>
);

// ===== Snackbar =====
const Snackbar = ({ tone = "success", title, sub, onDismiss }) => (
  <div className={`snackbar ${tone}`}>
    <span className="snackbar-icon">
      <Icon name={tone === "success" ? "check" : "x"} size={13} strokeWidth={2.5} />
    </span>
    <div className="body">
      <div className="title">{title}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
    <button className="dismiss" onClick={onDismiss}><Icon name="x" size={13} /></button>
  </div>
);

const SnackbarStack = ({ items, onDismiss }) => (
  <div className="snackbar-stack">
    {items.map((it) => (
      <Snackbar key={it.id} tone={it.tone} title={it.title} sub={it.sub} onDismiss={() => onDismiss(it.id)} />
    ))}
  </div>
);

// ===== Header (App Shell) =====
const Header = ({ role, user, onLogout, onBackToAuth }) => {
  const roleLabel = role === "student" ? "Student" : role === "admin" ? "Admin" : "Employer";
  return (
    <header className="header">
      <div className="brand">
        <span className="brand-mark"><Icon name="compass" size={18} /></span>
        <span>CareerPath AI</span>
      </div>
      <div className="header-right">
        <span className="role-badge"><span className="pill-dot" /> {roleLabel}</span>
        <button className="btn btn-outline btn-sm" title="Notifications" style={{ padding: "8px 10px" }}>
          <Icon name="bell" size={15} />
        </button>
        <Avatar initials={user.initials} />
        <span className="header-user-name">{user.name}</span>
        <button className="btn btn-outline btn-sm" icon="logout" onClick={onLogout}>
          <Icon name="logout" size={14} /> Logout
        </button>
      </div>
    </header>
  );
};

// ===== Sidebar Nav =====
const SidebarNav = ({ items, current, onSelect }) => (
  <nav className="nav-list">
    {items.map((it) => (
      <div key={it.id}
        className={`nav-item ${current === it.id ? "active" : ""}`}
        onClick={() => onSelect(it.id)}>
        <Icon name={it.icon} size={16} className="nav-icon" />
        <span>{it.label}</span>
      </div>
    ))}
  </nav>
);

// ===== Tags row =====
const TagsRow = ({ tags, tone = "blue" }) => (
  <div className="tags-row">
    {tags.map((t, i) => <Tag key={i} tone={tone}>{t}</Tag>)}
  </div>
);

// ===== Status Pill (auto-tone) =====
const StatusPill = ({ tone, children }) => <Pill tone={tone}>{children}</Pill>;

Object.assign(window, { Pill, Tag, Button, StatCard, Progress, BarChart, Avatar, Card, Header, SidebarNav, TagsRow, StatusPill, Snackbar, SnackbarStack });
