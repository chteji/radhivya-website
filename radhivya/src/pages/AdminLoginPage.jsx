import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AuthPages.css";

const API_URL = "http://localhost:5000";

export default function AdminLoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleAdminLogin(e) {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please enter admin email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/admin-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Admin login failed.");
      }

      localStorage.setItem("userRole", "admin");
      localStorage.setItem("userName", data.admin.full_name);
      localStorage.setItem("adminId", data.admin.id);
      localStorage.setItem("adminEmail", data.admin.email);

      navigate("/admin");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="auth-brand-panel">
          <div className="auth-brand-content">
            <img src="/logo-transparent-1.png" alt="Radhivya Logo" className="auth-logo" />

            <h1>Admin Control Center</h1>

            <p>
              Secure admin access for products, orders, customers, staff,
              coupons, payments, analytics, and website settings.
            </p>

            <div className="auth-points">
              <span>✓ Manage products and images</span>
              <span>✓ Control orders and payments</span>
              <span>✓ Create and disable staff accounts</span>
              <span>✓ Manage coupons and marketing settings</span>
            </div>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-badge">Admin Panel</div>

          <h2>Admin Login</h2>

          <p className="auth-subtitle">
            Login using a real admin account from the database.
          </p>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleAdminLogin}>
            <label>
              Email Address
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@radhivya.com"
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter admin password"
              />
            </label>

            <button type="submit" className="auth-main-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login as Admin"}
            </button>
          </form>

          <div className="auth-bottom-links">
            <span>Customer?</span> <Link to="/login">Customer Login</Link>
            <span> | Staff?</span> <Link to="/staff-login">Staff Login</Link>
          </div>
        </div>
      </section>
    </main>
  );
}