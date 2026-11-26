
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  PawPrint,
  ClipboardList,
  HeartHandshake,
  User,
  Settings,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    applications: [],
    rescues: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const links = {
    adopter: [
      { title: "Browse pets", url: "/pets", icon: PawPrint },
      { title: "List a pet", url: "/list-pet", icon: HeartHandshake },
      { title: "My pet listings", url: "/my-listings", icon: PawPrint },
      { title: "My adoptions", url: "/my-adoptions", icon: ClipboardList },
      { title: "Report an animal", url: "/rescue", icon: HeartHandshake },
      { title: "My rescue reports", url: "/my-rescues", icon: Activity },
      { title: "My profile", url: "/profile", icon: User },
      { title: "Change password", url: "/change-password", icon: Settings },
    ],
    shelter: [
      { title: "Shelter dashboard", url: "/shelter", icon: Activity },
      { title: "Manage pets", url: "/shelter/pets", icon: PawPrint },
      { title: "Add a pet", url: "/shelter/add-pet", icon: HeartHandshake },
      { title: "Manage applications", url: "/shelter/applications", icon: ClipboardList },
      { title: "My profile", url: "/profile", icon: User },
      { title: "Change password", url: "/change-password", icon: Settings },
    ],
    rescuer: [
      { title: "Rescue dashboard", url: "/rescuer", icon: Activity },
      { title: "List a pet", url: "/list-pet", icon: HeartHandshake },
      { title: "My pet listings", url: "/my-listings", icon: PawPrint },
      { title: "My profile", url: "/profile", icon: User },
      { title: "Change password", url: "/change-password", icon: Settings },
    ],
    admin: [
      { title: "Admin dashboard", url: "/admin", icon: ShieldCheck },
      { title: "Manage users", url: "/admin/users", icon: User },
      { title: "Manage rescue cases", url: "/admin/rescues", icon: Activity },
      { title: "Manage pets", url: "/shelter/pets", icon: PawPrint },
      { title: "Pet listing requests", url: "/admin/pet-listings", icon: ClipboardList },
      { title: "My profile", url: "/profile", icon: User },
      { title: "Change password", url: "/change-password", icon: Settings },
    ],
  };

  useEffect(() => {
    if (user?.role !== "adopter") return;

    const loadStats = async () => {
      setLoading(true);
      setError("");

      try {
        const [adoptionsResponse, rescuesResponse] =
          await Promise.all([
            API.get("/adoptions/my"),
            API.get("/rescues"),
          ]);

        setStats({
          applications: adoptionsResponse.data.applications || [],
          rescues: rescuesResponse.data.reports || [],
        });
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load your dashboard activity."
        );
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user?.role]);

  const roleLinks = links[user?.role] || links.adopter;
  const applicationCounts = ["Pending", "Under Review", "Approved", "Rejected"].map(
    (status) => ({
      label: status,
      value: stats.applications.filter((application) => application.status === status).length,
      color: status === "Approved" ? "green" : status === "Rejected" ? "red" : "blue",
    })
  );
  const rescueCounts = ["Submitted", "Assigned", "In Progress", "Resolved"].map(
    (status) => ({
      label: status,
      value: stats.rescues.filter((report) => report.status === status).length,
      color: status === "Resolved" ? "green" : status === "In Progress" ? "blue" : "amber",
    })
  );
  const dashboardStats = user?.role === "adopter"
    ? [
        {
          label: "My adoptions",
          value: loading ? "…" : stats.applications.length,
          icon: ClipboardList,
          detail: "Requests and confirmed adoptions",
        },
        {
          label: "Pending decisions",
          value: loading ? "…" : stats.applications.filter((app) => app.status === "Pending" || app.status === "Under Review").length,
          icon: Clock3,
          detail: "Waiting for shelter review",
        },
        {
          label: "Rescue reports",
          value: loading ? "…" : stats.rescues.length,
          icon: HeartHandshake,
          detail: "Reports you submitted",
        },
        {
          label: "Resolved rescues",
          value: loading ? "…" : stats.rescues.filter((report) => report.status === "Resolved").length,
          icon: CheckCircle2,
          detail: "Reports marked resolved",
        },
      ]
    : [];

  const roleDashboard = {
    shelter: "/shelter",
    rescuer: "/rescuer",
    admin: "/admin",
  }[user?.role];

  if (roleDashboard) return <Navigate to={roleDashboard} replace />;

  return (
    <DashboardLayout
      roleLabel={user?.role || "Member"}
      title={`Welcome, ${user?.name || "friend"}`}
      description="Your PawBridge activity and quick links, all in one place."
      navItems={[
        { title: "Dashboard", url: "/dashboard", icon: Activity },
        ...roleLinks,
      ]}
      stats={dashboardStats}
      charts={user?.role === "adopter" ? [
        { title: "Adoption applications", items: applicationCounts },
        { title: "Rescue report progress", items: rescueCounts },
      ] : []}
    >
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <section className="dashboard-quick-access">
        <h2>Quick access</h2>
        <div className="row g-3">
          {roleLinks.map(({ title, url, icon: Icon }) => (
            <div className="col-sm-6 col-xl-4" key={url}>
              <Link to={url} className="dashboard-quick-link">
                <Icon size={19} aria-hidden="true" />
                <span>{title}</span>
                <span className="ms-auto" aria-hidden="true">→</span>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
}
