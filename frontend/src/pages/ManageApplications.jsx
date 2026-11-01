
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  RefreshCw,
  Search,
  ClipboardList,
  CheckCircle,
  Clock,
  XCircle,
  PawPrint,
} from "lucide-react";
import API from "../services/api";

const filters = ["All", "Pending", "Under Review", "Approved", "Rejected"];

export default function ManageApplications() {
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState({});

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await API.get("/adoptions/manage");
      setApplications(data.applications || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load applications."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const reviewApplication = async (id, status) => {
    const application = applications.find((item) => item._id === id);

    if (!application) return;

    const confirmed = window.confirm(
      `Are you sure you want to mark this application as ${status}?`
    );

    if (!confirmed) return;

    try {
      setReviewingId(id);
      setMessage("");
      setError("");

      await API.patch(`/adoptions/${id}/review`, {
        status,
        shelterNotes: notes[id] || "",
      });

      setMessage(`Application successfully marked as ${status}.`);
      await loadApplications();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update this application."
      );
    } finally {
      setReviewingId(null);
    }
  };

  const getCount = (status) =>
    applications.filter((item) => item.status === status).length;

  const filteredApplications = applications.filter((item) => {
    const matchesStatus =
      activeFilter === "All" || item.status === activeFilter;

    const searchText = search.toLowerCase();

    const matchesSearch = [
      item.pet?.name,
      item.applicant?.name,
      item.applicant?.email,
      item.applicant?.phone,
    ].some((value) => String(value || "").toLowerCase().includes(searchText));

    return matchesStatus && matchesSearch;
  });

  const statusClass = (status) => {
    switch (status) {
      case "Approved":
        return "text-bg-success";
      case "Rejected":
        return "text-bg-danger";
      case "Under Review":
        return "text-bg-warning";
      default:
        return "text-bg-info";
    }
  };

  return (
    <main className="container paw-section">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <p className="text-success fw-semibold mb-1">SHELTER MANAGEMENT</p>
          <h1 className="section-title mb-2">
            Adoption <span>applications</span>
          </h1>
          <p className="paw-muted mb-0">
            Review applications and help pets find their forever homes.
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

      {message && (
        <div className="alert alert-success alert-dismissible">
          {message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setMessage("")}
          />
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-dismissible">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          />
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg">
          <div className="feature-card h-100">
            <ClipboardList className="text-success mb-2" size={25} />
            <h3>{applications.length}</h3>
            <p className="paw-muted mb-0">Total</p>
          </div>
        </div>

        <div className="col-6 col-lg">
          <div className="feature-card h-100">
            <Clock className="text-info mb-2" size={25} />
            <h3>{getCount("Pending")}</h3>
            <p className="paw-muted mb-0">Pending</p>
          </div>
        </div>

        <div className="col-6 col-lg">
          <div className="feature-card h-100">
            <RefreshCw className="text-warning mb-2" size={25} />
            <h3>{getCount("Under Review")}</h3>
            <p className="paw-muted mb-0">Under Review</p>
          </div>
        </div>

        <div className="col-6 col-lg">
          <div className="feature-card h-100">
            <CheckCircle className="text-success mb-2" size={25} />
            <h3>{getCount("Approved")}</h3>
            <p className="paw-muted mb-0">Approved</p>
          </div>
        </div>

        <div className="col-6 col-lg">
          <div className="feature-card h-100">
            <XCircle className="text-danger mb-2" size={25} />
            <h3>{getCount("Rejected")}</h3>
            <p className="paw-muted mb-0">Rejected</p>
          </div>
        </div>
      </div>

      <div className="feature-card mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-lg-5">
            <div className="input-group">
              <span className="input-group-text bg-white">
                <Search size={17} />
              </span>
              <input
                className="form-control"
                placeholder="Search applicant or pet..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-lg-7">
            <div className="d-flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  className={`btn btn-sm ${
                    activeFilter === filter
                      ? "btn-success"
                      : "btn-outline-success"
                  }`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status" />
          <p className="paw-muted mt-3">Loading applications...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="feature-card text-center py-5">
          <PawPrint size={42} className="text-success mb-3" />
          <h4>No applications found</h4>
          <p className="paw-muted mb-0">
            Try changing your search or status filter.
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredApplications.map((application) => {
            const isReviewable = ["Pending", "Under Review"].includes(
              application.status
            );

            return (
              <div className="col-lg-6" key={application._id}>
                <div className="feature-card h-100">
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                    <div>
                      <p className="text-success small fw-semibold mb-1">
                        PET APPLICATION
                      </p>
                      <h5 className="mb-1">
                        {application.pet?.name || "Pet unavailable"}
                      </h5>
                      <p className="paw-muted small mb-0">
                        Submitted{" "}
                        {application.createdAt
                          ? new Date(application.createdAt).toLocaleDateString()
                          : "Date unavailable"}
                      </p>
                    </div>

                    <span className={`badge ${statusClass(application.status)}`}>
                      {application.status}
                    </span>
                  </div>

                  <hr />

                  <h6>Applicant information</h6>
                  <p className="mb-1">
                    <strong>Name:</strong>{" "}
                    {application.applicant?.name || "Not available"}
                  </p>
                  <p className="mb-1">
                    <strong>Email:</strong>{" "}
                    {application.applicant?.email || "Not available"}
                  </p>
                  <p className="mb-3">
                    <strong>Phone:</strong>{" "}
                    {application.applicant?.phone || "Not provided"}
                  </p>

                  <h6>Why they want to adopt</h6>
                  <p className="paw-muted">
                    {application.reason || "No reason provided."}
                  </p>

                  <h6>Previous pet experience</h6>
                  <p className="paw-muted">
                    {application.experience || "Not provided"}
                  </p>

                  <h6>Living situation</h6>
                  <p className="paw-muted">
                    {application.livingSituation || "Not provided"}
                  </p>

                  {application.shelterNotes && (
                    <div className="alert alert-light border">
                      <strong>Shelter notes:</strong>
                      <p className="mb-0 mt-1">{application.shelterNotes}</p>
                    </div>
                  )}

                  {isReviewable && (
                    <div className="mt-3">
                      <label className="form-label fw-semibold">
                        Notes for applicant
                      </label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Add feedback or instructions (optional)..."
                        value={notes[application._id] || ""}
                        onChange={(e) =>
                          setNotes((previous) => ({
                            ...previous,
                            [application._id]: e.target.value,
                          }))
                        }
                      />

                      <div className="d-flex flex-wrap gap-2 mt-3">
                        <button
                          className="btn btn-sm btn-outline-success"
                          disabled={reviewingId !== null}
                          onClick={() =>
                            reviewApplication(application._id, "Under Review")
                          }
                        >
                          Mark Under Review
                        </button>

                        <button
                          className="btn btn-sm btn-success"
                          disabled={reviewingId !== null}
                          onClick={() =>
                            reviewApplication(application._id, "Approved")
                          }
                        >
                          {reviewingId === application._id
                            ? "Updating..."
                            : "Approve"}
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          disabled={reviewingId !== null}
                          onClick={() =>
                            reviewApplication(application._id, "Rejected")
                          }
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4">
        <Link to="/shelter" className="btn btn-outline-secondary">
          Back to Shelter Dashboard
        </Link>
      </div>
    </main>
  );
}
