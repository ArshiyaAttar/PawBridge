import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, PawPrint, RefreshCw, XCircle } from "lucide-react";
import API from "../services/api";

function PendingListingCard({ pet, onReview, reviewingId }) {
  const [photo, setPhoto] = useState("");

  useEffect(() => {
    let active = true;
    let objectUrl = "";

    API.get(`/admin/pet-listings/${pet._id}/photo`, {
      responseType: "blob",
    })
      .then(({ data }) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(data);
        setPhoto(objectUrl);
      })
      .catch(() => {
        if (active) setPhoto("");
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [pet._id]);

  return (
    <article className="feature-card h-100">
      {photo && (
        <img
          src={photo}
          alt={`${pet.name}, submitted for listing`}
          className="img-fluid rounded-3 mb-3 w-100"
          style={{ maxHeight: 280, objectFit: "cover" }}
        />
      )}
      <div className="d-flex justify-content-between align-items-start gap-3">
        <div>
          <span className="eyebrow">{pet.species} · {pet.category}</span>
          <h2 className="h4 mt-2">{pet.name}</h2>
        </div>
        <span className="badge text-bg-warning">Pending review</span>
      </div>

      <p className="paw-muted">
        {pet.breed || "Breed not specified"} · {pet.age} years · {pet.gender}
      </p>
      <p>{pet.description}</p>
      <p className="mb-1"><strong>Location:</strong> {pet.location}</p>
      <p className="mb-1"><strong>Health:</strong> {pet.healthStatus}</p>
      <p className="mb-1">
        <strong>Adoption fee:</strong>{" "}
        ₹{Number(pet.adoptionFee || 0).toLocaleString("en-IN")}
      </p>
      <div className="alert alert-light border mt-3">
        <strong>Submitted by</strong>
        <div>{pet.shelter?.name || "Account unavailable"}</div>
        <div>{pet.shelter?.email || "No email"}</div>
        <div>Contact: {pet.listingContactPhone || pet.shelter?.phone || "Not provided"}</div>
      </div>

      <div className="d-flex flex-wrap gap-2">
        <button
          className="btn btn-success"
          disabled={reviewingId !== null}
          onClick={() => onReview(pet, "Approved")}
        >
          <CheckCircle size={16} className="me-1" />
          {reviewingId === pet._id ? "Reviewing..." : "Approve and publish"}
        </button>
        <button
          className="btn btn-outline-danger"
          disabled={reviewingId !== null}
          onClick={() => onReview(pet, "Rejected")}
        >
          <XCircle size={16} className="me-1" />
          Reject
        </button>
      </div>
    </article>
  );
}

export default function AdminPetListings() {
  const [pets, setPets] = useState([]);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await API.get("/admin/pet-listings");
      setPets(data.pets || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load pet listing requests."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const review = async (pet, status) => {
    if (
      !window.confirm(
        status === "Approved"
          ? `Approve and publish ${pet.name}'s listing?`
          : `Reject ${pet.name}'s listing?`
      )
    ) {
      return;
    }

    try {
      setReviewingId(pet._id);
      setMessage("");
      setError("");
      const { data } = await API.patch(
        `/admin/pet-listings/${pet._id}/review`,
        { status, notes: notes[pet._id] || "" }
      );
      setMessage(data.message);
      await loadRequests();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to review this listing."
      );
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <main className="container paw-section">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <span className="eyebrow">ADMINISTRATION</span>
          <h1 className="section-title mt-2">
            Pet listing <span>requests</span>
          </h1>
          <p className="paw-muted mb-0">
            Review ownership/contact details and pet information before publishing.
          </p>
        </div>
        <button
          className="btn btn-outline-success"
          onClick={loadRequests}
          disabled={loading}
        >
          <RefreshCw size={16} className="me-2" />
          Refresh
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" />
          <p className="paw-muted mt-3">Loading listing requests...</p>
        </div>
      ) : pets.length === 0 ? (
        <div className="feature-card text-center py-5">
          <PawPrint size={42} className="text-success mb-3" />
          <h2 className="h4">No pending listings</h2>
          <p className="paw-muted">New pet submissions will appear here for review.</p>
        </div>
      ) : (
        <div className="row g-4">
          {pets.map((pet) => (
            <div className="col-lg-6" key={pet._id}>
              <PendingListingCard
                pet={pet}
                onReview={review}
                reviewingId={reviewingId}
              />
              <div className="px-3 pt-2">
                <label className="form-label" htmlFor={`notes-${pet._id}`}>
                  Review notes (optional)
                </label>
                <textarea
                  id={`notes-${pet._id}`}
                  className="form-control"
                  rows={2}
                  maxLength={1000}
                  value={notes[pet._id] || ""}
                  onChange={(event) =>
                    setNotes((previous) => ({
                      ...previous,
                      [pet._id]: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <Link to="/admin" className="btn btn-outline-secondary mt-4">
        Back to admin dashboard
      </Link>
    </main>
  );
}
