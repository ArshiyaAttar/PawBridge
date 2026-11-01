import { Link } from "react-router-dom";
import {
  PawPrint,
  Heart,
  ShieldCheck,
  Search,
  ArrowRight,
  MapPin,
} from "lucide-react";

const demoPets = [
  {
    name: "Luna",
    species: "Dog",
    breed: "Indie mix · 2 years old",
    location: "Pune",
    description:
      "A gentle, people-loving companion who enjoys walks and cuddles.",
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=700",
  },
  {
    name: "Milo",
    species: "Cat",
    breed: "Domestic shorthair · 1 year old",
    location: "Mumbai",
    description:
      "Curious and affectionate, Milo is happiest near a sunny window.",
    image: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=700",
  },
  {
    name: "Coco",
    species: "Dog",
    breed: "Beagle · 4 years old",
    location: "Bengaluru",
    description:
      "An energetic friend who loves gentle games and patient families.",
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=700",
  },
];

export default function Home() {
  return (
    <>
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="eyebrow"><PawPrint size={16}/> A bridge to a better life</span>
              <h1>Every pet deserves a <span>loving home.</span></h1>
              <p className="hero-copy">Discover pets waiting for a family, support animal rescue efforts, and make a difference with PawBridge.</p>
              <div className="d-flex gap-3 flex-wrap mt-4">
                <Link to="/pets" className="btn paw-primary btn-lg">Find your companion <ArrowRight size={18}/></Link>
                <Link to="/rescue" className="btn btn-outline-success btn-lg">Report an animal</Link>
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

      <section className="container py-5">
        <div className="d-flex justify-content-between align-items-end gap-3 flex-wrap mb-4">
          <div>
            <span className="eyebrow">SAMPLE ADOPTION LISTINGS</span>
            <h2 className="section-title mb-2">
              Meet a few <span>lovely pets.</span>
            </h2>
            <p className="paw-muted mb-0">
              Demo examples to show how adoptable pets appear on PawBridge.
            </p>
          </div>
          <Link to="/pets" className="btn btn-outline-success">
            Browse all pets <ArrowRight size={16} />
          </Link>
        </div>

        <div className="row g-4">
          {demoPets.map((pet) => (
            <div className="col-sm-6 col-lg-4" key={pet.name}>
              <article className="pet-card h-100">
                <div className="pet-card-image-wrap">
                  <img
                    src={pet.image}
                    alt={`${pet.name}, a demo ${pet.species.toLowerCase()} adoption listing`}
                    className="pet-card-image"
                    loading="lazy"
                  />
                  <span className="pet-status-badge">Demo example</span>
                </div>
                <div className="p-4">
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div>
                      <h3 className="h4 fw-bold mb-1">{pet.name}</h3>
                      <p className="paw-muted mb-3">{pet.breed}</p>
                    </div>
                    <span className="species-tag">{pet.species}</span>
                  </div>
                  <p className="pet-fact-list mb-3">
                    <MapPin size={15} /> {pet.location}
                  </p>
                  <p className="pet-description mb-0">{pet.description}</p>
                </div>
              </article>
            </div>
          ))}
        </div>
      </section>

      <section className="container paw-section text-center">
        <span className="eyebrow">WHAT WE DO</span>
        <h2 className="section-title">Small actions. <span>Big differences.</span></h2>
        <p className="paw-muted mx-auto section-description">One platform bringing adopters, shelters and rescuers together.</p>
        <div className="row g-4 mt-3">
          {[
            {icon:<Search/>,title:"Find a Friend",text:"Browse pets and discover your perfect companion.",link:"/pets"},
            {icon:<Heart/>,title:"Adopt with Love",text:"Apply to adopt and give an animal a forever home.",link:"/pets"},
            {icon:<ShieldCheck/>,title:"Support Rescue",text:"Report animals in need and help coordinate rescue.",link:"/rescue"}
          ].map((item)=><div className="col-md-4" key={item.title}>
            <Link to={item.link} className="feature-card">
              <div className="feature-icon">{item.icon}</div>
              <h5>{item.title}</h5><p>{item.text}</p>
              <span>Explore <ArrowRight size={15}/></span>
            </Link>
          </div>)}
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
