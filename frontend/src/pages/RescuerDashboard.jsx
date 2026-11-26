
import { useCallback, useEffect, useState } from "react";
import {
  RefreshCw,
  MapPin,
  Phone,
  CheckCircle,
  HeartHandshake,
  Play,
  Activity,
  CheckCircle2,
  Clock3,
  PawPrint,
} from "lucide-react";
import API from "../services/api";
import DashboardLayout from "../components/DashboardLayout";

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

  const collectDonation = async (report) => {
    if (
      !window.confirm(
        `Confirm that ₹${Number(report.donationAmount).toLocaleString("en-IN")} was received for this rescue report?`
      )
    ) {
      return;
    }

    try {
      setUpdatingId(report._id);
      setMessage("");
      setError("");
      await API.patch(`/rescues/${report._id}`, {
        donationStatus: "Collected",
      });
      setMessage("Rescue donation recorded as collected.");
      await loadReports();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to record donation collection."
      );
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

  const reportStatusCounts = ["Assigned", "In Progress", "Resolved"].map(
    (status) => ({
      label: status,
      value: assigned.filter((report) => report.status === status).length,
      color: status === "Resolved" ? "green" : status === "In Progress" ? "blue" : "amber",
    })
  );
  const allStatusCounts = ["Submitted", "Assigned", "In Progress", "Resolved"].map(
    (status) => ({
      label: status,
      value: reports.filter((report) => report.status === status).length,
      color: status === "Resolved" ? "green" : status === "In Progress" ? "blue" : "amber",
    })
  );

  return (
    <DashboardLayout
      roleLabel="Rescuer"
      title="Rescue operations"
      description="Manage assigned rescue cases and keep their progress up to date."
      navItems={[
        { title: "Dashboard", url: "/rescuer", icon: Activity },
        { title: "Rescue cases", url: "/rescuer#rescue-cases", icon: HeartHandshake },
        { title: "Report an animal", url: "/rescue", icon: PawPrint },
        { title: "My profile", url: "/profile", icon: CheckCircle2 },
      ]}
      stats={[
        { label: "Assigned cases", value: loading ? "…" : assigned.length, icon: HeartHandshake, detail: "Cases assigned to you" },
        { label: "In progress", value: loading ? "…" : inProgress.length, icon: Clock3, detail: "Currently being handled" },
        { label: "Resolved", value: loading ? "…" : resolved.length, icon: CheckCircle2, detail: "Successfully completed" },
        { label: "Visible reports", value: loading ? "…" : reports.length, icon: PawPrint, detail: "Assigned or awaiting assignment" },
      ]}
      charts={loading ? [] : [
        { title: "Your assigned cases", items: reportStatusCounts },
        { title: "Rescue report progress", items: allStatusCounts },
      ]}
      actions={
        <button
          className="btn btn-outline-success"
          onClick={loadReports}
          disabled={loading}
        >
          <RefreshCw size={16} className="me-2" />
          Refresh
        </button>
      }
    >

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {emailWarning && <div className="alert alert-warning">{emailWarning}</div>}

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

      <section id="rescue-cases" className="dashboard-quick-access">
        <h2 className="mb-3">Rescue cases</h2>
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

                {Number(report.donationAmount) > 0 && (
                  <div className="alert alert-light border">
                    <strong>Cash donation pledge:</strong>{" "}
                    ₹{Number(report.donationAmount).toLocaleString("en-IN")}
                    <span className="ms-2">· {report.donationStatus}</span>
                    {report.donationStatus === "Pledged" && (
                      <button
                        className="btn btn-sm btn-outline-success d-block mt-2"
                        disabled={updatingId !== null}
                        onClick={() => collectDonation(report)}
                      >
                        {updatingId === report._id
                          ? "Recording..."
                          : "Confirm cash collected"}
                      </button>
                    )}
                  </div>
                )}

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
      </section>
    </DashboardLayout>
  );
}
