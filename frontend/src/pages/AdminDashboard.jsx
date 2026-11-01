
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Heart,
  PawPrint,
  ClipboardList,
  HeartHandshake,
  RefreshCw,
  UserRound,
  ShieldCheck,
} from "lucide-react";
import API from "../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await API.get("/admin/stats");
      setStats(data.stats);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const cards = stats
    ? [
        { label: "Total users", value: stats.totalUsers, icon: Users },
        { label: "Adopters", value: stats.adopters, icon: UserRound },
        { label: "Shelters", value: stats.shelters, icon: Heart },
        { label: "Rescuers", value: stats.rescuers, icon: HeartHandshake },
        { label: "Total pets", value: stats.totalPets, icon: PawPrint },
        { label: "Available pets", value: stats.availablePets, icon: PawPrint },
        { label: "Adopted pets", value: stats.adoptedPets, icon: Heart },
        {
          label: "Applications",
          value: stats.totalApplications,
          icon: ClipboardList,
        },
        {
          label: "Pending applications",
          value: stats.pendingApplications,
          icon: ClipboardList,
        },
        {
          label: "Rescue reports",
          value: stats.totalRescues,
          icon: HeartHandshake,
        },
        {
          label: "Pending rescues",
          value: stats.pendingRescues,
          icon: HeartHandshake,
        },
      ]
    : [];

  const shortcuts = [
    {
      title: "Manage users",
      description: "View users, change roles and manage account access.",
      link: "/admin/users",
      icon: Users,
    },
    {
      title: "Manage rescue cases",
      description: "Assign rescuers and monitor rescue operations.",
      link: "/admin/rescues",
      icon: HeartHandshake,
    },
    {
      title: "Manage pets",
      description: "Review and manage pet listings.",
      link: "/shelter/pets",
      icon: PawPrint,
    },
    {
      title: "Adoption applications",
      description: "Review applications submitted for pet adoption.",
      link: "/shelter/applications",
      icon: ClipboardList,
    },
  ];

  return (
    <main className="container paw-section">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <span className="eyebrow">PLATFORM OVERVIEW</span>
          <h1 className="section-title mt-2">
            Admin <span>Dashboard</span>
          </h1>
          <p className="paw-muted mb-0">
            Monitor PawBridge users, pets, adoption activity and rescue cases.
          </p>
        </div>

        <button
          className="btn btn-outline-success"
          onClick={loadStats}
          disabled={loading}
        >
          <RefreshCw size={16} className="me-2" />
          Refresh statistics
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" />
          <p className="paw-muted mt-3">Loading platform statistics...</p>
        </div>
      ) : stats ? (
        <>
          <div className="d-flex align-items-center gap-2 mb-3">
            <ShieldCheck className="text-success" size={22} />
            <h4 className="mb-0">Platform statistics</h4>
          </div>

          <div className="row g-3 mb-5">
            {cards.map(({ label, value, icon: Icon }) => (
              <div className="col-6 col-md-4 col-lg-3" key={label}>
                <div className="feature-card h-100">
                  <Icon size={25} className="text-success mb-3" />
                  <h3 className="mb-1">{value ?? 0}</h3>
                  <p className="paw-muted mb-0">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}

      <h4 className="mb-3">Management centre</h4>

      <div className="row g-3">
        {shortcuts.map(({ title, description, link, icon: Icon }) => (
          <div className="col-md-6" key={title}>
            <div className="feature-card h-100">
              <Icon size={28} className="text-success mb-3" />
              <h5>{title}</h5>
              <p className="paw-muted">{description}</p>
              <Link to={link} className="btn btn-outline-success">
                Open management
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
