import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "./ContactPage.css";

const API_URL = "http://localhost:5000";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [messageBox, setMessageBox] = useState("");
  const [messageType, setMessageType] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    subject: "Product question",
    message: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function validateForm() {
    if (!form.full_name.trim()) return "Full name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!form.subject.trim()) return "Subject is required.";
    if (!form.message.trim()) return "Message is required.";

    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setMessageBox("");
    setMessageType("");

    const validationError = validateForm();

    if (validationError) {
      setMessageBox(validationError);
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/support`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || data.message || "Failed to send message.");
      }

      setMessageBox(
        "Your message has been sent successfully. Our support team will review it."
      );
      setMessageType("success");

      setForm({
        full_name: "",
        email: "",
        phone: "",
        subject: "Product question",
        message: "",
      });
    } catch (error) {
      setMessageBox(error.message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />

      <main className="contact-page">
        <div className="contact-container">
          <section className="contact-header">
            <h1>Contact Us</h1>

            <p>
              Have a question about your order, product, shipping, or skincare
              routine? Send us a message and our support team will help you.
            </p>
          </section>

          <section className="contact-layout">
            <div className="contact-card">
              <h2>Send Us a Message</h2>

              {messageBox && (
                <div
                  className={`contact-message ${
                    messageType === "success" ? "contact-success" : "contact-error"
                  }`}
                >
                  {messageBox}
                </div>
              )}

              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="contact-row">
                  <div className="contact-field">
                    <label>Full Name *</label>
                    <input
                      name="full_name"
                      value={form.full_name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="contact-field">
                    <label>Email *</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="contact-field">
                  <label>Phone</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="contact-field">
                  <label>Subject *</label>
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                  >
                    <option value="Product question">Product question</option>
                    <option value="Order support">Order support</option>
                    <option value="Shipping question">Shipping question</option>
                    <option value="Return or refund">Return or refund</option>
                    <option value="Website issue">Website issue</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="contact-field">
                  <label>Your Message *</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Type your message here..."
                  />
                </div>

                <button className="contact-btn" type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>

            <aside className="contact-info-card">
              <h2>Contact Details</h2>

              <div className="info-list">
                <div className="info-box">
                  <h3>Customer Support</h3>
                  <p>Monday – Saturday, 9AM – 6PM</p>
                </div>

                <div className="info-box">
                  <h3>Email</h3>
                  <p>support@radhivya.com</p>
                </div>

                <div className="info-box">
                  <h3>WhatsApp / Help</h3>
                  <p>Quick support for order and product questions.</p>
                </div>

                <div className="info-box">
                  <h3>Address</h3>
                  <p>Radhivya Skincare Pvt. Ltd., India</p>
                </div>
              </div>

              <div className="contact-links">
                <Link to="/products">Shop Products</Link>
                <Link to="/login">Customer Login</Link>
              </div>
            </aside>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}