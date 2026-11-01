import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Heart,
  LockKeyhole,
  Mail,
  PawPrint,
  Phone,
  UserRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-layout">
        <section className="auth-welcome-panel auth-welcome-register">
          <div className="auth-welcome-brand">
            <span className="auth-welcome-icon"><PawPrint size={22} /></span>
            PawBridge
          </div>
          <div>
            <span className="auth-welcome-kicker">MAKE A DIFFERENCE</span>
            <h1>A caring home can change everything.</h1>
            <p>
              Join a community bringing adopters, shelters, and rescuers
              together for animals who need a fresh start.
            </p>
          </div>
          <div className="auth-welcome-note">
            <Heart size={19} />
            <span>One account. More ways to help.</span>
          </div>
        </section>

        <section className="auth-card auth-form-card">
          <div className="auth-form-heading">
            <span className="eyebrow">JOIN THE PAWBRIDGE COMMUNITY</span>
            <h2>Create your account</h2>
            <p className="paw-muted mb-0">
              Tell us a little about yourself to get started.
            </p>
          </div>

          {error && (
            <div className="alert alert-danger mt-4 mb-0" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="auth-form">
            <div className="mb-3">
              <label className="form-label" htmlFor="register-name">
                Full name
              </label>
              <div className="auth-input-wrap">
                <UserRound size={18} aria-hidden="true" />
                <input
                  id="register-name"
                  className="form-control"
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  minLength={2}
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="register-email">
                Email address
              </label>
              <div className="auth-input-wrap">
                <Mail size={18} aria-hidden="true" />
                <input
                  id="register-email"
                  className="form-control"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="register-phone">
                Phone <span className="auth-optional">(optional)</span>
              </label>
              <div className="auth-input-wrap">
                <Phone size={18} aria-hidden="true" />
                <input
                  id="register-phone"
                  className="form-control"
                  type="tel"
                  autoComplete="tel"
                  placeholder="Your phone number"
                  value={form.phone}
                  onChange={(event) =>
                    setForm({ ...form, phone: event.target.value })
                  }
                />
              </div>
            </div>

            <div className="mb-2">
              <label className="form-label" htmlFor="register-password">
                Password
              </label>
              <div className="auth-input-wrap">
                <LockKeyhole size={18} aria-hidden="true" />
                <input
                  id="register-password"
                  className="form-control"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                  value={form.password}
                  onChange={(event) =>
                    setForm({ ...form, password: event.target.value })
                  }
                />
                <button
                  className="auth-password-toggle"
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              className="btn paw-primary auth-submit-btn w-100 mt-3"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <p className="auth-switch mb-0">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
