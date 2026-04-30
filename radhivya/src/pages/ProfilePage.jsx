import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { normalizeTracking } from "../utils/orderWorkflow.js";
import "./ProfilePage.css";

const API_URL = "http://localhost:5000";

function readOrders() {
  try {
    return JSON.parse(localStorage.getItem("radhivyaOrders") || "[]");
  } catch {
    return [];
  }
}

function getSavedProfile() {
  try {
    return JSON.parse(localStorage.getItem("radhivyaCustomerProfile") || "null");
  } catch {
    return null;
  }
}

function getDeliveredStep(order) {
  const tracking = normalizeTracking(
    order.tracking || [],
    order.created_at,
    order.customer?.city
  );

  return tracking.find((step) => step.key === "delivered" && step.completed);
}

function getAcceptedStep(order) {
  const tracking = normalizeTracking(
    order.tracking || [],
    order.created_at,
    order.customer?.city
  );

  return (
    tracking.find((step) => step.key === "order_confirmed" && step.completed) ||
    tracking.find((step) => step.key === "order_placed" && step.completed)
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();

  const savedProfile = getSavedProfile();

  const [orders, setOrders] = useState(readOrders());
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [supportTickets, setSupportTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [profileMode, setProfileMode] = useState("view");

  const [profileForm, setProfileForm] = useState({
    full_name:
      savedProfile?.full_name || localStorage.getItem("userName") || "",
    email:
      savedProfile?.email || localStorage.getItem("customerEmail") || "",
    phone:
      savedProfile?.phone || localStorage.getItem("customerPhone") || "",
    dob: savedProfile?.dob || "",
    age: savedProfile?.age || "",
    address: savedProfile?.address || "",
    city: savedProfile?.city || "",
    state: savedProfile?.state || "",
    pincode: savedProfile?.pincode || "",
    country: savedProfile?.country || "India",
  });

  const customerName = profileForm.full_name || "Radhivya Customer";
  const customerEmail = profileForm.email || "customer@radhivya.com";
  const customerPhone = profileForm.phone || "Not added";

  const selectedOrder =
    orders.find((order) => order.id === selectedOrderId) || orders[0];

  useEffect(() => {
    loadSupportInbox();
  }, []);

  async function loadSupportInbox() {
    const email = localStorage.getItem("customerEmail");

    if (!email) return;

    try {
      setLoadingTickets(true);

      const response = await fetch(
        `${API_URL}/api/support/tickets?email=${encodeURIComponent(email)}`
      );

      const data = await response.json();

      if (data.success) {
        setSupportTickets(Array.isArray(data.tickets) ? data.tickets : []);
      }
    } catch (error) {
      console.error("Support inbox load error:", error);
    } finally {
      setLoadingTickets(false);
    }
  }

  const totalSpent = useMemo(() => {
    return orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  }, [orders]);

  const deliveredOrders = useMemo(() => {
    return orders.filter((order) => getDeliveredStep(order));
  }, [orders]);

  function handleProfileChange(e) {
    const { name, value } = e.target;

    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function saveProfile(e) {
    e.preventDefault();

    localStorage.setItem("radhivyaCustomerProfile", JSON.stringify(profileForm));
    localStorage.setItem("userName", profileForm.full_name);
    localStorage.setItem("customerEmail", profileForm.email);
    localStorage.setItem("customerPhone", profileForm.phone);

    setProfileMode("view");
  }

  function logoutCustomer() {
    localStorage.removeItem("userRole");
    localStorage.removeItem("customerId");
    localStorage.removeItem("userName");
    localStorage.removeItem("customerEmail");
    localStorage.removeItem("customerPhone");

    navigate("/login");
  }

  function openInvoice(order) {
    localStorage.setItem("radhivyaInvoice", JSON.stringify(order));
    localStorage.setItem("radhivyaLastOrder", JSON.stringify(order));
    navigate("/invoice");
  }

  const selectedDeliveredStep = selectedOrder
    ? getDeliveredStep(selectedOrder)
    : null;

  const selectedAcceptedStep = selectedOrder
    ? getAcceptedStep(selectedOrder)
    : null;

  const selectedTracking = selectedOrder
    ? normalizeTracking(
        selectedOrder.tracking || [],
        selectedOrder.created_at,
        selectedOrder.customer?.city
      )
    : [];

  return (
    <>
      <Header />

      <main className="profile-page">
        <section className="profile-container">
          <div className="profile-header">
            <span>Customer Profile</span>
            <h1>Your Radhivya account</h1>
            <p>
              Manage your profile, saved address, order history, invoices,
              tracking, and support inbox.
            </p>
          </div>

          <div className="profile-layout">
            <aside className="profile-sidebar">
              <div className="profile-avatar">
                {customerName.charAt(0).toUpperCase()}
              </div>

              <h2>{customerName}</h2>
              <p>{customerEmail}</p>

              <div className="profile-stat-grid">
                <div className="profile-stat">
                  <strong>{orders.length}</strong>
                  <span>Total Orders</span>
                </div>

                <div className="profile-stat">
                  <strong>₹{totalSpent}</strong>
                  <span>Total Spent</span>
                </div>

                <div className="profile-stat">
                  <strong>{deliveredOrders.length}</strong>
                  <span>Delivered</span>
                </div>
              </div>

              <div className="profile-actions">
                <Link to="/products">Shop More</Link>
                <Link to="/wishlist">Wishlist</Link>

                <button
                  type="button"
                  className="profile-logout-btn"
                  onClick={logoutCustomer}
                >
                  Logout
                </button>
              </div>
            </aside>

            <section className="profile-main">
              <section className="profile-main-card">
                <div className="profile-section-title-row">
                  <div>
                    <span>Personal Details</span>
                    <h2>Customer information</h2>
                  </div>

                  {profileMode === "view" ? (
                    <button
                      className="profile-small-btn"
                      onClick={() => setProfileMode("edit")}
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <button
                      className="profile-small-btn secondary"
                      onClick={() => setProfileMode("view")}
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {profileMode === "view" ? (
                  <div className="profile-info-grid">
                    <div className="profile-info-box">
                      <span>Name</span>
                      <strong>{customerName}</strong>
                    </div>

                    <div className="profile-info-box">
                      <span>Email</span>
                      <strong>{customerEmail}</strong>
                    </div>

                    <div className="profile-info-box">
                      <span>Phone</span>
                      <strong>{customerPhone}</strong>
                    </div>

                    <div className="profile-info-box">
                      <span>Age / DOB</span>
                      <strong>
                        {profileForm.age || "N/A"}{" "}
                        {profileForm.dob ? `· ${profileForm.dob}` : ""}
                      </strong>
                    </div>

                    <div className="profile-info-box wide">
                      <span>Saved Address</span>
                      <strong>
                        {profileForm.address
                          ? `${profileForm.address}, ${profileForm.city}, ${profileForm.state}, ${profileForm.pincode}, ${profileForm.country}`
                          : "No saved address yet"}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <form className="profile-edit-form" onSubmit={saveProfile}>
                    <div className="profile-edit-grid">
                      <label>
                        Full Name
                        <input
                          name="full_name"
                          value={profileForm.full_name}
                          onChange={handleProfileChange}
                        />
                      </label>

                      <label>
                        Email
                        <input
                          name="email"
                          type="email"
                          value={profileForm.email}
                          onChange={handleProfileChange}
                        />
                      </label>

                      <label>
                        Phone
                        <input
                          name="phone"
                          value={profileForm.phone}
                          onChange={handleProfileChange}
                        />
                      </label>

                      <label>
                        Age
                        <input
                          name="age"
                          type="number"
                          value={profileForm.age}
                          onChange={handleProfileChange}
                        />
                      </label>

                      <label>
                        Date of Birth
                        <input
                          name="dob"
                          type="date"
                          value={profileForm.dob}
                          onChange={handleProfileChange}
                        />
                      </label>

                      <label>
                        Pincode
                        <input
                          name="pincode"
                          value={profileForm.pincode}
                          onChange={handleProfileChange}
                        />
                      </label>

                      <label>
                        City
                        <input
                          name="city"
                          value={profileForm.city}
                          onChange={handleProfileChange}
                        />
                      </label>

                      <label>
                        State
                        <input
                          name="state"
                          value={profileForm.state}
                          onChange={handleProfileChange}
                        />
                      </label>

                      <label>
                        Country
                        <input
                          name="country"
                          value={profileForm.country}
                          onChange={handleProfileChange}
                        />
                      </label>
                    </div>

                    <label>
                      Full Address
                      <textarea
                        name="address"
                        value={profileForm.address}
                        onChange={handleProfileChange}
                      />
                    </label>

                    <button type="submit">Save Profile</button>
                  </form>
                )}
              </section>

              <section className="profile-order-history-card">
                <div className="profile-section-title">
                  <span>Order History</span>
                  <h2>Your placed orders</h2>
                </div>

                {orders.length === 0 ? (
                  <div className="profile-empty">
                    No orders yet. Place your first Radhivya order and it will
                    appear here.
                  </div>
                ) : (
                  <div className="profile-order-history-layout">
                    <div className="profile-order-list">
                      {orders.map((order) => {
                        const delivered = getDeliveredStep(order);

                        return (
                          <button
                            key={order.id}
                            className={`profile-order-list-item ${
                              selectedOrder?.id === order.id ? "active" : ""
                            }`}
                            onClick={() => setSelectedOrderId(order.id)}
                          >
                            <div>
                              <strong>{order.order_number}</strong>
                              <span>
                                {new Date(order.created_at).toLocaleDateString()}
                              </span>
                            </div>

                            <div>
                              <strong>₹{order.total}</strong>
                              <span>
                                {delivered ? "Delivered" : order.order_status}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {selectedOrder && (
                      <div className="profile-order-detail">
                        <div className="order-detail-head">
                          <div>
                            <span>Selected Order</span>
                            <h3>{selectedOrder.order_number}</h3>
                          </div>

                          <button onClick={() => openInvoice(selectedOrder)}>
                            View Invoice
                          </button>
                        </div>

                        <div className="order-detail-grid">
                          <div>
                            <span>Total</span>
                            <strong>₹{selectedOrder.total}</strong>
                          </div>

                          <div>
                            <span>Payment</span>
                            <strong>{selectedOrder.payment_status}</strong>
                          </div>

                          <div>
                            <span>Status</span>
                            <strong>{selectedOrder.order_status}</strong>
                          </div>

                          <div>
                            <span>Coupon</span>
                            <strong>
                              {selectedOrder.coupon_code || "No coupon"}
                            </strong>
                          </div>
                        </div>

                        <div className="order-items-list">
                          {(selectedOrder.items || []).map((item, index) => (
                            <div key={`${item.id}-${index}`}>
                              <strong>{item.name}</strong>
                              <span>
                                Qty {item.quantity || 1} · ₹{item.price}
                              </span>
                            </div>
                          ))}
                        </div>

                        {selectedDeliveredStep ? (
                          <div className="delivered-summary">
                            <h4>Delivered Order Summary</h4>
                            <p>
                              Accepted:{" "}
                              {selectedAcceptedStep?.date || "Order accepted"}
                            </p>
                            <p>
                              Delivered: {selectedDeliveredStep.date} ·{" "}
                              {selectedDeliveredStep.time}
                            </p>
                          </div>
                        ) : (
                          <div className="tracking-steps">
                            {selectedTracking.map((step) => (
                              <div
                                className={`tracking-step ${
                                  step.completed ? "completed" : ""
                                }`}
                                key={`${selectedOrder.id}-${step.key}`}
                              >
                                <div className="tracking-dot"></div>

                                <div className="tracking-step-content">
                                  <h4>{step.status}</h4>
                                  <p>{step.admin_note || step.note}</p>

                                  <div>
                                    <span>{step.location}</span>
                                    <span>
                                      {step.completed ? "Approved" : "Expected"}
                                    </span>
                                    <span>{step.date}</span>
                                    <span>{step.time}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </section>

              <section className="profile-support-card">
                <div className="profile-section-title">
                  <span>Inbox / Support</span>
                  <h2>Your messages with staff</h2>
                </div>

                {loadingTickets ? (
                  <div className="profile-empty">Loading your inbox...</div>
                ) : supportTickets.length === 0 ? (
                  <div className="profile-empty">
                    No support messages yet. Use the robot chat button on the
                    right side of the website to ask staff anything.
                  </div>
                ) : (
                  <div className="profile-support-list">
                    {supportTickets.map((ticket) => (
                      <article
                        className="profile-support-ticket"
                        key={ticket.id}
                      >
                        <h3>{ticket.subject}</h3>
                        <p>{ticket.message}</p>

                        <div className="profile-ticket-badges">
                          <span>{ticket.status}</span>
                          <span>
                            Sent {new Date(ticket.created_at).toLocaleString()}
                          </span>
                        </div>

                        {ticket.staff_reply ? (
                          <div className="profile-staff-reply">
                            <strong>
                              Staff Reply
                              {ticket.replied_by
                                ? ` from ${ticket.replied_by}`
                                : ""}
                            </strong>

                            <p>{ticket.staff_reply}</p>

                            {ticket.replied_at && (
                              <small>
                                Replied on{" "}
                                {new Date(ticket.replied_at).toLocaleString()}
                              </small>
                            )}
                          </div>
                        ) : (
                          <div className="profile-waiting-reply">
                            Staff has not replied yet.
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </section>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}