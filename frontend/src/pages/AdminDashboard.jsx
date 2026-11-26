
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
  Activity,
  CheckCircle2,
} from "lucide-react";
import API from "../services/api";
import DashboardLayout from "../components/DashboardLayout";

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
        {
          label: "Pending pet listings",
          value: stats.pendingPetListings,
          icon: ClipboardList,
        },
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
      title: "Pet listing requests",
      description: "Review community-submitted listings before they are published.",
      link: "/admin/pet-listings",
      icon: PawPrint,
    },
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
    <DashboardLayout
      roleLabel="Admin"
      title="Platform dashboard"
      description="Monitor PawBridge users, pets, adoption activity and rescue cases."
      navItems={[
        { title: "Dashboard", url: "/admin", icon: Activity },
        { title: "Manage users", url: "/admin/users", icon: Users },
        { title: "Manage rescue cases", url: "/admin/rescues", icon: HeartHandshake },
        { title: "Manage pets", url: "/shelter/pets", icon: PawPrint },
        { title: "Pet listing requests", url: "/admin/pet-listings", icon: ClipboardList },
        { title: "Applications", url: "/shelter/applications", icon: CheckCircle2 },
      ]}
      stats={cards.map(({ label, value, icon: Icon }) => ({
        label,
        value: loading ? "…" : value ?? 0,
        icon: Icon,
        detail: label === "Pending applications" || label === "Pending rescues" || label === "Pending pet listings"
          ? "Requires review"
          : "Current total",
      }))}
      charts={stats ? [
        {
          title: "Pet listings",
          items: [
            { label: "Available", value: stats.availablePets },
            { label: "Adopted", value: stats.adoptedPets, color: "blue" },
            { label: "Awaiting review", value: stats.pendingPetListings, color: "amber" },
          ],
        },
        {
          title: "Adoption applications",
          items: [
            { label: "All applications", value: stats.totalApplications },
            { label: "Pending review", value: stats.pendingApplications, color: "amber" },
          ],
        },
        {
          title: "Rescue reports",
          items: [
            { label: "All reports", value: stats.totalRescues },
            { label: "Awaiting action", value: stats.pendingRescues, color: "amber" },
          ],
        },
      ] : []}
      actions={
        <button
          className="btn btn-outline-success"
          onClick={loadStats}
          disabled={loading}
        >
          <RefreshCw size={16} className="me-2" />
          Refresh statistics
        </button>
      }
    >
      {error && <div className="alert alert-danger">{error}</div>}

      {loading && !stats && (
        <div className="text-center py-5" role="status">
          <div className="spinner-border text-success" />
          <p className="paw-muted mt-3">Loading platform statistics...</p>
        </div>
      )}

      <div className="dashboard-quick-access">
        <div className="d-flex align-items-center gap-2 mb-3">
          <ShieldCheck className="text-success" size={22} />
          <h2 className="mb-0">Management centre</h2>
        </div>

        <div className="row g-3">
          {shortcuts.map(({ title, description, link, icon: Icon }) => (
            <div className="col-md-6" key={title}>
              <div className="feature-card h-100">
                <Icon size={28} className="text-success mb-3" />
                <h3 className="h5">{title}</h3>
                <p className="paw-muted">{description}</p>
                <Link to={link} className="btn btn-outline-success">
                  Open management
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
