import { NavLink, useLocation } from "react-router-dom";
import { ArrowUpRight, PawPrint } from "lucide-react";

const DashboardChart = ({ title, items }) => {
  const maxValue = Math.max(...items.map((item) => Number(item.value) || 0), 1);

  return (
    <section className="dashboard-chart-card" aria-label={title}>
      <h2>{title}</h2>
      <div className="dashboard-chart-list">
        {items.map(({ label, value, color = "green" }) => (
          <div className="dashboard-chart-row" key={label}>
            <div className="d-flex justify-content-between gap-3 small">
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
            <div
              className="dashboard-chart-track"
              role="img"
              aria-label={`${label}: ${value}`}
            >
              <span
                className={`dashboard-chart-bar dashboard-chart-bar-${color}`}
                style={{ width: `${((Number(value) || 0) / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default function DashboardLayout({
  roleLabel,
  title,
  description,
  navItems,
  stats,
  charts,
  actions,
  children,
}) {
  const location = useLocation();

  return (
    <main className="container paw-section dashboard-page">
      <aside className="dashboard-sidebar" aria-label={`${roleLabel} navigation`}>
        <div className="dashboard-sidebar-heading">
          <span className="dashboard-sidebar-icon"><PawPrint size={18} /></span>
          <span>{roleLabel} workspace</span>
        </div>
        <nav className="dashboard-sidebar-nav" aria-label="Dashboard sections">
          {navItems.map(({ title: itemTitle, url, icon: Icon }) => (
            <NavLink
              key={url}
              to={url}
              end
              className={({ isActive }) =>
                `dashboard-sidebar-link${
                  (url.includes("#")
                    ? location.hash === url.slice(url.indexOf("#"))
                    : isActive && !location.hash)
                    ? " active"
                    : ""
                }`
              }
            >
              <Icon size={17} aria-hidden="true" />
              <span>{itemTitle}</span>
              <ArrowUpRight size={14} className="dashboard-sidebar-arrow" aria-hidden="true" />
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-heading">
          <div>
            <span className="eyebrow">{roleLabel} dashboard</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          {actions}
        </header>

        {stats?.length > 0 && (
          <section className="dashboard-stat-grid" aria-label="Dashboard summary">
            {stats.map(({ label, value, icon: Icon, detail }) => (
              <article className="dashboard-stat-card" key={label}>
                <div className="dashboard-stat-top">
                  <span>{label}</span>
                  <Icon size={18} aria-hidden="true" />
                </div>
                <strong>{value}</strong>
                <small>{detail}</small>
              </article>
            ))}
          </section>
        )}

        {charts?.length > 0 && (
          <section className="dashboard-charts" aria-label="Activity breakdown">
            {charts.map((chart) => (
              <DashboardChart key={chart.title} {...chart} />
            ))}
          </section>
        )}

        {children}
      </div>
    </main>
  );
}
