import { useState } from "react";
import { Link } from "react-router-dom";
import "./ChatBot.css";

const API_URL = "http://localhost:5000";

const botSuggestions = [
  "Where is my order?",
  "I need help with payment",
  "I want skincare recommendation",
  "I want to contact staff",
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

  function useSuggestion(text) {
    setSubject(text);

    if (text === "Where is my order?") {
      setMessage(
        "Hello Radhivya team, I want to know the current status of my order. Please help me with tracking."
      );
    } else if (text === "I need help with payment") {
      setMessage(
        "Hello Radhivya team, I need help with my payment/order confirmation. Please check and reply."
      );
    } else if (text === "I want skincare recommendation") {
      setMessage(
        "Hello Radhivya team, I want a skincare recommendation. Please guide me according to my skin needs."
      );
    } else {
      setMessage(
        "Hello Radhivya team, I want to talk with staff regarding my query. Please reply to me."
      );
    }
  }

  async function sendQuery(e) {
    e.preventDefault();

    if (!customerEmail) {
      setStatus("Please login or create an account before sending a message.");
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
        throw new Error(data.message || "Failed to send message.");
      }

      setMessage("");
      setStatus("Message sent. Staff reply will appear in your Profile Inbox.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        className="chatbot-robot-button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open Radhivya support chat"
      >
        <span className="robot-head">
          <span className="robot-eye left"></span>
          <span className="robot-eye right"></span>
          <span className="robot-mouth"></span>
        </span>

        <span className="robot-hand">👍</span>
        <span className="robot-text">Help</span>
      </button>

      {open && (
        <section className="chatbot-panel">
          <div className="chatbot-panel-head">
            <div>
              <strong>Radhivya Assistant</strong>
              <span>Bot first, staff reply in inbox</span>
            </div>

            <button type="button" onClick={() => setOpen(false)}>
              ×
            </button>
          </div>

          <div className="bot-conversation">
            <div className="bot-message">
              Hi, I am Radhivya Assistant. I can take your query and send it to
              our staff team.
            </div>

            <div className="bot-message">
              Choose a quick topic or write your own message.
            </div>

            <div className="bot-suggestions">
              {botSuggestions.map((item) => (
                <button type="button" key={item} onClick={() => useSuggestion(item)}>
                  {item}
                </button>
              ))}
            </div>
          </div>

          {!customerEmail ? (
            <div className="chatbot-login-box">
              <h3>Login Required</h3>
              <p>
                Please login or create your account so staff can reply to your
                profile inbox.
              </p>

              <div>
                <Link to="/login">Login</Link>
                <Link to="/signup">Signup</Link>
              </div>
            </div>
          ) : (
            <form className="chatbot-form" onSubmit={sendQuery}>
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
                  placeholder="Write your question here..."
                />
              </label>

              <button type="submit" disabled={sending}>
                {sending ? "Sending..." : "Send to Staff"}
              </button>

              <Link className="chatbot-inbox-link" to="/profile">
                Open Profile Inbox
              </Link>

              {status && <p className="chatbot-status">{status}</p>}
            </form>
          )}
        </section>
      )}
    </>
  );
}