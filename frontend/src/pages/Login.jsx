import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form,setForm] = useState({email:"",password:""});
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return <div className="auth-section"><div className="auth-card">
    <h2>Welcome back!</h2><p className="paw-muted">Sign in to continue your PawBridge journey.</p>
    {error && <div className="alert alert-danger">{error}</div>}
    <form onSubmit={submit}>
      <label className="form-label">Email address</label>
      <input className="form-control mb-3" type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
      <label className="form-label">Password</label>
      <input className="form-control mb-4" type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
      <button className="btn paw-primary w-100" disabled={loading}>{loading?"Signing in...":"Login"}</button>
    </form>
    <p className="mt-4 text-center">New to PawBridge? <Link to="/register">Create an account</Link></p>
  </div></div>;
}
