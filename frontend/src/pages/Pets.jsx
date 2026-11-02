import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  CheckCircle2,
  MapPin,
  PawPrint,
  Search,
  VenusAndMars,
} from "lucide-react";
import API from "../services/api";

const fallbackImage =
  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=700";

const fallbackImages = {
  Dog: fallbackImage,
  Cat: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=700",
  Bird: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=700",
};

const getAgeLabel = (age) => {
  if (age === 0) return "Under 1 year";
  return `${age} ${age === 1 ? "year" : "years"} old`;
};

export default function Pets() {
  const [pets, setPets] = useState([]);
  const [search, setSearch] = useState("");
  const [species, setSpecies] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await API.get("/pets", {
          params: {
            search: search.trim(),
            species,
            category,
            status: "Available",
          },
        });

        if (active) setPets(data.pets || []);
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
  }, [search, species, category, retryKey]);

  const clearFilters = () => {
    setSearch("");
    setSpecies("");
    setCategory("");
  };

  return (
    <main className="container paw-section">
      <div className="pets-heading d-flex justify-content-between align-items-end gap-3 flex-wrap">
        <div>
          <span className="eyebrow">FIND YOUR COMPANION</span>
          <h1 className="section-title mb-2">
            Meet your new <span>best friend.</span>
          </h1>
          <p className="paw-muted mb-0">
            Explore available pets and learn what makes each one special.
          </p>
        </div>
        <div className="pet-count-note">
          <PawPrint size={18} />
          <span>{loading ? "…" : pets.length} pets found</span>
        </div>
      </div>

      <div className="pet-filter-panel my-4">
        <div className="row g-3 align-items-end">
          <div className="col-lg-8">
            <label className="form-label" htmlFor="pet-search">
              Search the adoption listings
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <Search size={20} aria-hidden="true" />
              </span>
              <input
                id="pet-search"
                type="search"
                className="form-control"
                placeholder="Search by name, breed or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6 col-lg-2">
            <label className="form-label" htmlFor="species-filter">
              Animal type
            </label>
            <select
              id="species-filter"
              className="form-select"
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
          <div className="col-md-6 col-lg-2">
            <label className="form-label" htmlFor="category-filter">Category</label>
            <select id="category-filter" className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All stages</option>
              <option value="Puppy">Puppies</option>
              <option value="Adult Dog">Adult dogs</option>
              <option value="Kitten">Kittens</option>
              <option value="Adult Cat">Adult cats</option>
              <option value="Senior">Seniors</option>
              <option value="Bird">Birds</option>
              <option value="Special Care">Special care</option>
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="pet-state text-center py-5" role="status">
          <div className="spinner-border text-success" />
          <p className="mt-3 mb-0">Finding your new companion...</p>
        </div>
      )}

      {!loading && error && (
        <div
          className="alert alert-danger d-flex justify-content-between align-items-center gap-3"
          role="alert"
        >
          <span>{error}</span>
          <div className="d-flex gap-2 flex-shrink-0">
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => setRetryKey((current) => current + 1)}
            >
              Try again
            </button>
            {(search || species || category) && (
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {!loading && !error && pets.length === 0 && (
        <div className="pet-state text-center py-5">
          <PawPrint size={48} className="mb-3 text-success" aria-hidden="true" />
          <h4>No pets found</h4>
          <p className="paw-muted">Try another search or change your filters.</p>
          <button className="btn btn-outline-success" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      )}

      <div className="row g-4">
        {!loading &&
          !error &&
          pets.map((pet) => (
            <div className="col-sm-6 col-lg-4" key={pet._id}>
              <article className="pet-card h-100">
                <div className="pet-card-image-wrap">
                  <img
                    src={pet.image || fallbackImages[pet.species] || fallbackImage}
                    alt={`${pet.name}, ${pet.species}`}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        fallbackImages[pet.species] || fallbackImage;
                    }}
                    className="pet-card-image"
                  />
                  <span className="pet-status-badge">{pet.status}</span>
                </div>

                <div className="p-4 d-flex flex-column h-100">
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div>
                      <h2 className="h4 fw-bold mb-1">{pet.name}</h2>
                      <p className="paw-muted mb-3">
                        {pet.breed || "Mixed breed"} · {getAgeLabel(pet.age)}
                      </p>
                    </div>
                    <span className="species-tag">{pet.species}</span>
                  </div>

                  <div className="pet-fact-list mb-3">
                    <span><VenusAndMars size={15} /> {pet.gender || "Unknown"}</span>
                    <span><MapPin size={15} /> {pet.location}</span>
                    <span>
                      <CheckCircle2 size={15} />
                      {pet.vaccinated ? "Vaccinated" : "Vaccination unconfirmed"}
                    </span>
                  </div>

                  <p className="pet-description mb-4">
                    {pet.description || "This pet is waiting to meet a caring family."}
                  </p>

                  <div className="mt-auto">
                    <p className="pet-health-note mb-3">
                      <Activity size={15} /> {pet.healthStatus || "Health details available on profile"}
                    </p>
                    <Link to={`/pets/${pet._id}`} className="btn paw-primary w-100">
                      Meet {pet.name}
                    </Link>
                  </div>
                </div>
              </article>
            </div>
          ))}
      </div>
    </main>
  );
}
