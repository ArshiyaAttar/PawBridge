import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  HeartHandshake,
  LogOut,
  Menu,
  PawPrint,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const linkClass = ({ isActive }) =>
  `paw-nav-link${isActive ? " active" : ""}`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  return (
    <header className="paw-header">
      <nav className="navbar navbar-expand-xl paw-navbar">
        <div className="container">
          <Link className="navbar-brand paw-brand" to="/" aria-label="PawBridge home">
            <span className="brand-icon"><PawPrint size={22} /></span>
            <span>PawBridge</span>
          </Link>

          <button
            className="navbar-toggler paw-nav-toggle"
            type="button"
            aria-controls="pawNav"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div
            className={`collapse navbar-collapse${menuOpen ? " show" : ""}`}
            id="pawNav"
          >
            <div className="navbar-nav ms-auto align-items-lg-center gap-lg-1">
              <NavLink to="/" end className={linkClass}>
                Home
              </NavLink>
              <NavLink to="/pets" className={linkClass}>
                Adopt a pet
              </NavLink>
              <NavLink to="/rescue" className={linkClass}>
                Report rescue
              </NavLink>
              <NavLink to="/about" className={linkClass}>
                About
              </NavLink>

              {user && (
                <>
                  <NavLink to="/dashboard" className={linkClass}>
                    Dashboard
                  </NavLink>
                  {user.role === "adopter" && (
                    <NavLink to="/my-applications" className={linkClass}>
                      Applications
                    </NavLink>
                  )}
                  {(user.role === "adopter" || user.role === "rescuer") && (
                    <NavLink to="/my-rescues" className={linkClass}>
                      Rescue reports
                    </NavLink>
                  )}
                  {(user.role === "shelter" || user.role === "admin") && (
                    <NavLink to="/shelter/applications" className={linkClass}>
                      Applications
                    </NavLink>
                  )}
                </>
              )}
            </div>

            <div className="paw-nav-actions">
              {user ? (
                <button
                  className="btn btn-outline-success paw-logout-btn"
                  type="button"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Log out</span>
                </button>
              ) : (
                <>
                  <Link
                    className="paw-login-link"
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    className="btn paw-primary paw-join-btn"
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                  >
                    <HeartHandshake size={16} />
                    <span>Join PawBridge</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
