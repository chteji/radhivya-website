import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AuthPages.css";

const API_URL = "http://localhost:5000";

export default function CustomerLoginPage() {
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

  async function handleCustomerLogin(e) {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please enter customer email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/customer-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Customer login failed.");
      }

      localStorage.setItem("userRole", "customer");
      localStorage.setItem("customerId", data.customer.id);
      localStorage.setItem("userName", data.customer.full_name);
      localStorage.setItem("customerEmail", data.customer.email);
      localStorage.setItem("customerPhone", data.customer.phone || "");

      navigate("/profile");
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
            <img
              src="/logo-transparent.png"
              alt="Radhivya Logo"
              className="auth-logo"
              onError={(e) => {
                e.currentTarget.src = "/logo.png";
              }}
            />

            <h1>Welcome to Radhivya</h1>

            <p>
              Login to access your wishlist, cart, checkout, profile,
              invoices, and skincare shopping experience.
            </p>

            <div className="auth-points">
              <span>✓ View your cart</span>
              <span>✓ Save wishlist items</span>
              <span>✓ Checkout securely</span>
              <span>✓ Track your orders</span>
            </div>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-badge">Customer Panel</div>

          <h2>Customer Login</h2>

          <p className="auth-subtitle">
            Login using your verified customer account.
          </p>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleCustomerLogin}>
            <label>
              Email Address
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="customer@example.com"
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
              />
            </label>

            <button type="submit" className="auth-main-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login as Customer"}
            </button>
          </form>

          <div className="auth-bottom-links">
            New customer? <Link to="/signup">Create Account</Link>
            <br />
            <span>Admin?</span> <Link to="/admin-login">Admin Login</Link>
            <span> | Staff?</span> <Link to="/staff-login">Staff Login</Link>
          </div>
        </div>
      </section>
    </main>
  );
}