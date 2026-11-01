
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ImagePlus } from "lucide-react";
import API from "../services/api";

const fallbackImage =
  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=700";

export default function EditPet() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    const loadPet = async () => {
      try {
        const { data } = await API.get(`/pets/${id}`);
        const pet = data.pet;

        if (active) {
          setForm({
            name: pet.name || "",
            species: pet.species || "Dog",
            breed: pet.breed || "",
            age: pet.age ?? 0,
            gender: pet.gender || "Unknown",
            description: pet.description || "",
            image: pet.image || "",
            location: pet.location || "",
            healthStatus: pet.healthStatus || "Not specified",
            vaccinated: Boolean(pet.vaccinated),
          });
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message || "Unable to load pet."
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

  const update = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.name.trim().length < 2) {
      setError("Pet name must contain at least 2 characters.");
      return;
    }

    if (!Number.isInteger(Number(form.age)) || Number(form.age) < 0) {
      setError("Please enter a valid age in whole years.");
      return;
    }

    try {
      setSubmitting(true);

      await API.put(`/pets/${id}`, {
        ...form,
        name: form.name.trim(),
        breed: form.breed.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        age: Number(form.age),
      });

      navigate("/shelter/pets", {
        state: { message: "Pet listing updated successfully." },
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update pet."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="container paw-section text-center">
        <div className="spinner-border text-success" />
        <p className="mt-3">Loading pet information...</p>
      </main>
    );
  }

  if (!form) {
    return (
      <main className="container paw-section">
        <div className="alert alert-danger">
          {error || "Pet not found."}
        </div>
        <Link to="/shelter/pets" className="btn btn-outline-success">
          Back to pets
        </Link>
      </main>
    );
  }

  return (
    <main className="container paw-section">
      <Link
        to="/shelter/pets"
        className="text-success text-decoration-none"
      >
        <ArrowLeft size={18} /> Back to pets
      </Link>

      <div className="auth-card mx-auto mt-4" style={{ maxWidth: 750 }}>
        <h2>Edit pet listing</h2>
        <p className="paw-muted">
          Update the information shown to potential adopters.
        </p>

        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        <form onSubmit={submit}>
          <label className="form-label">Pet name *</label>
          <input
            className="form-control mb-3"
            required
            minLength={2}
            maxLength={60}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />

          <label className="form-label">Species *</label>
          <select
            className="form-select mb-3"
            value={form.species}
            onChange={(e) => update("species", e.target.value)}
          >
            <option value="Dog">Dog</option>
            <option value="Cat">Cat</option>
            <option value="Bird">Bird</option>
            <option value="Other">Other</option>
          </select>

          <label className="form-label">Breed</label>
          <input
            className="form-control mb-3"
            value={form.breed}
            onChange={(e) => update("breed", e.target.value)}
          />

          <label className="form-label">Age in years *</label>
          <input
            className="form-control mb-3"
            type="number"
            min="0"
            max="100"
            step="1"
            required
            value={form.age}
            onChange={(e) => update("age", e.target.value)}
          />

          <label className="form-label">Gender</label>
          <select
            className="form-select mb-3"
            value={form.gender}
            onChange={(e) => update("gender", e.target.value)}
          >
            <option value="Unknown">Unknown</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <label className="form-label">Description *</label>
          <textarea
            className="form-control mb-3"
            required
            minLength={10}
            maxLength={2000}
            rows={4}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />

          <label className="form-label">
            <ImagePlus size={17} /> Image URL
          </label>
          <input
            className="form-control mb-3"
            type="url"
            value={form.image}
            onChange={(e) => update("image", e.target.value)}
          />

          <img
            src={form.image || fallbackImage}
            alt="Pet preview"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = fallbackImage;
            }}
            className="w-100 mb-3"
            style={{
              maxHeight: 250,
              objectFit: "cover",
              borderRadius: 12,
            }}
          />

          <label className="form-label">Location *</label>
          <input
            className="form-control mb-3"
            required
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
          />

          <label className="form-label">Health status</label>
          <input
            className="form-control mb-3"
            value={form.healthStatus}
            onChange={(e) => update("healthStatus", e.target.value)}
          />

          <div className="form-check mb-4">
            <input
              className="form-check-input"
              type="checkbox"
              id="editVaccinated"
              checked={form.vaccinated}
              onChange={(e) =>
                update("vaccinated", e.target.checked)
              }
            />
            <label className="form-check-label" htmlFor="editVaccinated">
              Vaccinated
            </label>
          </div>

          <button
            type="submit"
            className="btn paw-primary w-100"
            disabled={submitting}
          >
            {submitting ? "Saving changes..." : "Save changes"}
          </button>
        </form>
      </div>
    </main>
  );
}
