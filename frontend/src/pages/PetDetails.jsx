import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Heart,
  Home,
  MapPin,
  ShieldCheck,
  VenusAndMars,
} from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const fallbackImage =
  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=900";

const getAgeLabel = (age) => {
  if (age === 0) return "Under 1 year";
  return `${age} ${age === 1 ? "year" : "years"} old`;
};

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
        if (active) setPet(data.pet);
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message || "Pet details could not be loaded."
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
      setMessage(data.message || "Your adoption application was submitted!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Application failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <main className="container paw-section text-center" role="status">
        <div className="spinner-border text-success" />
        <p className="mt-3">Loading pet details...</p>
      </main>
    );
  }

  if (error || !pet) {
    return (
      <main className="container paw-section">
        <Link to="/pets" className="text-success text-decoration-none">
          <ArrowLeft size={18} /> Back to pets
        </Link>
        <div className="alert alert-warning mt-4">{error || "Pet not found."}</div>
      </main>
    );
  }

  const isAvailable = pet.status === "Available";

  return (
    <main className="container paw-section">
      <Link to="/pets" className="text-success text-decoration-none">
        <ArrowLeft size={18} /> Back to pets
      </Link>

      <div className="row g-5 mt-2 align-items-start">
        <div className="col-lg-6">
          <div className="pet-detail-image-wrap">
            <img
              src={pet.image || fallbackImage}
              alt={`${pet.name}, ${pet.species}`}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = fallbackImage;
              }}
              className="pet-detail-image"
            />
            <span className={`pet-status-badge ${!isAvailable ? "pet-status-muted" : ""}`}>
              {pet.status}
            </span>
          </div>
        </div>

        <div className="col-lg-6">
          <span className="eyebrow">{pet.species} · {pet.breed || "Mixed breed"}</span>
          <h1 className="section-title mb-2">Meet {pet.name}</h1>
          <p className="paw-muted mb-4">
            A {getAgeLabel(pet.age).toLowerCase()} companion looking for a safe, loving home.
          </p>

          <div className="pet-detail-facts mb-4">
            <div><VenusAndMars size={18} /><span><small>Gender</small><strong>{pet.gender || "Unknown"}</strong></span></div>
            <div><MapPin size={18} /><span><small>Location</small><strong>{pet.location}</strong></span></div>
            <div><Activity size={18} /><span><small>Health</small><strong>{pet.healthStatus || "Not specified"}</strong></span></div>
            <div><CheckCircle2 size={18} /><span><small>Vaccination</small><strong>{pet.vaccinated ? "Vaccinated" : "Not confirmed"}</strong></span></div>
          </div>

          <section className="pet-about-panel mb-4">
            <h2 className="h5">About {pet.name}</h2>
            <p className="mb-0">{pet.description || "This pet is waiting to meet a caring family."}</p>
          </section>

          <section className="adoption-tip-panel mb-4">
            <ShieldCheck size={22} />
            <div>
              <h2 className="h6 mb-1">Adoption starts with a conversation</h2>
              <p className="mb-0">Tell the shelter about your home, experience, and the kind of care you can provide.</p>
            </div>
          </section>

          {pet.shelter && (
            <div className="feature-card mb-4">
              <h2 className="h6">Listed by shelter</h2>
              <p className="mb-0">{pet.shelter.name}</p>
            </div>
          )}

          {message && <div className="alert alert-info">{message}</div>}

          {isAvailable && user?.role === "adopter" && !submitted && (
            <form onSubmit={apply} className="feature-card mt-4">
              <h2 className="h5"><Heart size={19} /> Apply to adopt {pet.name}</h2>
              <label className="form-label mt-3" htmlFor="adoption-reason">Why would you like to adopt?</label>
              <textarea id="adoption-reason" className="form-control mb-3" required minLength={10} maxLength={2000} rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Tell us why you would like to give this pet a home..." />
              <label className="form-label" htmlFor="pet-experience">Previous pet experience</label>
              <textarea id="pet-experience" className="form-control mb-3" rows={3} value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="Have you cared for pets before?" />
              <label className="form-label" htmlFor="living-situation">Living situation</label>
              <textarea id="living-situation" className="form-control mb-3" rows={3} value={livingSituation} onChange={(e) => setLivingSituation(e.target.value)} placeholder="Describe your home and living arrangements..." />
              <button type="submit" className="btn paw-primary w-100" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit adoption application"}
              </button>
            </form>
          )}

          {submitted && <Link to="/my-applications" className="btn paw-primary mt-3">View my applications</Link>}
          {!user && <Link className="btn paw-primary mt-3" to="/login">Login to apply</Link>}
          {user && user.role !== "adopter" && <div className="alert alert-secondary mt-3">Only adopter accounts can submit adoption applications.</div>}
          {!isAvailable && <div className="alert alert-warning mt-3">This pet is not currently available for adoption.</div>}
        </div>
      </div>

      <section className="row g-4 mt-4">
        <div className="col-md-4"><div className="feature-card h-100"><Home className="text-success mb-3" /><h2 className="h6">Prepare your home</h2><p className="paw-muted mb-0">Create a calm, safe space before your new companion arrives.</p></div></div>
        <div className="col-md-4"><div className="feature-card h-100"><Heart className="text-success mb-3" /><h2 className="h6">Plan for connection</h2><p className="paw-muted mb-0">Patience, routine, and positive reinforcement help pets settle in.</p></div></div>
        <div className="col-md-4"><div className="feature-card h-100"><ShieldCheck className="text-success mb-3" /><h2 className="h6">Ask questions</h2><p className="paw-muted mb-0">The shelter team can share more about temperament, care, and history.</p></div></div>
      </section>
    </main>
  );
}
