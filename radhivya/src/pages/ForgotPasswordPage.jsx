import { useState } from "react";
import { Link } from "react-router-dom";
import "./CustomerSignupPage.css";

const API_URL = "http://localhost:5000";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  async function sendResetLink(e) {
    e.preventDefault();

    if (!email.trim()) {
      setMessage({
        type: "error",
        text: "Please enter your registered email.",
      });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      const response = await fetch(`${API_URL}/api/customer-auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || data.error || "Failed to send reset link.");
      }

      setMessage({
        type: "success",
        text: "Password reset link sent to your email.",
      });
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

          <span>Password Recovery</span>

          <h1>Recover your account</h1>

          <p>
            Enter your registered customer email. If the account exists, we will
            send a password reset link.
          </p>
        </div>

        <div className="signup-form-panel">
          <form className="signup-form" onSubmit={sendResetLink}>
            <span className="signup-step">Forgot Password</span>

            <h2>Reset Password</h2>

            <p>Only registered customer emails can receive a reset link.</p>

            <label>
              Registered Email *
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter registered email"
              />
            </label>

            {message.text && (
              <div className={`signup-message ${message.type}`}>
                {message.text}
              </div>
            )}

            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <p className="signup-bottom-text">
              Remember password? <Link to="/login">Login</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}