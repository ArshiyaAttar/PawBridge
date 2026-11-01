
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Heart } from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const fallbackImage =
  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=900";

export default function PetDetails() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [pet, setPet] = useState(null);
  const [reason, setReason] = useState("");
  const [experience, setExperience] = useState("");
  const [livingSituation, setLivingSituation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let active = true;

    const loadPet = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await API.get(`/pets/${id}`);

        if (active) {
          setPet(data.pet);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Pet details could not be loaded."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadPet();

    return () => {
      active = false;
    };
  }, [id]);

  const apply = async (e) => {
    e.preventDefault();

    if (reason.trim().length < 10) {
      setMessage("Please provide at least 10 characters.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const { data } = await API.post(`/adoptions/${id}/apply`, {
        reason: reason.trim(),
        experience: experience.trim(),
        livingSituation: livingSituation.trim(),
      });

      setSubmitted(true);
      setMessage(
        data.message || "Your adoption application was submitted!"
      );
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Application failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <main className="container paw-section text-center">
        <div className="spinner-border text-success" />
        <p className="mt-3">Loading pet details...</p>
      </main>
    );
  }

  if (error || !pet) {
    return (
      <main className="container paw-section">
        <Link to="/pets" className="text-success">
          <ArrowLeft size={18} /> Back to pets
        </Link>

        <div className="alert alert-warning mt-4">
          {error || "Pet not found."}
        </div>
      </main>
    );
  }

  return (
    <main className="container paw-section">
      <Link to="/pets" className="text-success text-decoration-none">
        <ArrowLeft size={18} /> Back to pets
      </Link>

      <div className="row g-5 mt-2">
        <div className="col-lg-6">
          <img
            src={pet.image || fallbackImage}
            alt={pet.name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = fallbackImage;
            }}
            className="w-100 rounded-4"
            style={{
              maxHeight: 500,
              objectFit: "cover",
            }}
          />
        </div>

        <div className="col-lg-6">
          <span className="eyebrow">{pet.species}</span>

          <h1 className="section-title">{pet.name}</h1>

          <p className="paw-muted">
            {pet.breed || "Mixed breed"} · {pet.age} years ·{" "}
            {pet.gender}
          </p>

          <span className="badge text-bg-success mb-3">
            {pet.status}
          </span>

          <p>{pet.description}</p>

          <p>
            <MapPin size={17} /> {pet.location}
          </p>

          <p>
            <strong>Health:</strong>{" "}
            {pet.healthStatus || "Not specified"}
          </p>

          <p>
            <strong>Vaccinated:</strong>{" "}
            {pet.vaccinated ? "Yes" : "Not confirmed"}
          </p>

          {pet.shelter && (
            <div className="feature-card mt-3">
              <h6>Listed by shelter</h6>
              <p className="mb-0">
                {pet.shelter.name}
              </p>
            </div>
          )}

          {message && (
            <div className="alert alert-info mt-3">
              {message}
            </div>
          )}

          {pet.status === "Available" &&
            user?.role === "adopter" &&
            !submitted && (
              <form
                onSubmit={apply}
                className="feature-card mt-4"
              >
                <h5>
                  <Heart size={19} /> Apply to adopt {pet.name}
                </h5>

                <label className="form-label mt-3">
                  Why would you like to adopt?
                </label>

                <textarea
                  className="form-control mb-3"
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Tell us why you would like to give this pet a home..."
                />

                <label className="form-label">
                  Previous pet experience
                </label>

                <textarea
                  className="form-control mb-3"
                  rows={3}
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Have you cared for pets before?"
                />

                <label className="form-label">
                  Living situation
                </label>

                <textarea
                  className="form-control mb-3"
                  rows={3}
                  value={livingSituation}
                  onChange={(e) =>
                    setLivingSituation(e.target.value)
                  }
                  placeholder="Describe your home and living arrangements..."
                />

                <button
                  type="submit"
                  className="btn paw-primary w-100"
                  disabled={submitting}
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit adoption application"}
                </button>
              </form>
            )}

          {submitted && (
            <Link
              to="/my-applications"
              className="btn paw-primary mt-3"
            >
              View my applications
            </Link>
          )}

          {!user && (
            <Link
              className="btn paw-primary mt-3"
              to="/login"
            >
              Login to apply
            </Link>
          )}

          {user && user.role !== "adopter" && (
            <div className="alert alert-secondary mt-3">
              Only adopter accounts can submit adoption applications.
            </div>
          )}

          {pet.status !== "Available" && (
            <div className="alert alert-warning mt-3">
              This pet is not currently available for adoption.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
