import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PawPrint,
  Heart,
  ShieldCheck,
  Search,
  ArrowRight,
  MapPin,
  CheckCircle2,
  ClipboardList,
  FileText,
} from "lucide-react";
import API from "../services/api";

const fallbackImages = {
  Dog: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=700",
  Cat: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=700",
  Bird: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=700",
};

const samplePets = [
  {
    name: "Moti",
    species: "Dog",
    breed: "Indie mix",
    age: 3,
    gender: "Male",
    location: "Solapur, Maharashtra",
    temperament: "Friendly and people-oriented",
    care: "Enjoys calm walks and regular play",
    image: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=700",
  },
  {
    name: "Gauri",
    species: "Cat",
    breed: "Domestic shorthair",
    age: 1,
    gender: "Female",
    location: "Akkalkot, Maharashtra",
    temperament: "Curious and gentle",
    care: "Would enjoy a quiet indoor space",
    image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=700",
  },
  {
    name: "Bittu",
    species: "Dog",
    breed: "Indie mix",
    age: 1,
    gender: "Male",
    location: "Barshi, Maharashtra",
    temperament: "Affectionate and playful",
    care: "Still learning routines; responds well to patience",
    image: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=700",
  },
  {
    name: "Chiku",
    species: "Cat",
    breed: "Tabby mix",
    age: 2,
    gender: "Female",
    location: "Pandharpur, Maharashtra",
    temperament: "Relaxed and people-friendly",
    care: "A calm indoor environment suits her best",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=700",
  },
  {
    name: "Luna",
    species: "Dog",
    breed: "Indie mix",
    age: 2,
    gender: "Female",
    location: "Pune, Maharashtra",
    temperament: "Gentle and affectionate",
    care: "Loves walks and quiet time with people",
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=700",
  },
  {
    name: "Milo",
    species: "Cat",
    breed: "Domestic shorthair",
    age: 1,
    gender: "Male",
    location: "Mumbai, Maharashtra",
    temperament: "Curious and sociable",
    care: "Likes toys, sunny windows, and a steady routine",
    image: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=700",
  },
  {
    name: "Coco",
    species: "Dog",
    breed: "Beagle",
    age: 4,
    gender: "Female",
    location: "Nashik, Maharashtra",
    temperament: "Energetic and cheerful",
    care: "Enjoys games and daily activity",
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=700",
  },
  {
    name: "Rio",
    species: "Bird",
    breed: "Indian ringneck",
    age: 3,
    gender: "Male",
    location: "Kolhapur, Maharashtra",
    temperament: "Bright and attentive",
    care: "Needs daily enrichment and a spacious, safe habitat",
    image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=700",
  },
];

const getAgeLabel = (age) => {
  if (age === 0) return "Under 1 year";
  return `${age} ${age === 1 ? "year" : "years"} old`;
};

export default function Home() {
  const [pets, setPets] = useState([]);
  const [loadingPets, setLoadingPets] = useState(true);
  const [petsError, setPetsError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;

    const loadPets = async () => {
      try {
        setLoadingPets(true);
        setPetsError("");
        const { data } = await API.get("/pets", {
          params: { status: "Available" },
        });

        if (active) setPets((data.pets || []).slice(0, 3));
      } catch (error) {
        if (active) {
          setPetsError(
            error.response?.data?.message ||
              "Unable to load available pets. Please try again."
          );
        }
      } finally {
        if (active) setLoadingPets(false);
      }
    };

    loadPets();
    return () => {
      active = false;
    };
  }, [retryKey]);

  return (
    <>
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-6">
              <span className="eyebrow"><PawPrint size={16}/> A bridge to a better life</span>
              <h1>Every pet deserves a <span>loving home.</span></h1>
              <p className="hero-copy">Discover pets waiting for a family, support animal rescue efforts, and make a difference with PawBridge.</p>
              <div className="d-flex gap-3 flex-wrap mt-4">
                <Link to="/pets" className="btn paw-primary btn-lg">
                  Find your companion <ArrowRight size={18} />
                </Link>
                <Link to="/rescue" className="btn btn-outline-success btn-lg">
                  Report an animal
                </Link>
              </div>
              <div className="hero-note mt-4"><Heart size={17}/> Adopt with love. Rescue with care.</div>
            </div>
            <div className="col-lg-6">
              <div className="hero-image-wrap">
                <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=1000" alt="Happy dog looking for a loving home"/>
                <div className="image-caption"><PawPrint/> A new beginning starts here.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-pets-section">
        <div className="container py-5">
          <div className="d-flex justify-content-between align-items-end gap-3 flex-wrap mb-4">
            <div>
              <span className="eyebrow">AVAILABLE FOR ADOPTION</span>
              <h2 className="section-title mb-2">
                Meet a few <span>lovely pets.</span>
              </h2>
              <p className="paw-muted mb-0">
                Get to know pets currently looking for a loving home.
              </p>
            </div>
            <Link to="/pets" className="btn paw-primary">
              Browse available pets <ArrowRight size={16} />
            </Link>
          </div>

          {loadingPets && (
            <div className="pet-state text-center py-5" role="status">
              <div className="spinner-border text-success" />
              <p className="mt-3 mb-0">Finding pets looking for a home...</p>
            </div>
          )}

          {!loadingPets && petsError && (
            <div
              className="alert alert-danger d-flex justify-content-between align-items-center gap-3"
              role="alert"
            >
              <span>{petsError}</span>
              <button
                className="btn paw-primary flex-shrink-0"
                onClick={() => setRetryKey((current) => current + 1)}
              >
                Try again
              </button>
            </div>
          )}

          {!loadingPets && !petsError && pets.length === 0 && (
            <div className="pet-state text-center py-5">
              <PawPrint size={42} className="mb-3 text-success" aria-hidden="true" />
              <h3 className="h5">No pets are listed just yet</h3>
              <p className="paw-muted mb-3">
                Check all available pets or visit again soon.
              </p>
              <Link to="/pets" className="btn paw-primary">
                Browse pets <ArrowRight size={16} />
              </Link>
            </div>
          )}

          {!loadingPets && !petsError && pets.length > 0 && (
            <div className="row g-4">
              {pets.map((pet) => (
                <div className="col-sm-6 col-lg-4" key={pet._id}>
                  <Link
                    to={`/pets/${pet._id}`}
                    className="home-pet-link"
                    aria-label={`Meet ${pet.name}, ${pet.species}, ${pet.breed || "mixed breed"}, in ${pet.location}`}
                  >
                    <article className="pet-card h-100">
                      <div className="pet-card-image-wrap">
                        <img
                          src={pet.image || fallbackImages[pet.species] || fallbackImages.Dog}
                          alt={`${pet.name}, ${pet.species}`}
                          className="pet-card-image"
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src =
                              fallbackImages[pet.species] || fallbackImages.Dog;
                          }}
                        />
                        <span className="pet-status-badge">{pet.status}</span>
                      </div>
                      <div className="p-4">
                        <div className="d-flex justify-content-between align-items-start gap-2">
                          <div>
                            <h3 className="h4 fw-bold mb-1">{pet.name}</h3>
                            <p className="paw-muted mb-3">
                              {pet.breed || "Mixed breed"} · {getAgeLabel(pet.age)}
                            </p>
                          </div>
                          <span className="species-tag">{pet.species}</span>
                        </div>
                        <div className="pet-fact-list mb-3">
                          <span><MapPin size={15} /> {pet.location}</span>
                          <span>
                            <CheckCircle2 size={15} />
                            {pet.vaccinated ? "Vaccinated" : "Vaccination unconfirmed"}
                          </span>
                        </div>
                        <p className="pet-description mb-3">
                          {pet.description || "This pet is waiting to meet a caring family."}
                        </p>
                        <span className="home-pet-cta">
                          Meet {pet.name} <ArrowRight size={16} />
                        </span>
                      </div>
                    </article>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="sample-pets-section">
        <div className="container paw-section">
          <div className="text-center mb-4">
            <span className="eyebrow">PAWBRIDGE SHOWCASE</span>
            <h2 className="section-title mb-2">
              Get to know our <span>sample profiles.</span>
            </h2>
            <p className="paw-muted mx-auto section-description">
              Explore example pet profiles and the kind of care details a
              thoughtful adoption listing can include.
            </p>
          </div>

          <div className="alert alert-warning sample-pets-notice" role="note">
            These are fictional showcase examples, not real pets or active
            adoption listings. You cannot apply to adopt these sample profiles.
          </div>

          <div className="row g-4">
            {samplePets.map((pet) => (
              <div className="col-sm-6 col-lg-3" key={pet.name}>
                <article className="pet-card sample-pet-card h-100">
                  <div className="pet-card-image-wrap">
                    <img
                      src={pet.image || fallbackImages[pet.species]}
                      alt={`Illustrative ${pet.species.toLowerCase()} profile for ${pet.name}`}
                      className="pet-card-image"
                      loading="lazy"
                    />
                    <span className="pet-status-badge sample-pet-badge">
                      Sample profile
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <div>
                        <h3 className="h4 fw-bold mb-1">{pet.name}</h3>
                        <p className="paw-muted mb-3">
                          {pet.breed} · {getAgeLabel(pet.age)}
                        </p>
                      </div>
                      <span className="species-tag">{pet.species}</span>
                    </div>
                    <div className="pet-fact-list mb-3">
                      <span><MapPin size={15} /> {pet.location}</span>
                      <span><Heart size={15} /> {pet.gender}</span>
                    </div>
                    <p className="pet-description mb-2">
                      <strong>Personality:</strong> {pet.temperament}
                    </p>
                    <p className="pet-description mb-0">
                      <strong>Care:</strong> {pet.care}
                    </p>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container paw-section">
        <div className="text-center">
          <span className="eyebrow">SUPPORT AT EVERY STEP</span>
          <h2 className="section-title">
            From first hello to <span>forever home.</span>
          </h2>
          <p className="paw-muted mx-auto section-description">
            Find a companion, follow your application, or help an animal in
            need. PawBridge keeps each step connected.
          </p>
        </div>
        <div className="row g-4 mt-3">
          {[
            {
              icon: <Search />,
              title: "Find a companion",
              text: "Explore available pets and open a profile to learn more.",
              action: "Browse pets",
              link: "/pets",
            },
            {
              icon: <ClipboardList />,
              title: "Follow your application",
              text: "Check application status, shelter feedback, and full details.",
              action: "View applications",
              link: "/my-applications",
            },
            {
              icon: <ShieldCheck />,
              title: "Report an animal in need",
              text: "Share the animal's condition and location with the rescue team.",
              action: "Make a report",
              link: "/rescue",
            },
            {
              icon: <FileText />,
              title: "Track rescue reports",
              text: "Return to your submitted reports and follow their progress.",
              action: "View reports",
              link: "/my-rescues",
            },
          ].map((item) => (
            <div className="col-sm-6 col-xl-3" key={item.title}>
              <Link to={item.link} className="feature-card">
                <div className="feature-icon">{item.icon}</div>
                <h3 className="h5">{item.title}</h3>
                <p>{item.text}</p>
                <span>
                  {item.action} <ArrowRight size={15} />
                </span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mission-section">
        <div className="container text-center py-5">
          <PawPrint size={36}/>
          <h2>Be the reason a tail wags again.</h2>
          <p>Whether you adopt, foster or report an animal in need, your action matters.</p>
          <Link to="/register" className="btn btn-light btn-lg mt-3">Become a part of PawBridge</Link>
        </div>
      </section>
    </>
  );
}
