import { Link } from "react-router-dom";
import { PawPrint, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="paw-footer mt-5">
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-md-5">
            <h4><PawPrint/> PawBridge</h4>
            <p className="mt-3">Connecting loving homes with pets who need a second chance.</p>
          </div>
          <div className="col-md-3">
            <h6>Explore</h6>
            <Link to="/pets">Find a pet</Link><br/>
            <Link to="/rescue">Report an animal</Link><br/>
            <Link to="/about">About us</Link>
          </div>
          <div className="col-md-4">
            <h6>Our mission</h6>
            <p>Adopt, don't shop. Every animal deserves care and kindness.</p>
          </div>
        </div>
        <hr/>
        <p className="mb-0 text-center small">Made with <Heart size={14} fill="currentColor"/> for animals · © {new Date().getFullYear()} PawBridge</p>
      </div>
    </footer>
  );
}
