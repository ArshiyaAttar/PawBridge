import { Link, NavLink } from "react-router-dom";
import { PawPrint, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg paw-navbar sticky-top">
      <div className="container py-2">
        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/">
          <span className="brand-icon"><PawPrint size={24}/></span>
          PawBridge
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#pawNav"
          aria-controls="pawNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="pawNav">
          <div className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
            <NavLink className="nav-link" to="/">Home</NavLink>
            <NavLink className="nav-link" to="/pets">Adopt a Pet</NavLink>
            <NavLink className="nav-link" to="/rescue">Report Rescue</NavLink>
            <NavLink className="nav-link" to="/about">About</NavLink>
            {user ? (
              <>
                <NavLink className="nav-link" to="/dashboard">Dashboard</NavLink>
                <button className="btn btn-outline-success btn-sm" onClick={logout}>
                  <LogOut size={15}/> Logout
                </button>
              </>
            ) : (
              <>
                <Link className="nav-link" to="/login">Login</Link>
                <Link className="btn paw-primary btn-sm" to="/register">Join PawBridge</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
