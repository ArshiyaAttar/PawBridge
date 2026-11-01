import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form,setForm] = useState({name:"",email:"",phone:"",password:""});
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return <div className="auth-section"><div className="auth-card">
    <h2>Join our family ??</h2><p className="paw-muted">Create an account and make a difference.</p>
    {error && <div className="alert alert-danger">{error}</div>}
    <form onSubmit={submit}>
      <label className="form-label">Full name</label>
      <input className="form-control mb-3" required minLength="2" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
      <label className="form-label">Email address</label>
      <input className="form-control mb-3" type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
      <label className="form-label">Phone</label>
      <input className="form-control mb-3" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
      <label className="form-label">Password</label>
      <input className="form-control mb-4" type="password" minLength="8" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
      <button className="btn paw-primary w-100" disabled={loading}>{loading?"Creating account...":"Create account"}</button>
    </form>
    <p className="mt-4 text-center">Already registered? <Link to="/login">Login</Link></p>
  </div></div>;
}
