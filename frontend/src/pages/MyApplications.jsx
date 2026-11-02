
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PawPrint,
  ClipboardList,
  Eye,
  RefreshCw,
} from "lucide-react";
import API from "../services/api";

const statusStyles = {
  Pending: "text-bg-warning",
  "Under Review": "text-bg-info",
  Approved: "text-bg-success",
  Rejected: "text-bg-danger",
};

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await API.get("/adoptions/my");
      setApplications(data.applications || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load applications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const counts = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "Pending").length,
    review: applications.filter((a) => a.status === "Under Review").length,
    approved: applications.filter((a) => a.status === "Approved").length,
    rejected: applications.filter((a) => a.status === "Rejected").length,
  };

  const filteredApplications =
    filter === "All"
      ? applications
      : applications.filter((a) => a.status === filter);

  return (
    <main className="container paw-section">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <span className="eyebrow">YOUR ADOPTION JOURNEY</span>
          <h1 className="section-title mt-2">
            My <span>applications.</span>
          </h1>
          <p className="paw-muted mb-0">
            Follow the progress of your adoption requests.
          </p>
        </div>

        <button
          className="btn btn-outline-success"
          onClick={loadApplications}
          disabled={loading}
        >
          <RefreshCw size={16} className="me-2" />
          Refresh
        </button>
      </div>

      {!loading && !error && (
        <div className="row g-3 mb-4">
          {[
            ["Total", counts.total],
            ["Pending", counts.pending],
            ["Under Review", counts.review],
            ["Approved", counts.approved],
            ["Rejected", counts.rejected],
          ].map(([label, value]) => (
            <div className="col-6 col-lg" key={label}>
              <div className="feature-card h-100">
                <h3>{value}</h3>
                <p className="paw-muted mb-0">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="d-flex flex-wrap gap-2 mb-4">
        {["All", "Pending", "Under Review", "Approved", "Rejected"].map(
          (status) => (
            <button
              key={status}
              className={`btn btn-sm ${
                filter === status ? "btn-success" : "btn-outline-success"
              }`}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          )
        )}
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-success" />
          <p className="paw-muted mt-3">Loading your applications...</p>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && filteredApplications.length === 0 && (
        <div className="feature-card text-center py-5">
          <PawPrint size={48} className="text-success mb-3" />
          <h4>No applications found</h4>
          <p className="paw-muted">
            {applications.length
              ? "There are no applications in this status."
              : "Your adoption journey starts with finding a companion."}
          </p>
          {!applications.length && (
            <Link to="/pets" className="btn paw-primary">
              Browse available pets
            </Link>
          )}
        </div>
      )}

      {!loading && !error && filteredApplications.length > 0 && (
        <div className="row g-3">
          {filteredApplications.map((app) => (
            <div className="col-md-6" key={app._id}>
              <div className="feature-card h-100">
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <div>
                    <h5>{app.pet?.name || "Pet listing unavailable"}</h5>
                    <small className="paw-muted">
                      {app.pet?.species || "Animal"} · Submitted{" "}
                      {app.createdAt
                        ? new Date(app.createdAt).toLocaleDateString()
                        : "Date unavailable"}
                    </small>
                  </div>

                  <span
                    className={`badge ${
                      statusStyles[app.status] || "text-bg-secondary"
                    }`}
                  >
                    {app.status}
                  </span>
                </div>

                <hr />

                <p className="mb-1">
                  <strong>Adoption fee:</strong>{" "}
                  ₹{Number(app.adoptionFee || 0).toLocaleString("en-IN")}
                </p>
                <p className="mb-1">
                  <strong>Payment:</strong> COD · {app.paymentStatus || "Not Required"}
                </p>
                <p className="mb-3">
                  <strong>Home delivery:</strong>{" "}
                  {app.homeDeliveryRequested
                    ? app.deliveryStatus || "Pending Review"
                    : "Not requested"}
                </p>

                <p className="fw-semibold mb-2">My reason for adoption</p>
                <p className="paw-muted">
                  {app.reason || "No reason provided."}
                </p>

                {app.shelterNotes && (
                  <div className="alert alert-light border">
                    <strong>Shelter notes:</strong>
                    <p className="mb-0 mt-1">{app.shelterNotes}</p>
                  </div>
                )}

                <div className="d-flex flex-wrap gap-2 mt-3">
                  <Link
                    to={`/applications/${app._id}`}
                    className="btn btn-success btn-sm"
                  >
                    <Eye size={15} className="me-1" />
                    View application details
                  </Link>

                  {app.pet?._id && (
                    <Link
                      to={`/pets/${app.pet._id}`}
                      className="btn btn-outline-success btn-sm"
                    >
                      <ClipboardList size={15} className="me-1" />
                      View pet
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
