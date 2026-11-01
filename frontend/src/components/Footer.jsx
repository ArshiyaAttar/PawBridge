import { Link } from "react-router-dom";
import { ArrowRight, Heart, PawPrint } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Footer() {
  const { user } = useAuth();

  return (
    <footer className="paw-footer">
      <div className="container">
        <div className="paw-footer-main">
          <div className="paw-footer-brand">
            <Link to="/" className="paw-footer-logo">
              <span className="paw-footer-mark"><PawPrint size={21} /></span>
              PawBridge
            </Link>
            <p>
              Bringing adopters, shelters, and rescuers together to help every
              animal find safety, care, and a loving home.
            </p>
            <Link to="/pets" className="paw-footer-cta">
              Meet the pets <ArrowRight size={16} />
            </Link>
          </div>

          <div className="paw-footer-column">
            <h2>Explore</h2>
            <Link to="/pets">Pets for adoption</Link>
            <Link to="/rescue">Report an animal</Link>
            <Link to="/about">About PawBridge</Link>
          </div>

          <div className="paw-footer-column">
            <h2>Your account</h2>
            {user ? (
              <>
                <Link to="/dashboard">Dashboard</Link>
                {user.role === "adopter" && (
                  <Link to="/my-applications">Adoption applications</Link>
                )}
                {(user.role === "adopter" || user.role === "rescuer") && (
                  <Link to="/my-rescues">Rescue reports</Link>
                )}
                <Link to="/profile">Profile settings</Link>
              </>
            ) : (
              <>
                <Link to="/login">Sign in</Link>
                <Link to="/register">Create an account</Link>
              </>
            )}
          </div>
        </div>

        <div className="paw-footer-bottom">
          <span>
            Copyright {new Date().getFullYear()} PawBridge. Made with{" "}
            <Heart size={14} fill="currentColor" aria-label="love" /> for animals.
          </span>
          <Link to="/about">Learn about our mission</Link>
        </div>
      </div>
    </footer>
  );
}
