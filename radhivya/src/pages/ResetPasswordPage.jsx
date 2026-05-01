import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./CustomerSignupPage.css";

const API_URL = "http://localhost:5000";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    password: "",
    confirm_password: "",
  });

  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function resetPassword(e) {
    e.preventDefault();

    if (!form.password) {
      setMessage({
        type: "error",
        text: "New password is required.",
      });
      return;
    }

    if (form.password.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters.",
      });
      return;
    }

    if (form.password !== form.confirm_password) {
      setMessage({
        type: "error",
        text: "Passwords do not match.",
      });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      const response = await fetch(`${API_URL}/api/customer-auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || data.error || "Password reset failed.");
      }

      setMessage({
        type: "success",
        text: "Password reset successfully. Redirecting to login...",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1100);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="customer-signup-page">
      <section className="signup-shell">
        <div className="signup-brand-panel">
          <img
            src="/logo-transparent.png"
            alt="Radhivya"
            onError={(e) => {
              e.currentTarget.src = "/logo.png";
            }}
          />

          <span>New Password</span>

          <h1>Create a new password</h1>

          <p>
            Set a new password for your Radhivya customer account and login
            again.
          </p>
        </div>

        <div className="signup-form-panel">
          <form className="signup-form" onSubmit={resetPassword}>
            <span className="signup-step">Reset Password</span>

            <h2>New Password</h2>

            <label>
              New Password *
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter new password"
              />
            </label>

            <label>
              Confirm New Password *
              <input
                name="confirm_password"
                type="password"
                value={form.confirm_password}
                onChange={handleChange}
                placeholder="Confirm new password"
              />
            </label>

            {message.text && (
              <div className={`signup-message ${message.type}`}>
                {message.text}
              </div>
            )}

            <button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </button>

            <p className="signup-bottom-text">
              Back to <Link to="/login">Login</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}