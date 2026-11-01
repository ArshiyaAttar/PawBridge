
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, PawPrint } from "lucide-react";
import API from "../services/api";

const fallbackImage =
  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=700";

export default function Pets() {
  const [pets, setPets] = useState([]);
  const [search, setSearch] = useState("");
  const [species, setSpecies] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const { data } = await API.get("/pets", {
          params: {
            search: search.trim(),
            species,
            status: "Available",
          },
        });

        if (active) {
          setPets(data.pets || []);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load pets. Please try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search, species]);

  return (
    <main className="container paw-section">
      <span className="eyebrow">FIND YOUR COMPANION</span>

      <h1 className="section-title">
        Meet your new <span>best friend.</span>
      </h1>

      <p className="paw-muted">
        Every animal deserves a loving home. Find your perfect companion.
      </p>

      <div className="row g-3 my-4">
        <div className="col-md-8">
          <div className="input-group">
            <span className="input-group-text bg-white">
              <Search size={20} />
            </span>

            <input
              type="search"
              className="form-control"
              placeholder="Search by name, breed or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="col-md-4">
          <select
            className="form-select p-3"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
          >
            <option value="">All animals</option>
            <option value="Dog">Dogs</option>
            <option value="Cat">Cats</option>
            <option value="Bird">Birds</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-success" />
          <p className="mt-3">Finding your new companion...</p>
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {!loading && !error && pets.length === 0 && (
        <div className="text-center py-5">
          <PawPrint size={48} className="mb-3 text-success" />
          <h4>No pets found</h4>
          <p className="paw-muted">
            Try another search or change your filters.
          </p>
          <button
            className="btn btn-outline-success"
            onClick={() => {
              setSearch("");
              setSpecies("");
            }}
          >
            Clear filters
          </button>
        </div>
      )}

      <div className="row g-4">
        {!loading &&
          !error &&
          pets.map((pet) => (
            <div className="col-sm-6 col-lg-4" key={pet._id}>
              <div className="paw-card h-100">
                <img
                  src={pet.image || fallbackImage}
                  alt={pet.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = fallbackImage;
                  }}
                  style={{
                    width: "100%",
                    height: 230,
                    objectFit: "cover",
                  }}
                />

                <div className="p-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-2">{pet.name}</h5>
                    <span className="badge text-bg-success">
                      {pet.status}
                    </span>
                  </div>

                  <p className="paw-muted">
                    {pet.species} · {pet.breed || "Mixed breed"} ·{" "}
                    {pet.age} years
                  </p>

                  <p>
                    <MapPin size={15} /> {pet.location}
                  </p>

                  <Link
                    to={`/pets/${pet._id}`}
                    className="btn paw-primary w-100"
                  >
                    Meet {pet.name}
                  </Link>
                </div>
              </div>
            </div>
          ))}
      </div>
    </main>
  );
}
