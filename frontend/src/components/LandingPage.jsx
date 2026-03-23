import { Link } from "react-router-dom";
import BrandLogo from "./BrandLogo";
import "./LandingPage.css";

// ─── Icons ────────────────────────────────────────────────────────────────────
const ArrowRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const TaskIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const TeamIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ChartIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
  </svg>
);

// ─── Data ─────────────────────────────────────────────────────────────────────
const features = [
  {
    icon: <TaskIcon />,
    color: "#eef2ff",
    iconColor: "#6366f1",
    title: "Task Management",
    desc: "Create, assign, and track tasks with priorities, deadlines, and status updates. Stay on top of every deliverable with real-time progress tracking.",
  },
  {
    icon: <TeamIcon />,
    color: "#f0fdf4",
    iconColor: "#22c55e",
    title: "Team Collaboration",
    desc: "Invite members, assign roles, and manage your team across organizations. Email notifications keep everyone in the loop automatically.",
  },
  {
    icon: <ChartIcon />,
    color: "#fef3c7",
    iconColor: "#f59e0b",
    title: "Real-time Analytics",
    desc: "Visualize project health with interactive charts, task completion rates, and team performance metrics — all on a beautiful dashboard.",
  },
];

const techStack = [
  { name: "React 19", color: "#61dafb" },
  { name: "Spring Boot", color: "#6db33f" },
  { name: "Redux Toolkit", color: "#764abc" },
  { name: "Mantine UI", color: "#339af0" },
  { name: "Tailwind CSS", color: "#38bdf8" },
  { name: "JWT Auth", color: "#f97316" },
  { name: "MYSQL", color: "#336791" },
  { name: "Vite", color: "#646cff" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ══════ Navbar ══════ */}
      <nav className="landing-navbar">
        <BrandLogo />

        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#techstack">Tech Stack</a>
        </div>

        <div className="landing-nav-cta">
          <Link to="/login" className="landing-cta-secondary" style={{ padding: "9px 22px", fontSize: "14px", borderRadius: "10px" }}>
            Sign In
          </Link>
          <Link to="/register" className="landing-cta-primary" style={{ padding: "9px 22px", fontSize: "14px", borderRadius: "10px", boxShadow: "none" }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* ══════ Hero ══════ */}
      <section className="landing-hero">
        {/* Floating orbs */}
        <div className="landing-orb landing-orb-1" />
        <div className="landing-orb landing-orb-2" />
        <div className="landing-orb landing-orb-3" />

        <div className="landing-hero-content">
          <div className="landing-hero-badge">
            <SparkleIcon />
            Built for modern teams
          </div>

          <h1>
            Manage Projects.<br />
            <span className="gradient-text">Deliver Results.</span>
          </h1>

          <p className="landing-hero-subtitle">
            The all-in-one project management platform that helps teams plan, track, and ship work — beautifully and efficiently.
          </p>

          <div className="landing-hero-cta">
            <Link to="/register" className="landing-cta-primary">
              Start Building Free
              <ArrowRightIcon />
            </Link>
            <a href="#features" className="landing-cta-secondary">
              See Features
            </a>
          </div>
        </div>
      </section>

      {/* ══════ Dashboard Preview ══════ */}
      <div style={{ background: "linear-gradient(180deg, #1e1b4b 0%, #f8fafc 100%)" }}>
        <div className="landing-preview">
          <div className="landing-preview-card">
            {/* Window dots */}
            <div className="landing-preview-topbar">
              <div className="landing-preview-dot" style={{ background: "#ef4444" }} />
              <div className="landing-preview-dot" style={{ background: "#f59e0b" }} />
              <div className="landing-preview-dot" style={{ background: "#22c55e" }} />
            </div>

            {/* Stats */}
            <div className="landing-preview-stats">
              <div className="landing-preview-stat">
                <div className="landing-preview-stat-value">12</div>
                <div className="landing-preview-stat-label">Active Projects</div>
              </div>
              <div className="landing-preview-stat">
                <div className="landing-preview-stat-value">47</div>
                <div className="landing-preview-stat-label">Tasks Completed</div>
              </div>
              <div className="landing-preview-stat">
                <div className="landing-preview-stat-value">8</div>
                <div className="landing-preview-stat-label">Team Members</div>
              </div>
            </div>

            {/* Task rows */}
            <div className="landing-preview-rows">
              {[
                { dot: "#22c55e", badge: "Done", badgeColor: "rgba(34,197,94,0.15)", badgeText: "#22c55e", width: "60%" },
                { dot: "#6366f1", badge: "In Progress", badgeColor: "rgba(99,102,241,0.15)", badgeText: "#818cf8", width: "45%" },
                { dot: "#f59e0b", badge: "Review", badgeColor: "rgba(245,158,11,0.15)", badgeText: "#f59e0b", width: "75%" },
                { dot: "#ef4444", badge: "Overdue", badgeColor: "rgba(239,68,68,0.15)", badgeText: "#ef4444", width: "35%" },
              ].map((row, i) => (
                <div className="landing-preview-row" key={i}>
                  <div className="landing-preview-row-dot" style={{ background: row.dot }} />
                  <div className="landing-preview-row-text" style={{ width: row.width }} />
                  <div
                    className="landing-preview-row-badge"
                    style={{ background: row.badgeColor, color: row.badgeText }}
                  >
                    {row.badge}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════ Features ══════ */}
      <section id="features" className="landing-features" style={{ textAlign: "center" }}>
        <div className="landing-section-label">
          <SparkleIcon />
          Features
        </div>
        <div className="landing-section-title">Everything you need to ship</div>
        <p className="landing-section-subtitle">
          From task tracking to team analytics, ProjectFlow gives you the tools to manage every aspect of your project lifecycle.
        </p>

        <div className="landing-features-grid">
          {features.map((f, i) => (
            <div className="landing-feature-card" key={i}>
              <div
                className="landing-feature-icon"
                style={{ background: f.color, color: f.iconColor }}
              >
                {f.icon}
              </div>
              <div className="landing-feature-title">{f.title}</div>
              <div className="landing-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ Tech Stack ══════ */}
      <section id="techstack" className="landing-tech">
        <div className="landing-section-label">
          <SparkleIcon />
          Tech Stack
        </div>
        <div className="landing-section-title">Built with modern technology</div>
        <p className="landing-section-subtitle">
          A robust, full-stack architecture designed for performance, scalability, and developer experience.
        </p>

        <div className="landing-tech-pills">
          {techStack.map((tech, i) => (
            <div className="landing-tech-pill" key={i}>
              <div className="landing-tech-pill-dot" style={{ background: tech.color }} />
              {tech.name}
            </div>
          ))}
        </div>
      </section>

      {/* ══════ Footer ══════ */}
      <footer className="landing-footer">
        <BrandLogo />
        <div className="landing-footer-copy">
          © {new Date().getFullYear()} ProjectFlow. Built with ❤️ by Alakh.
        </div>
        <div className="landing-footer-links">
          <Link to="/login">Sign In</Link>
          <Link to="/register">Register</Link>
        </div>
      </footer>
    </div>
  );
}
