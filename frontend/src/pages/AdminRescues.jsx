
import { useCallback, useEffect, useState } from "react";
import {
  RefreshCw,
  Search,
  MapPin,
  Phone,
  HeartHandshake,
  Clock,
  CheckCircle,
  Users,
} from "lucide-react";
import API from "../services/api";

const statuses = [
  "Submitted",
  "Assigned",
  "In Progress",
  "Resolved",
  "Rejected",
];

export default function AdminRescues() {
  const [reports, setReports] = useState([]);
  const [rescuers, setRescuers] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedRescuers, setSelectedRescuers] = useState({});

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [reportResponse, userResponse] = await Promise.all([
        API.get("/rescues"),
        API.get("/admin/users", { params: { role: "rescuer" } }),
      ]);

      setReports(reportResponse.data.reports || []);
      setRescuers(
        (userResponse.data.users || []).filter((user) => user.isActive)
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load rescue management information."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const assignRescuer = async (report) => {
    const assignedRescuer =
      selectedRescuers[report._id] || report.assignedRescuer?._id;

    if (!assignedRescuer) {
      setError("Please select a rescuer before assigning this case.");
      return;
    }

    try {
      setUpdatingId(report._id);
      setMessage("");
      setError("");

      await API.patch(`/rescues/${report._id}`, {
        assignedRescuer,
        status: "Assigned",
      });

      setMessage("Rescuer assigned successfully.");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to assign rescuer.");
    } finally {
      setUpdatingId(null);
    }
  };

  const updateStatus = async (report, status) => {
    if (
      status === "Resolved" &&
      !window.confirm("Confirm that this rescue case is resolved?")
    ) {
      return;
    }

    try {
      setUpdatingId(report._id);
      setMessage("");
      setError("");

      await API.patch(`/rescues/${report._id}`, { status });

      setMessage(`Rescue case updated to ${status}.`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update rescue status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const count = (status) =>
    reports.filter((report) => report.status === status).length;

  const filteredReports = reports.filter((report) => {
    const matchesStatus =
      filter === "All" || report.status === filter;

    const searchText = search.toLowerCase();

    const matchesSearch = [
      report.animalType,
      report.location,
      report.description,
      report.reporter?.name,
      report.contactPhone,
      report.assignedRescuer?.name,
    ].some((value) =>
      String(value || "").toLowerCase().includes(searchText)
    );

    return matchesStatus && matchesSearch;
  });

  return (
    <main className="container paw-section">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <span className="eyebrow">ADMINISTRATION</span>
          <h1 className="section-title mt-2">
            Manage <span>rescue cases</span>
          </h1>
          <p className="paw-muted mb-0">
            Assign rescuers and monitor animal rescue operations.
          </p>
        </div>

        <button
          className="btn btn-outline-success"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw size={16} className="me-2" />
          Refresh
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="feature-card h-100">
            <HeartHandshake className="text-success mb-2" size={25} />
            <h3>{reports.length}</h3>
            <p className="paw-muted mb-0">Total reports</p>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="feature-card h-100">
            <Clock className="text-info mb-2" size={25} />
            <h3>{count("Submitted")}</h3>
            <p className="paw-muted mb-0">Unassigned reports</p>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="feature-card h-100">
            <Users className="text-primary mb-2" size={25} />
            <h3>{count("Assigned") + count("In Progress")}</h3>
            <p className="paw-muted mb-0">Active cases</p>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="feature-card h-100">
            <CheckCircle className="text-success mb-2" size={25} />
            <h3>{count("Resolved")}</h3>
            <p className="paw-muted mb-0">Resolved cases</p>
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
                placeholder="Search location, animal, reporter..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-lg-7 d-flex flex-wrap gap-2">
            {["All", ...statuses].map((status) => (
              <button
                key={status}
                className={`btn btn-sm ${
                  filter === status
                    ? "btn-success"
                    : "btn-outline-success"
                }`}
                onClick={() => setFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" />
          <p className="paw-muted mt-3">Loading rescue management...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="feature-card text-center py-5">
          <HeartHandshake size={42} className="text-success mb-3" />
          <h4>No rescue reports found</h4>
          <p className="paw-muted mb-0">
            Try changing the search or status filter.
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredReports.map((report) => (
            <div className="col-12" key={report._id}>
              <div className="feature-card">
                <div className="d-flex justify-content-between flex-wrap gap-3 mb-3">
                  <div>
                    <span className="eyebrow">RESCUE CASE</span>
                    <h5 className="mt-2 mb-1">
                      {report.animalType} — {report.location}
                    </h5>
                    <small className="paw-muted">
                      {report.createdAt
                        ? new Date(report.createdAt).toLocaleString()
                        : "Date unavailable"}
                    </small>
                  </div>

                  <span className="badge text-bg-info align-self-start">
                    {report.status}
                  </span>
                </div>

                <p>{report.description}</p>

                <div className="row g-2 mb-3">
                  <div className="col-md-4">
                    <strong>Reporter</strong>
                    <p className="paw-muted mb-1">
                      {report.reporter?.name || "Unknown"}
                    </p>
                  </div>
                  <div className="col-md-4">
                    <strong>Contact</strong>
                    <p className="paw-muted mb-1">
                      <Phone size={14} className="me-1" />
                      {report.contactPhone || "Not provided"}
                    </p>
                  </div>
                  <div className="col-md-4">
                    <strong>Location</strong>
                    <p className="paw-muted mb-1">
                      <MapPin size={14} className="me-1" />
                      {report.location}
                    </p>
                  </div>
                </div>

                {report.rescueNotes && (
                  <div className="alert alert-light border">
                    <strong>Rescue notes:</strong>
                    <p className="mb-0 mt-1">{report.rescueNotes}</p>
                  </div>
                )}

                <hr />

                <div className="row g-3 align-items-end">
                  <div className="col-lg-5">
                    <label className="form-label fw-semibold">
                      Assign rescuer
                    </label>
                    <select
                      className="form-select"
                      value={
                        selectedRescuers[report._id] ||
                        report.assignedRescuer?._id ||
                        ""
                      }
                      onChange={(e) =>
                        setSelectedRescuers((previous) => ({
                          ...previous,
                          [report._id]: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select a rescuer...</option>
                      {rescuers.map((rescuer) => (
                        <option key={rescuer._id} value={rescuer._id}>
                          {rescuer.name} ({rescuer.email})
                        </option>
                      ))}
                    </select>
                    <small className="paw-muted">
                      Current: {report.assignedRescuer?.name || "Not assigned"}
                    </small>
                  </div>

                  <div className="col-lg-3">
                    <button
                      className="btn btn-success w-100"
                      disabled={
                        updatingId !== null ||
                        (!selectedRescuers[report._id] &&
                          !report.assignedRescuer?._id)
                      }
                      onClick={() => assignRescuer(report)}
                    >
                      {updatingId === report._id
                        ? "Updating..."
                        : "Assign / Reassign"}
                    </button>
                  </div>

                  <div className="col-lg-4">
                    <label className="form-label fw-semibold">
                      Update case status
                    </label>
                    <select
                      className="form-select"
                      value={report.status}
                      disabled={updatingId !== null}
                      onChange={(e) => updateStatus(report, e.target.value)}
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
