import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  ShieldCheck,
  VenusAndMars,
} from "lucide-react";
import API from "../services/api";
import { getPetImageSrc } from "../services/petImages";
import { useAuth } from "../context/AuthContext";

const fallbackImages = {
  Dog: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=900",
  Cat: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=900",
  Bird: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=900",
};

const getAgeLabel = (age) => {
  if (age === 0) return "Under 1 year";
  return `${age} ${age === 1 ? "year" : "years"} old`;
};

const formatRupees = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

export default function PetDetails() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [pet, setPet] = useState(null);
  const [reason, setReason] = useState("");
  const [experience, setExperience] = useState("");
  const [livingSituation, setLivingSituation] = useState("");
  const [applicantPhone, setApplicantPhone] = useState(user?.phone || "");
  const [householdConsent, setHouseholdConsent] = useState(false);
  const [carePlan, setCarePlan] = useState("");
  const [vetReference, setVetReference] = useState("");
  const [homeDeliveryRequested, setHomeDeliveryRequested] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [messageLoading, setMessageLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

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

  useEffect(() => {
    if (!user || !["adopter", "shelter", "admin"].includes(user.role)) {
      setConversation([]);
      return undefined;
    }

    let active = true;
    const loadConversation = async () => {
      try {
        setMessageLoading(true);
        const { data } = await API.get(`/messages/pet/${id}`);
        if (active) setConversation(data.messages || []);
      } catch {
        if (active) setConversation([]);
      } finally {
        if (active) setMessageLoading(false);
      }
    };

    loadConversation();
    return () => {
      active = false;
    };
  }, [id, user]);

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
        applicantPhone: applicantPhone.trim(),
        experience: experience.trim(),
        livingSituation: livingSituation.trim(),
        householdConsent,
        carePlan: carePlan.trim(),
        vetReference: vetReference.trim(),
        homeDeliveryRequested,
        deliveryAddress: homeDeliveryRequested ? deliveryAddress.trim() : "",
      });
      setSubmitted(true);
      const emailNotice =
        data.emailNotificationSent === false
          ? " Your application is saved, but we couldn't send the email notifications."
          : "";
      setMessage(
        `${data.message || "Your adoption application was submitted!"}${emailNotice}`
      );
    } catch (err) {
      setMessage(err.response?.data?.message || "Application failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (messageText.trim().length < 2) return;

    try {
      setSendingMessage(true);
      const { data } = await API.post(`/messages/pet/${id}`, {
        body: messageText.trim(),
      });
      setConversation((current) => [...current, data.conversationMessage]);
      setMessageText("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to send your message.");
    } finally {
      setSendingMessage(false);
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
              src={getPetImageSrc(pet) || fallbackImages[pet.species] || fallbackImages.Dog}
              alt={`${pet.name}, ${pet.species}`}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = fallbackImages[pet.species] || fallbackImages.Dog;
              }}
              className="pet-detail-image"
            />
            <span className={`pet-status-badge ${!isAvailable ? "pet-status-muted" : ""}`}>
              {pet.status}
            </span>
          </div>
        </div>

        <div className="col-lg-6">
          <span className="eyebrow">{pet.category || pet.species} · {pet.breed || "Mixed breed"}</span>
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

          <section className="feature-card mb-4">
            <h2 className="h6">Adoption fee</h2>
            <p className="mb-1 fw-semibold">
              {Number(pet.adoptionFee || 0) > 0
                ? `${formatRupees(pet.adoptionFee)} · Cash on delivery (COD)`
                : "No adoption fee"}
            </p>
            {Number(pet.adoptionFee || 0) > 0 && (
              <small className="paw-muted">
                The shelter records cash collection when the pet is handed over.
              </small>
            )}
          </section>

          <section className="adoption-tip-panel mb-4">
            <Home size={22} />
            <div>
              <h2 className="h6 mb-1">Home delivery beyond Solapur</h2>
              <p className="mb-0">
                Delivery requests from anywhere in India are considered case by case.
                The shelter must approve availability and confirm any delivery cost.
              </p>
            </div>
          </section>

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

          {user && pet.shelter && (user.role === "adopter" || user.role === "shelter" || user.role === "admin") && (
            <section className="chat-panel mb-4" aria-labelledby="shelter-chat-title">
              <div className="d-flex align-items-center gap-2 mb-2">
                <MessageCircle className="text-success" size={21} />
                <h2 id="shelter-chat-title" className="h5 mb-0">Chat with the shelter</h2>
              </div>
              <p className="paw-muted small">Ask a question about {pet.name}&apos;s care, personality, or adoption process.</p>
              <div className="chat-thread" aria-live="polite">
                {messageLoading ? (
                  <p className="paw-muted small mb-0">Loading conversation...</p>
                ) : conversation.length ? (
                  conversation.map((item) => {
                    const fromCurrentUser = item.sender?._id === user.id;
                    return (
                      <div className={`chat-bubble ${fromCurrentUser ? "chat-bubble-own" : ""}`} key={item._id}>
                        <strong>{fromCurrentUser ? "You" : item.sender?.name || "Shelter"}</strong>
                        <p className="mb-0">{item.body}</p>
                      </div>
                    );
                  })
                ) : (
                  <p className="paw-muted small mb-0">No messages yet. Start the conversation.</p>
                )}
              </div>
              {user.role === "adopter" && (
                <form className="mt-3" onSubmit={sendMessage}>
                  <label className="visually-hidden" htmlFor="shelter-message">Message the shelter</label>
                  <div className="input-group">
                    <input id="shelter-message" className="form-control" value={messageText} maxLength={2000} onChange={(e) => setMessageText(e.target.value)} placeholder="Ask the shelter a question..." />
                    <button className="btn paw-primary" type="submit" disabled={sendingMessage || messageText.trim().length < 2}>
                      {sendingMessage ? "Sending..." : "Send"}
                    </button>
                  </div>
                </form>
              )}
            </section>
          )}

          {pet.shelter && (
            <div className="feature-card mb-4">
              <h2 className="h6">Listed by</h2>
              <p className="mb-0">{pet.shelter.name}</p>
            </div>
          )}

          {message && <div className="alert alert-info">{message}</div>}

          {isAvailable && user?.role === "adopter" && !submitted && (
            <form onSubmit={apply} className="feature-card mt-4">
              <h2 className="h5"><Heart size={19} /> Apply to adopt {pet.name}</h2>
              <label className="form-label mt-3" htmlFor="applicant-phone">Contact phone *</label>
              <input
                id="applicant-phone"
                className="form-control mb-3"
                type="tel"
                required
                minLength={7}
                maxLength={20}
                pattern="[+]?[0-9 ()-]{7,20}"
                value={applicantPhone}
                onChange={(e) => setApplicantPhone(e.target.value)}
                placeholder="Phone number the shelter can reach you at"
              />
              <label className="form-label" htmlFor="adoption-reason">Why would you like to adopt?</label>
              <textarea id="adoption-reason" className="form-control mb-3" required minLength={10} maxLength={2000} rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Tell us why you would like to give this pet a home..." />
              <label className="form-label" htmlFor="pet-experience">Previous pet experience</label>
              <textarea id="pet-experience" className="form-control mb-3" rows={3} value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="Have you cared for pets before?" />
              <label className="form-label" htmlFor="living-situation">Living situation</label>
              <textarea id="living-situation" className="form-control mb-3" rows={3} value={livingSituation} onChange={(e) => setLivingSituation(e.target.value)} placeholder="Describe your home and living arrangements..." />
              <label className="form-label" htmlFor="adoption-care-plan">
                How will you care for this pet? *
              </label>
              <textarea
                id="adoption-care-plan"
                className="form-control mb-3"
                required
                minLength={20}
                maxLength={2000}
                rows={4}
                value={carePlan}
                onChange={(e) => setCarePlan(e.target.value)}
                placeholder="Describe daily care, exercise, veterinary visits, and how you will handle ongoing costs..."
              />
              <label className="form-label" htmlFor="vet-reference">
                Veterinarian reference (optional)
              </label>
              <input
                id="vet-reference"
                className="form-control mb-3"
                maxLength={200}
                value={vetReference}
                onChange={(e) => setVetReference(e.target.value)}
                placeholder="Clinic or veterinarian name and contact"
              />
              <div className="form-check mb-3">
                <input
                  id="household-consent"
                  className="form-check-input"
                  type="checkbox"
                  required
                  checked={householdConsent}
                  onChange={(e) => setHouseholdConsent(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="household-consent">
                  Everyone in my household agrees to adopt and help care for this pet. *
                </label>
              </div>
              <div className="form-check mb-3">
                <input
                  id="home-delivery"
                  className="form-check-input"
                  type="checkbox"
                  checked={homeDeliveryRequested}
                  onChange={(e) => setHomeDeliveryRequested(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="home-delivery">
                  Request home delivery (including outside Solapur)
                </label>
              </div>
              {homeDeliveryRequested && (
                <div className="mb-3">
                  <label className="form-label" htmlFor="delivery-address">
                    Delivery address *
                  </label>
                  <textarea
                    id="delivery-address"
                    className="form-control"
                    required
                    minLength={10}
                    maxLength={500}
                    rows={3}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Full address, city, state, and postal code"
                  />
                  <small className="paw-muted">
                    This is a request only; the shelter will confirm whether delivery is possible.
                  </small>
                </div>
              )}
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
