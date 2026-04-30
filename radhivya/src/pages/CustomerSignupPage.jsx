import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CustomerSignupPage.css";

const API_URL = "http://localhost:5000";

export default function CustomerSignupPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState("details");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpRequestId, setOtpRequestId] = useState("");
  const [testingOtp, setTestingOtp] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(120);

  const [form, setForm] = useState({
    full_name: "",
    age: "",
    dob: "",
    mobile: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  useEffect(() => {
    if (step !== "otp") return;

    setSecondsLeft(120);

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, otpRequestId]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function validateDetails() {
    if (!form.full_name.trim()) return "Full name is required.";
    if (!form.age || Number(form.age) < 1) return "Valid age is required.";
    if (!form.dob) return "Date of birth is required.";
    if (!form.mobile.trim()) return "Mobile number is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!form.password.trim()) return "Password is required.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (form.password !== form.confirm_password) return "Passwords do not match.";

    return "";
  }

  async function sendOtp(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateDetails();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/customer-signup/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: form.full_name,
          age: form.age,
          dob: form.dob,
          mobile: form.mobile,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to send OTP.");
      }

      setOtpRequestId(data.otp_request_id);
      setTestingOtp(data.dev_otp_for_testing || "");
      setStep("otp");
      setSuccess("OTP generated successfully. It is valid for 2 minutes.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otpCode.trim()) {
      setError("Please enter OTP code.");
      return;
    }

    if (secondsLeft <= 0) {
      setError("OTP expired. Please generate a new OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/customer-signup/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp_request_id: otpRequestId,
          otp_code: otpCode,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "OTP verification failed.");
      }

      localStorage.setItem("userRole", "customer");
      localStorage.setItem("customerId", data.customer.id);
      localStorage.setItem("userName", data.customer.full_name);
      localStorage.setItem("customerEmail", data.customer.email);
      localStorage.setItem("customerPhone", data.customer.phone || "");

      setSuccess("Account created successfully.");

      setTimeout(() => {
        navigate("/profile");
      }, 900);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function regenerateOtp() {
    setStep("details");
    setOtpCode("");
    setOtpRequestId("");
    setTestingOtp("");
    setError("");
    setSuccess("Fill details again and generate a new OTP.");
  }

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  return (
    <main className="signup-page">
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
            Register with your name, age, date of birth, mobile number, and email.
            Verify using a 6-digit OTP valid for only 2 minutes.
          </p>

          <div className="signup-points">
            <strong>✓ OTP verification</strong>
            <strong>✓ Customer record saved</strong>
            <strong>✓ Visible to admin and staff</strong>
            <strong>✓ Secure customer login after signup</strong>
          </div>
        </div>

        <div className="signup-form-panel">
          {step === "details" && (
            <>
              <div className="signup-badge">Step 1</div>

              <h2>Customer Details</h2>

              <p className="signup-subtitle">
                Enter your details to generate your verification OTP.
              </p>

              {error && <div className="signup-error">{error}</div>}
              {success && <div className="signup-success">{success}</div>}

              <form className="signup-form" onSubmit={sendOtp}>
                <label>
                  Full Name *
                  <input
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                  />
                </label>

                <div className="signup-grid">
                  <label>
                    Age *
                    <input
                      name="age"
                      type="number"
                      value={form.age}
                      onChange={handleChange}
                      placeholder="Age"
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
                </div>

                <label>
                  Mobile Number *
                  <input
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    placeholder="9876543210"
                  />
                </label>

                <label>
                  Email ID *
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="customer@example.com"
                  />
                </label>

                <div className="signup-grid">
                  <label>
                    Password *
                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Minimum 6 characters"
                    />
                  </label>

                  <label>
                    Confirm Password *
                    <input
                      name="confirm_password"
                      type="password"
                      value={form.confirm_password}
                      onChange={handleChange}
                      placeholder="Repeat password"
                    />
                  </label>
                </div>

                <button type="submit" disabled={loading}>
                  {loading ? "Generating OTP..." : "Generate OTP"}
                </button>
              </form>

              <div className="signup-bottom">
                Already have an account? <Link to="/login">Login here</Link>
              </div>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="signup-badge">Step 2</div>

              <h2>Verify OTP</h2>

              <p className="signup-subtitle">
                Enter the 6-digit OTP sent to your email and mobile number.
              </p>

              <div className={`otp-timer ${secondsLeft <= 20 ? "danger" : ""}`}>
                OTP expires in <strong>{minutes}:{seconds}</strong>
              </div>

              {testingOtp && (
                <div className="signup-dev-otp">
                  Testing OTP: <strong>{testingOtp}</strong>
                </div>
              )}

              {error && <div className="signup-error">{error}</div>}
              {success && <div className="signup-success">{success}</div>}

              <form className="signup-form" onSubmit={verifyOtp}>
                <label>
                  OTP Code *
                  <input
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                  />
                </label>

                <button type="submit" disabled={loading || secondsLeft <= 0}>
                  {loading ? "Verifying..." : "Verify & Create Account"}
                </button>

                <button type="button" className="secondary-btn" onClick={regenerateOtp}>
                  Generate New OTP
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}