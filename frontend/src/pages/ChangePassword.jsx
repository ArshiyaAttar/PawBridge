
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import API from "../services/api";

export default function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleVisibility = (field) => {
    setShowPasswords((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (form.newPassword.length < 8) {
      setError("Your new password must contain at least 8 characters.");
      return;
    }

    if (form.newPassword === form.currentPassword) {
      setError("Your new password must be different from your current password.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const { data } = await API.patch("/users/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      setMessage(data.message || "Your password has been changed successfully.");

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to change password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const passwordField = (label, name, field, placeholder) => (
    <div className="mb-3">
      <label className="form-label fw-semibold">{label}</label>
      <div className="input-group">
        <input
          className="form-control"
          type={showPasswords[field] ? "text" : "password"}
          name={name}
          placeholder={placeholder}
          value={form[name]}
          onChange={updateField}
          autoComplete="new-password"
          required
          minLength={name === "currentPassword" ? undefined : 8}
        />
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => toggleVisibility(field)}
          aria-label={showPasswords[field] ? "Hide password" : "Show password"}
        >
          {showPasswords[field] ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );

  return (
    <main className="container paw-section">
      <div className="mb-4">
        <Link to="/profile" className="btn btn-outline-secondary btn-sm">
          <ArrowLeft size={16} className="me-2" />
          Back to Profile
        </Link>
      </div>

      <div className="auth-card mx-auto p-4 p-md-5" style={{ maxWidth: 540 }}>
        <div className="text-center mb-4">
          <div
            className="rounded-circle bg-success-subtle d-inline-flex align-items-center justify-content-center mb-3"
            style={{ width: 72, height: 72 }}
          >
            <LockKeyhole size={34} className="text-success" />
          </div>

          <span className="eyebrow">ACCOUNT SECURITY</span>
          <h2 className="section-title mt-2">
            Change <span>password</span>
          </h2>
          <p className="paw-muted">
            Protect your PawBridge account with a strong password.
          </p>
        </div>

        {message && (
          <div className="alert alert-success">
            <CheckCircle size={18} className="me-2" />
            {message}
          </div>
        )}

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={submit}>
          {passwordField(
            "Current password",
            "currentPassword",
            "current",
            "Enter current password"
          )}

          {passwordField(
            "New password",
            "newPassword",
            "new",
            "Enter new password"
          )}

          {passwordField(
            "Confirm new password",
            "confirmPassword",
            "confirm",
            "Re-enter new password"
          )}

          <div className="alert alert-light border small">
            <ShieldCheck size={17} className="text-success me-2" />
            Use at least 8 characters. Avoid reusing your current password.
          </div>

          <button
            type="submit"
            className="btn paw-primary w-100 py-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Updating password...
              </>
            ) : (
              <>
                <LockKeyhole size={17} className="me-2" />
                Update Password
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
