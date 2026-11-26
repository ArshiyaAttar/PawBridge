import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  CheckCircle2,
  ClipboardList,
  Clock3,
  PawPrint,
  Plus,
} from "lucide-react";
import API from "../services/api";
import DashboardLayout from "../components/DashboardLayout";

export default function ShelterDashboard() {
  const [pets, setPets] = useState([]);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [petsResponse, applicationsResponse] = await Promise.all([
          API.get("/pets/mine"),
          API.get("/adoptions/manage"),
        ]);

        setPets(petsResponse.data.pets || []);
        setApplications(applicationsResponse.data.applications || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load shelter data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const pendingApplications = applications.filter((app) => app.status === "Pending").length;
  const applicationStatuses = ["Pending", "Under Review", "Approved", "Rejected"].map(
    (status) => ({
      label: status,
      value: applications.filter((app) => app.status === status).length,
      color: status === "Approved" ? "green" : status === "Rejected" ? "red" : "blue",
    })
  );
  const petStatuses = ["Available", "Pending", "Adopted"].map((status) => ({
    label: status,
    value: pets.filter((pet) => pet.status === status).length,
    color: status === "Adopted" ? "blue" : status === "Pending" ? "amber" : "green",
  }));

  return (
    <DashboardLayout
      roleLabel="Shelter"
      title="Shelter dashboard"
      description="Track pet listings and review adoption activity."
      navItems={[
        { title: "Dashboard", url: "/shelter", icon: Activity },
        { title: "Manage pets", url: "/shelter/pets", icon: PawPrint },
        { title: "Add a pet", url: "/shelter/add-pet", icon: Plus },
        { title: "Applications", url: "/shelter/applications", icon: ClipboardList },
      ]}
      stats={[
        { label: "Pet listings", value: loading ? "…" : pets.length, icon: PawPrint, detail: "Your listed pets" },
        { label: "Available pets", value: loading ? "…" : pets.filter((pet) => pet.status === "Available").length, icon: CheckCircle2, detail: "Ready for adoption" },
        { label: "Applications", value: loading ? "…" : applications.length, icon: ClipboardList, detail: "Adoption requests received" },
        { label: "Pending applications", value: loading ? "…" : pendingApplications, icon: Clock3, detail: "Waiting for your review" },
      ]}
      charts={loading ? [] : [
        { title: "Pet listing status", items: petStatuses },
        { title: "Adoption application status", items: applicationStatuses },
      ]}
      actions={
        <div className="d-flex gap-2 flex-wrap">
          <Link to="/shelter/pets" className="btn btn-outline-success">Manage pets</Link>
          <Link to="/shelter/add-pet" className="btn paw-primary">Add new pet</Link>
        </div>
      }
    >
      {error && <div className="alert alert-danger">{error}</div>}
      {loading && (
        <div className="text-center py-4" role="status">
          <div className="spinner-border text-success" />
          <p className="paw-muted mt-3">Loading shelter activity...</p>
        </div>
      )}
      {!loading && (
        <div className="dashboard-quick-access">
          <h2>Next steps</h2>
          <Link to="/shelter/applications" className="dashboard-quick-link">
            <ClipboardList size={19} aria-hidden="true" />
            <span>Review adoptions and requests</span>
            <span className="ms-auto" aria-hidden="true">→</span>
          </Link>
        </div>
      )}
    </DashboardLayout>
  );
}