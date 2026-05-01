import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ChatBot.css";

const API_URL = "http://localhost:5000";

const quickMessages = [
  {
    label: "Track my order",
    subject: "Order Tracking Help",
    message:
      "Hello Radhivya team, I want to know the current tracking status of my order. Please help me.",
  },
  {
    label: "Payment help",
    subject: "Payment Help",
    message:
      "Hello Radhivya team, I need help with my payment or order confirmation. Please check and reply.",
  },
  {
    label: "Product suggestion",
    subject: "Skincare Product Suggestion",
    message:
      "Hello Radhivya team, please suggest skincare products for me according to my skin needs.",
  },
  {
    label: "Talk to staff",
    subject: "Talk to Staff",
    message:
      "Hello Radhivya team, I want to talk with staff regarding my query. Please reply to me.",
  },
];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("Customer Support Query");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  const customerName = localStorage.getItem("userName") || "";
  const customerEmail = localStorage.getItem("customerEmail") || "";
  const customerPhone = localStorage.getItem("customerPhone") || "";

  useEffect(() => {
    function closeOnEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", closeOnEsc);
    return () => window.removeEventListener("keydown", closeOnEsc);
  }, []);

  function useQuickMessage(item) {
    setSubject(item.subject);
    setMessage(item.message);
  }

  async function sendQuery(e) {
    e.preventDefault();

    if (!customerEmail) {
      setStatus(
        "Please login or signup first. Then staff can reply to your profile inbox."
      );
      return;
    }

    if (!message.trim()) {
      setStatus("Please write your message first.");
      return;
    }

    try {
      setSending(true);
      setStatus("");

      const response = await fetch(`${API_URL}/api/support/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          subject,
          message,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || data.message || "Failed to send message.");
      }

      setMessage("");
      setStatus("Sent successfully. Staff reply will appear in Profile → Inbox.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {open && (
        <div
          className="chatbot-screen-overlay"
          onClick={() => setOpen(false)}
        ></div>
      )}

      <button
        className={`radhivya-chatbot-button ${open ? "chatbot-open" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open Radhivya assistant"
      >
        <span className="bot-face">
          <span className="bot-eye left"></span>
          <span className="bot-eye right"></span>
          <span className="bot-smile"></span>
        </span>

        <span className="bot-thumb">👍</span>
        <span className="bot-spark">✨</span>
      </button>

      {open && (
        <section
          className="radhivya-chatbot-panel"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="chatbot-premium-head">
            <div>
              <strong>Radhivya Assistant</strong>
              <span>Bot first, staff reply in your inbox</span>
            </div>

            <button
              type="button"
              className="chatbot-close-btn"
              onClick={() => setOpen(false)}
              aria-label="Close chatbot"
            >
              ×
            </button>
          </div>

          <div className="chatbot-body">
            <div className="bot-bubble">
              Hello 👋 I can help you send your question to Radhivya staff.
            </div>

            <div className="bot-bubble">
              Choose a topic or write your own message.
            </div>

            <div className="bot-chip-grid">
              {quickMessages.map((item) => (
                <button
                  type="button"
                  key={item.label}
                  onClick={() => useQuickMessage(item)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {!customerEmail ? (
              <div className="chatbot-login-card">
                <h3>Login needed</h3>
                <p>
                  Staff can reply only when your email is saved in your customer
                  account.
                </p>

                <div>
                  <Link to="/login">Login</Link>
                  <Link to="/signup">Signup</Link>
                </div>
              </div>
            ) : (
              <form className="chatbot-message-form" onSubmit={sendQuery}>
                <label>
                  Subject
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </label>

                <label>
                  Message
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message here..."
                  />
                </label>

                <button type="submit" disabled={sending}>
                  {sending ? "Sending..." : "Send to Staff"}
                </button>

                <Link className="open-inbox-link" to="/profile">
                  Open Profile Inbox
                </Link>

                {status && <p className="chatbot-status">{status}</p>}
              </form>
            )}
          </div>
        </section>
      )}
    </>
  );
}