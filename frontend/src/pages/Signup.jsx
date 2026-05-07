import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { authApi } from "../services/api.js";

export default function Signup() {
  const { token, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "MEMBER" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authApi.signup(form);
      login(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-screen">
      <form className="auth-panel" onSubmit={handleSubmit}>
        <h1>Create account</h1>
        <p>Choose Admin if you will create projects and manage a team.</p>
        {error && <div className="alert">{error}</div>}
        <label>
          Name
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            minLength={6}
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
        </label>
        <label>
          Role
          <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </select>
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Sign up"}
        </button>
        <span>
          Already have an account? <Link to="/login">Log in</Link>
        </span>
      </form>
    </main>
  );
}
