import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

export default function ShelterDashboard() {
  const [pets, setPets] = useState([]);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");

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
      }
    };

    loadDashboard();
  }, []);

  return (
    <main className="container paw-section">
      <span className="eyebrow">SHELTER MANAGEMENT</span>

      <h1 className="section-title">
        Shelter <span>Dashboard</span>
      </h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mt-3">
        <div className="col-md-4">
          <div className="feature-card">
            <h3>{pets.length}</h3>
            <p>My pet listings</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="feature-card">
            <h3>{applications.length}</h3>
            <p>Applications received</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="feature-card">
            <h3>
              {applications.filter((app) => app.status === "Pending").length}
            </h3>
            <p>Pending applications</p>
          </div>
        </div>
      </div>

      <div className="d-flex gap-2 flex-wrap mt-4">
        <Link to="/shelter/pets" className="btn paw-primary">
          Manage pets
        </Link>

        <Link to="/shelter/add-pet" className="btn btn-outline-success">
          Add new pet
        </Link>

        <Link to="/shelter/applications" className="btn btn-outline-success">
          Review applications
        </Link>
      </div>
    </main>
  );
}