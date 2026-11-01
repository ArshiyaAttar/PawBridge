
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  PawPrint,
  ClipboardList,
  CalendarDays,
  UserRound,
  Heart,
  CheckCircle,
} from "lucide-react";
import API from "../services/api";

const statusStyles = {
  Pending: "text-bg-warning",
  "Under Review": "text-bg-info",
  Approved: "text-bg-success",
  Rejected: "text-bg-danger",
};

export default function ApplicationDetails() {
  const { id } = useParams();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadApplication = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await API.get(`/adoptions/${id}`);

        if (active) {
          setApplication(data.application);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load application details."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadApplication();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="container paw-section text-center">
        <div className="spinner-border text-success" />
        <p className="paw-muted mt-3">Loading application details...</p>
      </main>
    );
  }

  if (error || !application) {
    return (
      <main className="container paw-section">
        <div className="alert alert-danger">
          {error || "Application not found."}
        </div>
        <Link to="/my-applications" className="btn btn-outline-success">
          <ArrowLeft size={16} className="me-2" />
          Back to applications
        </Link>
      </main>
    );
  }

  const pet = application.pet;
  const applicant = application.applicant;

  return (
    <main className="container paw-section">
      <Link
        to="/my-applications"
        className="btn btn-outline-secondary btn-sm mb-4"
      >
        <ArrowLeft size={16} className="me-2" />
        Back to applications
      </Link>

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <span className="eyebrow">APPLICATION INFORMATION</span>
          <h1 className="section-title mt-2">
            Application <span>details.</span>
          </h1>
          <p className="paw-muted mb-0">
            Review the application information and its current progress.
          </p>
        </div>

        <span
          className={`badge fs-6 ${
            statusStyles[application.status] || "text-bg-secondary"
          }`}
        >
          {application.status}
        </span>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="feature-card mb-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <ClipboardList size={22} className="text-success" />
              <h5 className="mb-0">Application information</h5>
            </div>

            <div className="row g-3">
              <div className="col-sm-6">
                <small className="paw-muted">Application ID</small>
                <p className="fw-semibold text-break">{application._id}</p>
              </div>

              <div className="col-sm-6">
                <small className="paw-muted">Submitted on</small>
                <p className="fw-semibold">
                  {application.createdAt
                    ? new Date(application.createdAt).toLocaleString()
                    : "Not available"}
                </p>
              </div>

              <div className="col-sm-6">
                <small className="paw-muted">Last reviewed</small>
                <p className="fw-semibold">
                  {application.reviewedAt
                    ? new Date(application.reviewedAt).toLocaleString()
                    : "Not reviewed yet"}
                </p>
              </div>

              <div className="col-sm-6">
                <small className="paw-muted">Current status</small>
                <p className="fw-semibold">{application.status}</p>
              </div>
            </div>
          </div>

          <div className="feature-card mb-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <Heart size={22} className="text-success" />
              <h5 className="mb-0">Your adoption information</h5>
            </div>

            <h6>Reason for adoption</h6>
            <p className="paw-muted">
              {application.reason || "Not provided"}
            </p>

            <h6>Previous pet experience</h6>
            <p className="paw-muted">
              {application.experience || "Not provided"}
            </p>

            <h6>Living situation</h6>
            <p className="paw-muted mb-0">
              {application.livingSituation || "Not provided"}
            </p>
          </div>

          <div className="feature-card">
            <div className="d-flex align-items-center gap-2 mb-3">
              <CheckCircle size={22} className="text-success" />
              <h5 className="mb-0">Shelter review and feedback</h5>
            </div>

            {application.shelterNotes ? (
              <p className="paw-muted mb-0">{application.shelterNotes}</p>
            ) : (
              <p className="paw-muted mb-0">
                The shelter has not added any feedback yet.
              </p>
            )}
          </div>
        </div>

        <div className="col-lg-5">
          <div className="feature-card mb-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <PawPrint size={22} className="text-success" />
              <h5 className="mb-0">Pet information</h5>
            </div>

            {pet ? (
              <>
                {pet.image && (
                  <img
                    src={pet.image}
                    alt={pet.name}
                    className="img-fluid rounded-3 mb-3 w-100"
                    style={{ maxHeight: 230, objectFit: "cover" }}
                  />
                )}

                <h4>{pet.name}</h4>
                <p className="paw-muted">
                  {pet.species || "Animal"} · {pet.breed || "Unknown breed"}
                </p>

                <p>
                  <strong>Age:</strong> {pet.age || "Not specified"}
                </p>
                <p>
                  <strong>Gender:</strong> {pet.gender || "Not specified"}
                </p>
                <p>
                  <strong>Location:</strong>{" "}
                  {pet.location || "Not specified"}
                </p>

                <Link
                  to={`/pets/${pet._id}`}
                  className="btn btn-outline-success btn-sm"
                >
                  View pet listing
                </Link>
              </>
            ) : (
              <p className="paw-muted">
                The original pet listing is no longer available.
              </p>
            )}
          </div>

          {applicant && (
            <div className="feature-card">
              <div className="d-flex align-items-center gap-2 mb-3">
                <UserRound size={22} className="text-success" />
                <h5 className="mb-0">Applicant</h5>
              </div>

              <p>
                <strong>Name:</strong> {applicant.name}
              </p>
              <p>
                <strong>Email:</strong> {applicant.email}
              </p>
              <p className="mb-0">
                <strong>Phone:</strong> {applicant.phone || "Not provided"}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <Link to="/my-applications" className="btn btn-outline-secondary">
          <CalendarDays size={16} className="me-2" />
          All my applications
        </Link>
      </div>
    </main>
  );
}
