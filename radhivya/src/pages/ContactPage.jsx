import { useState } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Toast from "../components/Toast.jsx";
import "./ContactPage.css";

const API_URL = "http://localhost:5000";

export default function ContactPage() {
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({
    customer_name: localStorage.getItem("userName") || "",
    customer_email: localStorage.getItem("customerEmail") || "",
    customer_phone: localStorage.getItem("customerPhone") || "",
    subject: "",
    message: "",
  });

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2600);
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function submitMessage(e) {
    e.preventDefault();

    if (!form.customer_email || !form.subject || !form.message) {
      showToast("Email, subject and message are required.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/support/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to send message.");
      }

      showToast("Message sent. Staff reply will appear in your Profile Inbox.");

      setForm((prev) => ({
        ...prev,
        subject: "",
        message: "",
      }));
    } catch (error) {
      showToast(error.message);
    }
  }

  return (
    <>
      <Header />
      <Toast message={toast} />

      <main className="contact-page">
        <section className="contact-hero">
          <span>Contact Radhivya</span>
          <h1>We are here for your skincare questions.</h1>
          <p>
            Send your query to Radhivya staff. Replies will appear inside your
            profile inbox, so your support conversation stays organized.
          </p>
        </section>

        <section className="contact-layout">
          <div className="contact-card contact-info-card">
            <span>Support Experience</span>
            <h2>Premium customer care</h2>
            <p>
              Ask about orders, products, payments, skincare suggestions, or
              delivery tracking. Staff can reply directly to your inbox.
            </p>

            <div className="contact-info-grid">
              <div>
                <strong>Email</strong>
                <span>support@radhivya.com</span>
              </div>

              <div>
                <strong>Response</strong>
                <span>Staff inbox reply</span>
              </div>

              <div>
                <strong>Tracking</strong>
                <span>7-day delivery flow</span>
              </div>
            </div>
          </div>

          <form className="contact-card contact-form" onSubmit={submitMessage}>
            <h2>Send message</h2>

            <label>
              Name
              <input
                name="customer_name"
                value={form.customer_name}
                onChange={handleChange}
                placeholder="Your name"
              />
            </label>

            <label>
              Email
              <input
                name="customer_email"
                type="email"
                value={form.customer_email}
                onChange={handleChange}
                placeholder="your@email.com"
              />
            </label>

            <label>
              Phone
              <input
                name="customer_phone"
                value={form.customer_phone}
                onChange={handleChange}
                placeholder="Phone number"
              />
            </label>

            <label>
              Subject
              <input
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="How can we help?"
              />
            </label>

            <label>
              Message
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Write your message..."
              />
            </label>

            <button type="submit">Send to Staff</button>
          </form>
        </section>
      </main>

      <Footer />
    </>
  );
}