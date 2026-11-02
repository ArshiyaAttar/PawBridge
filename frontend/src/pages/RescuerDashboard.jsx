
import { useCallback, useEffect, useState } from "react";
import {
  RefreshCw,
  MapPin,
  Phone,
  CheckCircle,
  Clock,
  HeartHandshake,
  Play,
} from "lucide-react";
import API from "../services/api";

export default function RescuerDashboard() {
  const [reports, setReports] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [emailWarning, setEmailWarning] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState("All");
  const [notes, setNotes] = useState({});

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await API.get("/rescues");
      setReports(data.reports || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load rescue cases.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const updateCase = async (id, status) => {
    try {
      setUpdatingId(id);
      setMessage("");
      setError("");

      const { data } = await API.patch(`/rescues/${id}`, {
        status,
        rescueNotes:
          notes[id]?.trim() ||
          (status === "In Progress"
            ? "Rescue operation started."
            : "Rescue operation completed."),
      });

      setMessage(`Rescue case marked as ${status}.`);
      setEmailWarning(
        data.emailNotificationSent === false
          ? "The case was updated, but its email notification could not be sent. Check the backend email configuration and logs."
          : ""
      );
      setNotes((previous) => ({ ...previous, [id]: "" }));
      await loadReports();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update rescue case.");
    } finally {
      setUpdatingId(null);
    }
  };

  const assigned = reports.filter((r) => r.assignedRescuer);
  const inProgress = reports.filter((r) => r.status === "In Progress");
  const resolved = reports.filter((r) => r.status === "Resolved");

  const visibleReports =
    filter === "All"
      ? assigned
      : assigned.filter((r) => r.status === filter);

  return (
    <main className="container paw-section">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <span className="eyebrow">RESCUE OPERATIONS</span>
          <h1 className="section-title mt-2">
            Rescuer <span>Dashboard</span>
          </h1>
          <p className="paw-muted mb-0">
            Manage your assigned rescue operations and update their progress.
          </p>
        </div>

        <button
          className="btn btn-outline-success"
          onClick={loadReports}
          disabled={loading}
        >
          <RefreshCw size={16} className="me-2" />
          Refresh
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {emailWarning && <div className="alert alert-warning">{emailWarning}</div>}

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-4">
          <div className="feature-card h-100">
            <HeartHandshake size={26} className="text-success mb-2" />
            <h3>{assigned.length}</h3>
            <p className="paw-muted mb-0">Assigned cases</p>
          </div>
        </div>
        <div className="col-6 col-lg-4">
          <div className="feature-card h-100">
            <Clock size={26} className="text-warning mb-2" />
            <h3>{inProgress.length}</h3>
            <p className="paw-muted mb-0">In progress</p>
          </div>
        </div>
        <div className="col-6 col-lg-4">
          <div className="feature-card h-100">
            <CheckCircle size={26} className="text-success mb-2" />
            <h3>{resolved.length}</h3>
            <p className="paw-muted mb-0">Resolved</p>
          </div>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-4">
        {["All", "Assigned", "In Progress", "Resolved"].map((status) => (
          <button
            key={status}
            className={`btn btn-sm ${
              filter === status ? "btn-success" : "btn-outline-success"
            }`}
            onClick={() => setFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" />
          <p className="paw-muted mt-3">Loading rescue cases...</p>
        </div>
      ) : visibleReports.length === 0 ? (
        <div className="feature-card text-center py-5">
          <HeartHandshake size={42} className="text-success mb-3" />
          <h4>No assigned cases found</h4>
          <p className="paw-muted mb-0">
            Assigned rescue operations will appear here.
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {visibleReports.map((report) => (
            <div className="col-lg-6" key={report._id}>
              <div className="feature-card h-100">
                <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                  <div>
                    <span className="eyebrow">RESCUE CASE</span>
                    <h5 className="mt-2">{report.animalType} rescue</h5>
                  </div>
                  <span
                    className={`badge ${
                      report.status === "Resolved"
                        ? "text-bg-success"
                        : report.status === "In Progress"
                        ? "text-bg-warning"
                        : "text-bg-primary"
                    }`}
                  >
                    {report.status}
                  </span>
                </div>

                <p>{report.description}</p>

                <p className="mb-2">
                  <MapPin size={16} className="text-success me-2" />
                  {report.location}
                </p>

                <p className="mb-2">
                  <Phone size={16} className="text-success me-2" />
                  {report.contactPhone}
                </p>

                <p className="mb-3">
                  <strong>Reported by:</strong>{" "}
                  {report.reporter?.name || "Unknown"}
                </p>

                {report.status === "Assigned" ||
                report.status === "In Progress" ? (
                  <>
                    <label className="form-label fw-semibold">
                      Rescue progress notes
                    </label>
                    <textarea
                      className="form-control mb-3"
                      rows="2"
                      placeholder="Add an update about the rescue..."
                      value={notes[report._id] || ""}
                      onChange={(e) =>
                        setNotes((previous) => ({
                          ...previous,
                          [report._id]: e.target.value,
                        }))
                      }
                    />
                  </>
                ) : (
                  report.rescueNotes && (
                    <div className="alert alert-light border">
                      <strong>Rescue notes:</strong>
                      <p className="mb-0 mt-1">{report.rescueNotes}</p>
                    </div>
                  )
                )}

                {report.status === "Assigned" && (
                  <button
                    className="btn btn-success w-100"
                    disabled={updatingId !== null}
                    onClick={() => updateCase(report._id, "In Progress")}
                  >
                    <Play size={16} className="me-2" />
                    {updatingId === report._id
                      ? "Updating..."
                      : "Start Rescue"}
                  </button>
                )}

                {report.status === "In Progress" && (
                  <button
                    className="btn btn-success w-100"
                    disabled={updatingId !== null}
                    onClick={() => {
                      if (
                        window.confirm(
                          "Confirm that this rescue case has been resolved?"
                        )
                      ) {
                        updateCase(report._id, "Resolved");
                      }
                    }}
                  >
                    <CheckCircle size={16} className="me-2" />
                    {updatingId === report._id
                      ? "Updating..."
                      : "Mark as Resolved"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
