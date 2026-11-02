
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus, PawPrint } from "lucide-react";
import API from "../services/api";
import { createPetFormData } from "../services/petImages";

const initialForm = {
  name: "",
  species: "Dog",
  category: "Adult Dog",
  breed: "",
  age: 1,
  gender: "Unknown",
  description: "",
  photo: null,
  location: "",
  listingContactPhone: "",
  healthStatus: "Not specified",
  vaccinated: false,
  adoptionFee: 0,
};

const fallbackImage =
  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=700";

export default function AddPet() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");

  useEffect(() => {
    if (!form.photo) {
      setPhotoPreview("");
      return undefined;
    }

    const previewUrl = URL.createObjectURL(form.photo);
    setPhotoPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [form.photo]);

  const field = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (form.name.trim().length < 2) {
      setMessage("Pet name must contain at least 2 characters.");
      return;
    }

    if (!Number.isInteger(Number(form.age)) || Number(form.age) < 0) {
      setMessage("Please enter a valid age in whole years.");
      return;
    }

    if (
      !Number.isInteger(Number(form.adoptionFee)) ||
      Number(form.adoptionFee) < 0 ||
      Number(form.adoptionFee) > 1000000
    ) {
      setMessage("Adoption fee must be a whole amount between ₹0 and ₹1,000,000.");
      return;
    }

    if (!form.photo) {
      setMessage("Please upload a photo of the pet.");
      return;
    }

    try {
      setSubmitting(true);

      await API.post(
        "/pets",
        createPetFormData({
          ...form,
          name: form.name.trim(),
          breed: form.breed.trim(),
          description: form.description.trim(),
          location: form.location.trim(),
          age: Number(form.age),
          adoptionFee: Number(form.adoptionFee),
        }),
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      navigate("/my-listings", {
        state: { message: "Listing submitted. It will appear publicly after admin approval." },
      });
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Unable to add pet."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container paw-section">
      <div className="auth-card mx-auto" style={{ maxWidth: 750 }}>
        <div className="text-center mb-4">
          <PawPrint size={38} className="text-success mb-2" />
          <h2>Add a pet listing</h2>
          <p className="paw-muted">
            Help an animal find a loving forever home.
          </p>
        </div>

        {message && (
          <div className="alert alert-danger">{message}</div>
        )}

        <form onSubmit={submit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Pet name *</label>
              <input
                className="form-control"
                required
                minLength={2}
                maxLength={60}
                value={form.name}
                onChange={(e) => field("name", e.target.value)}
                placeholder="Enter pet name"
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Species *</label>
              <select
                className="form-select"
                value={form.species}
                onChange={(e) => field("species", e.target.value)}
              >
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Bird">Bird</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Breed</label>
              <input
                className="form-control"
                value={form.breed}
                onChange={(e) => field("breed", e.target.value)}
                placeholder="e.g. Labrador"
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={(e) => field("category", e.target.value)}>
                <option value="Puppy">Puppy</option>
                <option value="Adult Dog">Adult dog</option>
                <option value="Kitten">Kitten</option>
                <option value="Adult Cat">Adult cat</option>
                <option value="Bird">Bird</option>
                <option value="Senior">Senior</option>
                <option value="Special Care">Special care</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Age in years *</label>
              <input
                className="form-control"
                type="number"
                min="0"
                max="100"
                step="1"
                required
                value={form.age}
                onChange={(e) => field("age", e.target.value)}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Gender</label>
              <select
                className="form-select"
                value={form.gender}
                onChange={(e) => field("gender", e.target.value)}
              >
                <option value="Unknown">Unknown</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Location *</label>
              <input
                className="form-control"
                required
                value={form.location}
                onChange={(e) => field("location", e.target.value)}
                placeholder="City or area"
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="listing-contact-phone">
                Your contact phone *
              </label>
              <input
                id="listing-contact-phone"
                className="form-control"
                type="tel"
                required
                minLength={7}
                maxLength={20}
                pattern="[+]?[0-9 ()-]{7,20}"
                value={form.listingContactPhone}
                onChange={(e) => field("listingContactPhone", e.target.value)}
                placeholder="Phone number for admin verification"
              />
              <small className="paw-muted">
                Shared with admins for review; your listing is hidden until approval.
              </small>
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Adoption fee (₹)</label>
              <input
                className="form-control"
                type="number"
                min="0"
                max="1000000"
                step="1"
                value={form.adoptionFee}
                onChange={(e) => field("adoptionFee", e.target.value)}
              />
              <small className="paw-muted">
                Set 0 for no fee. Approved adoption fees are collected in cash at handoff.
              </small>
            </div>

            <div className="col-12 mb-3">
              <label className="form-label">Description *</label>
              <textarea
                className="form-control"
                required
                minLength={10}
                maxLength={2000}
                rows={4}
                value={form.description}
                onChange={(e) => field("description", e.target.value)}
                placeholder="Tell potential adopters about this pet..."
              />
            </div>

            <div className="col-12 mb-3">
              <label className="form-label" htmlFor="pet-photo">
                <ImagePlus size={17} /> Pet photo *
              </label>
              <input
                id="pet-photo"
                className="form-control"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required
                onChange={(e) => field("photo", e.target.files?.[0] || null)}
              />
              <small className="paw-muted">
                Upload a JPEG, PNG, or WebP image up to 5 MB.
              </small>
            </div>

            <div className="col-12 mb-3">
              <img
                src={photoPreview || fallbackImage}
                alt="Pet preview"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = fallbackImage;
                }}
                style={{
                  width: "100%",
                  maxHeight: 250,
                  objectFit: "cover",
                  borderRadius: 12,
                }}
              />
            </div>

            <div className="col-12 mb-3">
              <label className="form-label">Health status</label>
              <input
                className="form-control"
                value={form.healthStatus}
                onChange={(e) => field("healthStatus", e.target.value)}
                placeholder="e.g. Healthy, recovering..."
              />
            </div>

            <div className="col-12 mb-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="vaccinated"
                  checked={form.vaccinated}
                  onChange={(e) =>
                    field("vaccinated", e.target.checked)
                  }
                />
                <label className="form-check-label" htmlFor="vaccinated">
                  Vaccinated
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn paw-primary w-100"
            disabled={submitting}
          >
            {submitting ? "Creating listing..." : "Save pet listing"}
          </button>
        </form>
      </div>
    </main>
  );
}
