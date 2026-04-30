import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AuthPages.css";

const API_URL = "http://localhost:5000";

export default function StaffLoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleStaffLogin(e) {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please enter staff email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/staff/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Staff login failed.");
      }

      localStorage.setItem("userRole", "staff");
      localStorage.setItem("staffId", data.staff.id);
      localStorage.setItem("staffName", data.staff.full_name);
      localStorage.setItem("staffEmail", data.staff.email);
      localStorage.setItem("staffDepartment", data.staff.department || "support");

      navigate("/staff");
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

            <h1>Staff Workspace</h1>

            <p>
              Staff access for support tickets, customer messages, marketing tasks,
              influencer tracking, customer data, and campaign planning.
            </p>

            <div className="auth-points">
              <span>✓ View and reply to customer support tickets</span>
              <span>✓ Update ticket status</span>
              <span>✓ Manage marketing tasks</span>
              <span>✓ Track influencers and social campaigns</span>
            </div>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-badge">Staff Panel</div>

          <h2>Staff Login</h2>

          <p className="auth-subtitle">
            Login using the staff account created by admin.
          </p>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleStaffLogin}>
            <label>
              Staff Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="support@radhivya.com"
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter staff password"
              />
            </label>

            <button type="submit" className="auth-main-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login as Staff"}
            </button>
          </form>

          <div className="auth-bottom-links">
            <span>Customer?</span> <Link to="/login">Customer Login</Link>
            <span> | Admin?</span> <Link to="/admin-login">Admin Login</Link>
          </div>
        </div>
      </section>
    </main>
  );
}