import { Link } from "react-router-dom";
import { PawPrint, Heart, ShieldCheck, Search, ArrowRight } from "lucide-react";

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
