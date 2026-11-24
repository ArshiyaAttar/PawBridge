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
  ShoppingCart,
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
  const [applicantPhone, setApplicantPhone] = useState(user?.phone || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [purchased, setPurchased] = useState(false);
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
    if (user?.phone) setApplicantPhone(user.phone);
  }, [user?.phone]);

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

  const buy = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setMessage("");
      const { data } = await API.post(`/adoptions/${id}/buy`, {
        applicantPhone: applicantPhone.trim(),
      });
      setPurchased(true);
      setPet((current) => ({ ...current, status: "Adopted" }));
      const emailNotice =
        data.emailNotificationSent === false
          ? " Adoption is confirmed, but we couldn't send the confirmation email."
          : "";
      setMessage(
        `${data.message || "Adoption confirmed!"}${emailNotice}`
      );
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to confirm this adoption.");
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
              <h2 className="h6 mb-1">Coordinate a safe handoff</h2>
              <p className="mb-0">
                The shelter will contact you to arrange pickup or discuss delivery.
                Any delivery availability and cost are agreed directly with the shelter.
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
              <h2 className="h6 mb-1">A direct adoption</h2>
              <p className="mb-0">Confirm now, then coordinate a responsible handoff with the shelter.</p>
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

          {isAvailable && user?.role === "adopter" && !purchased && (
            <form onSubmit={buy} className="feature-card mt-4">
              <h2 className="h5"><ShoppingCart size={19} /> Adopt {pet.name} now</h2>
              <p className="paw-muted">
                This confirms the adoption immediately. The shelter will coordinate handoff.
                {Number(pet.adoptionFee || 0) > 0 && " Pay the fee in cash at handoff."}
              </p>
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
              <button type="submit" className="btn paw-primary w-100" disabled={submitting || applicantPhone.trim().length < 7}>
                {submitting ? "Confirming..." : Number(pet.adoptionFee || 0) > 0 ? "Buy / Adopt Now · Cash on delivery" : "Adopt Now"}
              </button>
            </form>
          )}

          {purchased && <Link to="/my-adoptions" className="btn paw-primary mt-3">View my adoptions</Link>}
          {!user && <Link className="btn paw-primary mt-3" to="/login">Log in to adopt</Link>}
          {user && user.role !== "adopter" && <div className="alert alert-secondary mt-3">Only adopter accounts can adopt a pet.</div>}
          {!isAvailable && !purchased && <div className="alert alert-warning mt-3">This pet is not currently available for adoption.</div>}
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
