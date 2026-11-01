
import { useCallback, useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Users,
  ShieldCheck,
  UserCheck,
  UserX,
} from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const roles = ["adopter", "shelter", "rescuer", "admin"];

export default function AdminUsers() {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const currentUserId = user?._id || user?.id;

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await API.get("/admin/users", {
        params: { search: appliedSearch },
      });

      setUsers(data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }, [appliedSearch]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const changeRole = async (id, role) => {
    const targetUser = users.find((item) => item._id === id);
    if (!targetUser || targetUser.role === role) return;

    if (
      !window.confirm(
        `Change ${targetUser.name}'s role to ${role}?`
      )
    ) {
      return;
    }

    try {
      setUpdatingId(id);
      setMessage("");
      setError("");

      await API.patch(`/admin/users/${id}/role`, { role });

      setMessage(`${targetUser.name}'s role was updated to ${role}.`);
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Role update failed.");
    } finally {
      setUpdatingId(null);
    }
  };

  const changeStatus = async (targetUser) => {
    const nextStatus = !targetUser.isActive;

    if (
      !window.confirm(
        `${nextStatus ? "Activate" : "Deactivate"} ${targetUser.name}'s account?`
      )
    ) {
      return;
    }

    try {
      setUpdatingId(targetUser._id);
      setMessage("");
      setError("");

      await API.patch(`/admin/users/${targetUser._id}/status`, {
        isActive: nextStatus,
      });

      setMessage(
        `${targetUser.name}'s account is now ${
          nextStatus ? "active" : "inactive"
        }.`
      );

      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Status update failed.");
    } finally {
      setUpdatingId(null);
    }
  };

  const submitSearch = (e) => {
    e.preventDefault();
    setAppliedSearch(search.trim());
  };

  const activeCount = users.filter((item) => item.isActive).length;
  const inactiveCount = users.length - activeCount;

  return (
    <main className="container paw-section">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <span className="eyebrow">ADMINISTRATION</span>
          <h1 className="section-title mt-2">
            Manage <span>users</span>
          </h1>
          <p className="paw-muted mb-0">
            Search accounts and manage platform roles and access.
          </p>
        </div>

        <button
          className="btn btn-outline-success"
          onClick={loadUsers}
          disabled={loading}
        >
          <RefreshCw size={16} className="me-2" />
          Refresh
        </button>
      </div>

      {message && (
        <div className="alert alert-success alert-dismissible">
          {message}
          <button
            className="btn-close"
            onClick={() => setMessage("")}
            type="button"
          />
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-dismissible">
          {error}
          <button
            className="btn-close"
            onClick={() => setError("")}
            type="button"
          />
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-4">
          <div className="feature-card h-100">
            <Users size={25} className="text-success mb-2" />
            <h3>{users.length}</h3>
            <p className="paw-muted mb-0">Users found</p>
          </div>
        </div>

        <div className="col-6 col-lg-4">
          <div className="feature-card h-100">
            <UserCheck size={25} className="text-success mb-2" />
            <h3>{activeCount}</h3>
            <p className="paw-muted mb-0">Active accounts</p>
          </div>
        </div>

        <div className="col-6 col-lg-4">
          <div className="feature-card h-100">
            <UserX size={25} className="text-danger mb-2" />
            <h3>{inactiveCount}</h3>
            <p className="paw-muted mb-0">Inactive accounts</p>
          </div>
        </div>
      </div>

      <div className="feature-card mb-4">
        <form onSubmit={submitSearch}>
          <label className="form-label fw-semibold">Search users</label>
          <div className="input-group">
            <span className="input-group-text bg-white">
              <Search size={17} />
            </span>
            <input
              className="form-control"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-success" type="submit">
              Search
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" />
          <p className="paw-muted mt-3">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="feature-card text-center py-5">
          <Users size={40} className="text-success mb-3" />
          <h4>No users found</h4>
          <p className="paw-muted mb-0">
            Try another search term.
          </p>
        </div>
      ) : (
        <div className="feature-card">
          <div className="d-flex align-items-center gap-2 mb-3">
            <ShieldCheck size={21} className="text-success" />
            <h5 className="mb-0">User accounts</h5>
          </div>

          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((item) => {
                  const isSelf =
                    currentUserId &&
                    String(currentUserId) === String(item._id);

                  return (
                    <tr key={item._id}>
                      <td>
                        <strong>{item.name}</strong>
                        {isSelf && (
                          <div>
                            <span className="badge text-bg-secondary">
                              Your account
                            </span>
                          </div>
                        )}
                      </td>

                      <td>{item.email}</td>

                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={item.role}
                          disabled={isSelf || updatingId !== null}
                          onChange={(e) =>
                            changeRole(item._id, e.target.value)
                          }
                        >
                          {roles.map((role) => (
                            <option key={role} value={role}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            item.isActive
                              ? "text-bg-success"
                              : "text-bg-secondary"
                          }`}
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <button
                          className={`btn btn-sm ${
                            item.isActive
                              ? "btn-outline-danger"
                              : "btn-outline-success"
                          }`}
                          disabled={isSelf || updatingId !== null}
                          onClick={() => changeStatus(item)}
                        >
                          {updatingId === item._id
                            ? "Updating..."
                            : item.isActive
                            ? "Deactivate"
                            : "Activate"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="small paw-muted mb-0">
            Your own admin role and account status cannot be changed from this screen.
          </p>
        </div>
      )}
    </main>
  );
}
