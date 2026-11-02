
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus, PawPrint } from "lucide-react";
import API from "../services/api";

const initialForm = {
  name: "",
  species: "Dog",
  category: "Adult Dog",
  breed: "",
  age: 1,
  gender: "Unknown",
  description: "",
  image: "",
  location: "",
  healthStatus: "Not specified",
  vaccinated: false,
};

const fallbackImage =
  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=700";

export default function AddPet() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

    try {
      setSubmitting(true);

      await API.post("/pets", {
        ...form,
        name: form.name.trim(),
        breed: form.breed.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        age: Number(form.age),
      });

      navigate("/shelter/pets", {
        state: { message: "Pet listing created successfully." },
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
              <label className="form-label">
                <ImagePlus size={17} /> Pet image URL
              </label>
              <input
                className="form-control"
                type="url"
                value={form.image}
                onChange={(e) => field("image", e.target.value)}
                placeholder="https://example.com/pet-image.jpg"
              />
              <small className="paw-muted">
                Paste a publicly accessible image URL.
              </small>
            </div>

            <div className="col-12 mb-3">
              <img
                src={form.image || fallbackImage}
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
