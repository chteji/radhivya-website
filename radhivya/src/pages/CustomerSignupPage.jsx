import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CustomerSignupPage.css";

const API_URL = "http://localhost:5000";

const initialForm = {
  full_name: "",
  age: "",
  dob: "",
  phone: "",
  email: "",
  password: "",
  confirm_password: "",
};

export default function CustomerSignupPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(0);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  function showMessage(type, text) {
    setMessage({ type, text });
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function validateForm() {
    if (!form.full_name.trim()) return "Full name is required.";
    if (!form.age.trim()) return "Age is required.";
    if (!form.dob.trim()) return "Date of birth is required.";
    if (!form.phone.trim()) return "Mobile number is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!form.password.trim()) return "Password is required.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (form.password !== form.confirm_password) return "Passwords do not match.";
    return "";
  }

  async function sendOtp(e) {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      showMessage("error", validationError);
      return;
    }

    try {
      setLoading(true);
      showMessage("", "");

      const response = await fetch(`${API_URL}/api/email-otp/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || data.error || "Failed to send OTP.");
      }

      setStep(2);
      setTimer(120);
      setOtp("");

      showMessage(
        "success",
        "OTP sent successfully to your email. Please check inbox or spam folder."
      );
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtpAndCreateAccount(e) {
    e.preventDefault();

    if (!otp.trim()) {
      showMessage("error", "Please enter OTP.");
      return;
    }

    if (otp.trim().length !== 6) {
      showMessage("error", "OTP must be 6 digits.");
      return;
    }

    if (timer <= 0) {
      showMessage("error", "OTP expired. Please generate a new OTP.");
      return;
    }

    try {
      setLoading(true);
      showMessage("", "");

      const verifyResponse = await fetch(`${API_URL}/api/email-otp/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          otp: otp.trim(),
        }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyData.success) {
        throw new Error(verifyData.message || verifyData.error || "Wrong OTP.");
      }

      const signupResponse = await fetch(`${API_URL}/api/customer-auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: form.full_name,
          age: form.age,
          dob: form.dob,
          phone: form.phone,
          email: form.email,
          password: form.password,
        }),
      });

      const signupData = await signupResponse.json();

      if (!signupData.success) {
        throw new Error(signupData.message || signupData.error || "Signup failed.");
      }

      const customer = signupData.customer;

      localStorage.setItem("userRole", "customer");
      localStorage.setItem("customerId", customer.id || "");
      localStorage.setItem("userName", customer.full_name || form.full_name);
      localStorage.setItem("customerEmail", customer.email || form.email);
      localStorage.setItem("customerPhone", customer.phone || form.phone);
      localStorage.setItem("radhivyaCustomerProfile", JSON.stringify(customer));

      showMessage("success", "Account verified and created successfully.");

      setTimeout(() => {
        navigate("/profile");
      }, 900);
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    if (timer > 0) {
      showMessage("error", "Please wait until current OTP expires.");
      return;
    }

    try {
      setLoading(true);
      setOtp("");
      showMessage("", "");

      const response = await fetch(`${API_URL}/api/email-otp/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || data.error || "Failed to resend OTP.");
      }

      setTimer(120);
      showMessage("success", "New OTP sent to your email.");
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  }

  const minutes = String(Math.floor(timer / 60)).padStart(2, "0");
  const seconds = String(timer % 60).padStart(2, "0");

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

          <span>Premium Customer Signup</span>

          <h1>Create your glow account</h1>

          <p>
            Register with your own email and password. Your email will be
            verified with a 6-digit OTP before account creation.
          </p>

          <ul>
            <li>✓ Customer email and password login</li>
            <li>✓ Email OTP verification</li>
            <li>✓ Customer record saved in database</li>
            <li>✓ Only your own orders visible</li>
            <li>✓ Forgot password support</li>
          </ul>
        </div>

        <div className="signup-form-panel">
          {step === 1 && (
            <form className="signup-form" onSubmit={sendOtp}>
              <span className="signup-step">Step 1</span>

              <h2>Create Account</h2>

              <p>Enter your details. Then we will send OTP to your email.</p>

              <div className="signup-grid">
                <label>
                  Full Name *
                  <input
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                  />
                </label>

                <label>
                  Age *
                  <input
                    name="age"
                    type="number"
                    value={form.age}
                    onChange={handleChange}
                    placeholder="Enter age"
                  />
                </label>

                <label>
                  Date of Birth *
                  <input
                    name="dob"
                    type="date"
                    value={form.dob}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Mobile Number *
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter mobile number"
                  />
                </label>

                <label>
                  Email *
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />
                </label>

                <label>
                  Password *
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Create password"
                  />
                </label>

                <label className="signup-wide">
                  Confirm Password *
                  <input
                    name="confirm_password"
                    type="password"
                    value={form.confirm_password}
                    onChange={handleChange}
                    placeholder="Confirm password"
                  />
                </label>
              </div>

              {message.text && (
                <div className={`signup-message ${message.type}`}>
                  {message.text}
                </div>
              )}

              <button type="submit" disabled={loading}>
                {loading ? "Sending OTP..." : "Send OTP to Email"}
              </button>

              <p className="signup-bottom-text">
                Already have an account? <Link to="/login">Login here</Link>
              </p>
            </form>
          )}

          {step === 2 && (
            <form className="signup-form" onSubmit={verifyOtpAndCreateAccount}>
              <span className="signup-step">Step 2</span>

              <h2>Verify OTP</h2>

              <p>
                Enter the 6-digit OTP sent to <strong>{form.email}</strong>.
              </p>

              <div className="otp-timer-box">
                OTP expires in {minutes}:{seconds}
              </div>

              <label>
                OTP Code *
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                />
              </label>

              {message.text && (
                <div className={`signup-message ${message.type}`}>
                  {message.text}
                </div>
              )}

              <button type="submit" disabled={loading || timer <= 0}>
                {loading ? "Creating Account..." : "Verify & Create Account"}
              </button>

              <button
                type="button"
                className="secondary-signup-btn"
                onClick={resendOtp}
                disabled={loading || timer > 0}
              >
                Generate New OTP
              </button>

              <button
                type="button"
                className="secondary-signup-btn"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  showMessage("", "");
                }}
              >
                Back to Details
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}