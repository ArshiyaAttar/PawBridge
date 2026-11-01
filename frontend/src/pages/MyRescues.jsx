
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  RefreshCw,
  PawPrint,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import API from "../services/api";

const statusStyle = {
  Submitted: "text-bg-info",
  Assigned: "text-bg-primary",
  "In Progress": "text-bg-warning",
  Resolved: "text-bg-success",
  Rejected: "text-bg-danger",
};

export default function MyRescues() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await API.get("/rescues");
      setReports(data.reports || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load rescue reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const count = (status) =>
    reports.filter((report) => report.status === status).length;

  const filteredReports =
    filter === "All"
      ? reports
      : reports.filter((report) => report.status === filter);

  return (
    <main className="container paw-section">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <span className="eyebrow">YOUR RESCUE ACTIVITY</span>
          <h1 className="section-title mt-2">
            My rescue <span>reports.</span>
          </h1>
          <p className="paw-muted mb-0">
            Track the progress of animals you've reported.
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-success"
            onClick={loadReports}
            disabled={loading}
          >
            <RefreshCw size={16} className="me-2" />
            Refresh
          </button>
          <Link to="/rescue" className="btn paw-primary">
            New report
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="feature-card h-100">
            <PawPrint className="text-success mb-2" size={25} />
            <h3>{reports.length}</h3>
            <p className="paw-muted mb-0">Total reports</p>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="feature-card h-100">
            <Clock className="text-info mb-2" size={25} />
            <h3>{count("Submitted") + count("Assigned")}</h3>
            <p className="paw-muted mb-0">Awaiting action</p>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="feature-card h-100">
            <AlertCircle className="text-warning mb-2" size={25} />
            <h3>{count("In Progress")}</h3>
            <p className="paw-muted mb-0">In progress</p>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="feature-card h-100">
            <CheckCircle className="text-success mb-2" size={25} />
            <h3>{count("Resolved")}</h3>
            <p className="paw-muted mb-0">Resolved</p>
          </div>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-4">
        {["All", "Submitted", "Assigned", "In Progress", "Resolved", "Rejected"].map(
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

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" />
          <p className="paw-muted mt-3">Loading your rescue reports...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="feature-card text-center py-5">
          <PawPrint size={42} className="text-success mb-3" />
          <h4>No rescue reports found</h4>
          <p className="paw-muted">
            {reports.length
              ? "There are no reports in this status."
              : "You haven't submitted a rescue report yet."}
          </p>
          {!reports.length && (
            <Link to="/rescue" className="btn paw-primary">
              Report an animal
            </Link>
          )}
        </div>
      ) : (
        <div className="row g-4">
          {filteredReports.map((report) => (
            <div className="col-lg-6" key={report._id}>
              <div className="feature-card h-100">
                <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                  <div>
                    <span className="eyebrow">RESCUE REPORT</span>
                    <h5 className="mt-2 mb-1">{report.animalType} rescue</h5>
                    <small className="paw-muted">
                      {report.createdAt
                        ? new Date(report.createdAt).toLocaleDateString()
                        : "Date unavailable"}
                    </small>
                  </div>
                  <span className={`badge ${statusStyle[report.status] || "text-bg-secondary"}`}>
                    {report.status}
                  </span>
                </div>

                <p>{report.description}</p>

                <p className="mb-2">
                  <MapPin size={16} className="me-2 text-success" />
                  {report.location}
                </p>

                <p className="mb-2">
                  <Phone size={16} className="me-2 text-success" />
                  {report.contactPhone}
                </p>

                {report.assignedRescuer && (
                  <div className="alert alert-light border mt-3 mb-2">
                    <strong>Assigned rescuer:</strong>{" "}
                    {report.assignedRescuer.name || "Rescuer assigned"}
                    {report.assignedRescuer.phone && (
                      <div className="small mt-1">
                        Contact: {report.assignedRescuer.phone}
                      </div>
                    )}
                  </div>
                )}

                {report.rescueNotes && (
                  <div className="alert alert-success mt-3 mb-0">
                    <strong>Rescue update</strong>
                    <p className="mb-0 mt-1">{report.rescueNotes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
