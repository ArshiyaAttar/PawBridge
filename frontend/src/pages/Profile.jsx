import { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { updateUser } = useAuth();

  const [form, setForm] = useState({
    name: "",
    phone: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await API.get("/users/profile");

        setForm({
          name: data.user.name || "",
          phone: data.user.phone || "",
        });

        updateUser(data.user);
      } catch {
        setMessage("Unable to load profile.");
      }
    };

    loadProfile();
  }, [updateUser]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await API.put("/users/profile", form);

      // Fetch the latest saved profile from the backend.
      const { data } = await API.get("/users/profile");

      updateUser(data.user);

      setForm({
        name: data.user.name || "",
        phone: data.user.phone || "",
      });

      setMessage("Profile updated successfully.");
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Unable to update profile."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container paw-section">
      <div className="auth-card">
        <h2>My profile</h2>

        {message && (
          <div className="alert alert-info">{message}</div>
        )}

        <form onSubmit={submit}>
          <label className="form-label">Name</label>

          <input
            type="text"
            className="form-control mb-3"
            value={form.name}
            required
            minLength={2}
            maxLength={60}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <label className="form-label">Phone</label>

          <input
            type="tel"
            className="form-control mb-3"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
          />

          <button
            type="submit"
            className="btn paw-primary"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </main>
  );
}
