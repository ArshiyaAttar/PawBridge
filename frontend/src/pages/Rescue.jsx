
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Camera,
  HeartHandshake,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Send,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

const initialForm = {
  animalType: "Dog",
  description: "",
  location: "",
  contactPhone: "",
  image: "",
};

export default function Rescue() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailNotificationSent, setEmailNotificationSent] = useState(null);

  const updateField = (e) => {
    const { name, value } = e.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    if (form.description.trim().length < 10) {
      setError("Please describe the animal's situation in at least 10 characters.");
      return;
    }

    if (!/^[+]?[\d\s()-]{7,20}$/.test(form.contactPhone.trim())) {
      setError("Please enter a valid contact phone number.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data } = await API.post("/rescues", {
        ...form,
        description: form.description.trim(),
        location: form.location.trim(),
        contactPhone: form.contactPhone.trim(),
        image: form.image.trim(),
      });

      setMessage(data.message || "Your rescue report has been submitted successfully.");
      setEmailNotificationSent(data.emailNotificationSent === true);
      setSubmitted(true);
      setForm(initialForm);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to submit rescue report. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container paw-section">
      <div className="row justify-content-center">
        <div className="col-lg-9 col-xl-8">
          <Link to="/dashboard" className="btn btn-outline-secondary btn-sm mb-4">
            <ArrowLeft size={16} className="me-2" />
            Back to Dashboard
          </Link>

          <div className="auth-card p-4 p-md-5">
            <div className="text-center mb-4">
              <div
                className="rounded-circle bg-success-subtle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: 76, height: 76 }}
              >
                <HeartHandshake size={38} className="text-success" />
              </div>

              <span className="eyebrow">BE THEIR VOICE</span>
              <h1 className="section-title mt-2">
                Report an animal <span>in need.</span>
              </h1>
              <p className="paw-muted">
                Your report can help connect an animal with someone who can
                provide care and protection.
              </p>
            </div>

            {submitted && (
              <div className="alert alert-success">
                <div className="d-flex gap-2 align-items-start">
                  <CheckCircle size={21} />
                  <div>
                    <strong>Report submitted!</strong>
                    <p className="mb-2">{message}</p>
                    {emailNotificationSent === false && (
                      <p className="mb-2">
                        Your report is saved, but we couldn't send the email
                        notifications. Please contact PawBridge support if you
                        need confirmation.
                      </p>
                    )}
                    <Link to="/my-rescues" className="alert-link">
                      Track your rescue report
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <div className="alert alert-warning d-flex gap-2 align-items-start">
              <AlertTriangle size={21} className="flex-shrink-0 mt-1" />
              <div>
                <strong>Immediate danger?</strong>
                <p className="mb-0 small">
                  If an animal is in immediate danger, contact local animal
                  rescue services or emergency authorities directly. Submitting
                  this form does not guarantee an immediate response.
                </p>
              </div>
            </div>

            <form onSubmit={submit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Animal type *</label>
                <select
                  className="form-select"
                  name="animalType"
                  value={form.animalType}
                  onChange={updateField}
                  required
                >
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Bird">Bird</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Situation and condition *
                </label>
                <textarea
                  className="form-control"
                  name="description"
                  rows="4"
                  minLength="10"
                  maxLength="1000"
                  placeholder="Describe what happened. Is the animal injured, abandoned, trapped, or sick?"
                  value={form.description}
                  onChange={updateField}
                  required
                />
                <div className="text-end small paw-muted mt-1">
                  {form.description.length}/1000
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  <MapPin size={16} className="me-1" />
                  Location / address *
                </label>
                <input
                  className="form-control"
                  name="location"
                  placeholder="Street, area, landmark, city"
                  value={form.location}
                  onChange={updateField}
                  maxLength="250"
                  required
                />
                <small className="paw-muted">
                  Include a nearby landmark so rescuers can find the animal.
                </small>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  <Phone size={16} className="me-1" />
                  Contact phone *
                </label>
                <input
                  className="form-control"
                  type="tel"
                  name="contactPhone"
                  placeholder="Your reachable phone number"
                  value={form.contactPhone}
                  onChange={updateField}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">
                  <Camera size={16} className="me-1" />
                  Animal image URL (optional)
                </label>
                <input
                  className="form-control"
                  type="url"
                  name="image"
                  placeholder="https://example.com/animal-photo.jpg"
                  value={form.image}
                  onChange={updateField}
                />
                <small className="paw-muted">
                  Add a publicly accessible image link if available.
                </small>
              </div>

              <button
                type="submit"
                className="btn paw-primary w-100 py-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Submitting report...
                  </>
                ) : (
                  <>
                    <Send size={17} className="me-2" />
                    Submit Rescue Report
                  </>
                )}
              </button>
            </form>

            <p className="text-center small paw-muted mt-3 mb-0">
              Thank you for helping animals in need. Every report matters.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
