import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Heart,
  LockKeyhole,
  Mail,
  PawPrint,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to log in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-layout">
        <section className="auth-welcome-panel">
          <div className="auth-welcome-brand">
            <span className="auth-welcome-icon"><PawPrint size={22} /></span>
            PawBridge
          </div>
          <div>
            <span className="auth-welcome-kicker">WELCOME BACK</span>
            <h1>Your next chapter starts with a little kindness.</h1>
            <p>
              Sign in to continue your adoption journey, connect with shelters,
              and keep up with the animals you care about.
            </p>
          </div>
          <div className="auth-welcome-note">
            <Heart size={19} />
            <span>Every connection can change a life.</span>
          </div>
        </section>

        <section className="auth-card auth-form-card">
          <div className="auth-form-heading">
            <span className="eyebrow">YOUR PAWBRIDGE ACCOUNT</span>
            <h2>Sign in</h2>
            <p className="paw-muted mb-0">
              Welcome back. Enter your details below.
            </p>
          </div>

          {error && (
            <div className="alert alert-danger mt-4 mb-0" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="auth-form">
            <div className="mb-3">
              <label className="form-label" htmlFor="login-email">
                Email address
              </label>
              <div className="auth-input-wrap">
                <Mail size={18} aria-hidden="true" />
                <input
                  id="login-email"
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

            <div className="mb-2">
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
              <div className="auth-input-wrap">
                <LockKeyhole size={18} aria-hidden="true" />
                <input
                  id="login-password"
                  className="form-control"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
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
                  Signing in...
                </>
              ) : (
                <>
                  Sign in <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <p className="auth-switch mb-0">
            New to PawBridge? <Link to="/register">Create an account</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
