
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PawPrint,
  ClipboardList,
  HeartHandshake,
  User,
  Settings,
  ShieldCheck,
  Activity,
} from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    applications: 0,
    rescues: 0,
  });
  const [loading, setLoading] = useState(false);

  const links = {
    adopter: [
      { title: "Browse pets", url: "/pets", icon: PawPrint },
      { title: "List a pet", url: "/list-pet", icon: HeartHandshake },
      { title: "My pet listings", url: "/my-listings", icon: PawPrint },
      { title: "My applications", url: "/my-applications", icon: ClipboardList },
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

      try {
        const [applicationsResponse, rescuesResponse] =
          await Promise.all([
            API.get("/adoptions/my"),
            API.get("/rescues"),
          ]);

        setStats({
          applications: applicationsResponse.data.count ??
            applicationsResponse.data.applications?.length ?? 0,
          rescues: rescuesResponse.data.count ??
            rescuesResponse.data.reports?.length ?? 0,
        });
      } catch (error) {
        console.error("Dashboard statistics unavailable:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user?.role]);

  const roleLinks = links[user?.role] || links.adopter;

  return (
    <main className="container paw-section">
      <span className="eyebrow">YOUR PAWBRIDGE SPACE</span>

      <h1 className="section-title">
        Welcome, <span>{user?.name}!</span>
      </h1>

      <p className="paw-muted">
        Manage your PawBridge activities from one place.
      </p>

      {user?.role === "adopter" && (
        <div className="row g-3 mt-3">
          <div className="col-md-6">
            <div className="feature-card">
              <ClipboardList size={28} className="text-success mb-2" />
              <h3>{loading ? "..." : stats.applications}</h3>
              <p className="paw-muted mb-0">My adoption applications</p>
            </div>
          </div>

          <div className="col-md-6">
            <div className="feature-card">
              <HeartHandshake size={28} className="text-success mb-2" />
              <h3>{loading ? "..." : stats.rescues}</h3>
              <p className="paw-muted mb-0">My rescue reports</p>
            </div>
          </div>
        </div>
      )}

      <h4 className="mt-5 mb-3">Quick access</h4>

      <div className="row g-4">
        {roleLinks.map(({ title, url, icon: Icon }) => (
          <div className="col-md-4" key={url}>
            <Link
              to={url}
              className="feature-card h-100 d-block text-decoration-none"
              style={{ color: "inherit" }}
            >
              <Icon size={30} className="text-success mb-3" />

              <h5>{title}</h5>

              <p className="paw-muted mb-0">
                Open {title.toLowerCase()}.
              </p>
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
