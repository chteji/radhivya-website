import { useEffect, useMemo, useState } from "react";
import "./StaffPortalPage.css";

const API_URL = "http://localhost:5000";

const tabs = [
  "Dashboard",
  "Support Tickets",
  "Customer Messages",
  "Orders Tracking",
  "Customers",
  "Marketing Tasks",
  "Influencers",
  "Social Media",
];

const emptyReplyForm = {
  ticketId: "",
  reply: "",
};

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function readLocal(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function saveLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getStaffName() {
  return (
    localStorage.getItem("staffName") ||
    localStorage.getItem("userName") ||
    "Radhivya Staff"
  );
}

export default function StaffPortalPage() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState(readLocal("radhivyaOrders"));
  const [supportTickets, setSupportTickets] = useState([]);

  const [marketingTasks, setMarketingTasks] = useState(
    readLocal("radhivyaMarketingTasks")
  );
  const [influencers, setInfluencers] = useState(
    readLocal("radhivyaInfluencers")
  );
  const [socialPosts, setSocialPosts] = useState(
    readLocal("radhivyaSocialPosts")
  );

  const [replyForm, setReplyForm] = useState(emptyReplyForm);

  const [marketingForm, setMarketingForm] = useState({
    title: "",
    platform: "Instagram",
    priority: "Medium",
    deadline: "",
    status: "Pending",
    notes: "",
  });

  const [influencerForm, setInfluencerForm] = useState({
    name: "",
    instagram_id: "",
    email: "",
    products: "",
    campaign_date: "",
    budget: "",
    status: "Planned",
    notes: "",
  });

  const [socialForm, setSocialForm] = useState({
    platform: "Instagram",
    banner_title: "",
    banner_url: "",
    caption: "",
    schedule_date: "",
    status: "Draft",
  });

  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const isStaffLoggedIn = localStorage.getItem("userRole") === "staff";

  useEffect(() => {
    loadCustomers();
    loadSupportTickets();
    setOrders(readLocal("radhivyaOrders"));
  }, []);

  function showMessage(type, text) {
    setMessage({ type, text });

    setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, 4200);
  }

  async function loadCustomers() {
    try {
      const response = await fetch(`${API_URL}/api/business/customers`, {
        headers: {
          "x-user-role": "staff",
        },
      });

      const data = await response.json();

      if (data.success) {
        setCustomers(safeArray(data.customers));
      }
    } catch (error) {
      console.error("Failed to load customers:", error);
    }
  }

  async function loadSupportTickets() {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/support/tickets`);
      const data = await response.json();

      if (data.success) {
        setSupportTickets(safeArray(data.tickets));
      }
    } catch (error) {
      console.error("Failed to load support tickets:", error);
      showMessage("error", "Failed to load support tickets.");
    } finally {
      setLoading(false);
    }
  }

  function handleReplyChange(ticketId, value) {
    setReplyForm({
      ticketId,
      reply: value,
    });
  }

  async function sendReply(ticketId) {
    const reply = replyForm.ticketId === ticketId ? replyForm.reply : "";

    if (!reply.trim()) {
      showMessage("error", "Please write a reply first.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/support/tickets/${ticketId}/reply`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            staff_reply: reply,
            replied_by: getStaffName(),
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to send reply.");
      }

      showMessage("success", "Reply sent successfully.");
      setReplyForm(emptyReplyForm);
      await loadSupportTickets();
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleMarketingChange(e) {
    const { name, value } = e.target;
    setMarketingForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleInfluencerChange(e) {
    const { name, value } = e.target;
    setInfluencerForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSocialChange(e) {
    const { name, value } = e.target;
    setSocialForm((prev) => ({ ...prev, [name]: value }));
  }

  function createMarketingTask(e) {
    e.preventDefault();

    if (!marketingForm.title) {
      showMessage("error", "Marketing task title is required.");
      return;
    }

    const newTask = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      ...marketingForm,
      created_at: new Date().toISOString(),
      created_by: getStaffName(),
    };

    const updated = [newTask, ...marketingTasks];

    setMarketingTasks(updated);
    saveLocal("radhivyaMarketingTasks", updated);

    showMessage("success", "Marketing task created.");
    setMarketingForm({
      title: "",
      platform: "Instagram",
      priority: "Medium",
      deadline: "",
      status: "Pending",
      notes: "",
    });
  }

  function createInfluencer(e) {
    e.preventDefault();

    if (!influencerForm.name || !influencerForm.instagram_id) {
      showMessage("error", "Influencer name and Instagram ID are required.");
      return;
    }

    const newInfluencer = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      ...influencerForm,
      created_at: new Date().toISOString(),
      created_by: getStaffName(),
    };

    const updated = [newInfluencer, ...influencers];

    setInfluencers(updated);
    saveLocal("radhivyaInfluencers", updated);

    showMessage("success", "Influencer campaign added.");
    setInfluencerForm({
      name: "",
      instagram_id: "",
      email: "",
      products: "",
      campaign_date: "",
      budget: "",
      status: "Planned",
      notes: "",
    });
  }

  function createSocialPost(e) {
    e.preventDefault();

    if (!socialForm.banner_title) {
      showMessage("error", "Banner title is required.");
      return;
    }

    const newPost = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      ...socialForm,
      created_at: new Date().toISOString(),
      created_by: getStaffName(),
    };

    const updated = [newPost, ...socialPosts];

    setSocialPosts(updated);
    saveLocal("radhivyaSocialPosts", updated);

    showMessage("success", "Social media banner task saved.");
    setSocialForm({
      platform: "Instagram",
      banner_title: "",
      banner_url: "",
      caption: "",
      schedule_date: "",
      status: "Draft",
    });
  }

  function sendCustomerEmail(customer) {
    const subject = encodeURIComponent("Special Radhivya Offer For You");
    const body = encodeURIComponent(
      `Hello ${
        customer.full_name || customer.name
      },\n\nWe have a special Radhivya skincare offer for you.\n\nWarm regards,\nRadhivya Team`
    );

    window.location.href = `mailto:${customer.email}?subject=${subject}&body=${body}`;
  }

  function logoutStaff() {
    localStorage.removeItem("userRole");
    localStorage.removeItem("staffId");
    localStorage.removeItem("staffName");
    localStorage.removeItem("staffEmail");
    window.location.href = "/staff-login";
  }

  const stats = useMemo(() => {
    return {
      tickets: supportTickets.length,
      orders: orders.length,
      customers: customers.length,
      tasks: marketingTasks.length,
      influencers: influencers.length,
      social: socialPosts.length,
    };
  }, [
    supportTickets,
    orders,
    customers,
    marketingTasks,
    influencers,
    socialPosts,
  ]);

  if (!isStaffLoggedIn) {
    return (
      <main className="staff-login-required">
        <div>
          <h1>Staff Login Required</h1>
          <p>Please login with an active staff account.</p>
          <a href="/staff-login">Go to Staff Login</a>
        </div>
      </main>
    );
  }

  return (
    <main className="staff-page">
      <aside className="staff-sidebar">
        <div className="staff-brand">
          <img
            src="/logo-transparent.png"
            alt="Radhivya"
            onError={(e) => {
              e.currentTarget.src = "/logo.png";
            }}
          />

          <div>
            <h2>Radhivya</h2>
            <p>Staff Workspace</p>
          </div>
        </div>

        <nav className="staff-nav">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        <button className="staff-logout-btn" onClick={logoutStaff}>
          Logout Staff
        </button>
      </aside>

      <section className="staff-content">
        <div className="staff-topbar">
          <div>
            <span className="staff-eyebrow">Premium Operations</span>
            <h1>Staff Portal</h1>
            <p>
              Manage customer messages, support replies, order tracking,
              marketing tasks, influencer work, and customer communication.
            </p>
          </div>

          <button
            onClick={() => {
              loadCustomers();
              loadSupportTickets();
            }}
          >
            Refresh
          </button>
        </div>

        {message.text && (
          <div
            className={`staff-message ${
              message.type === "success" ? "staff-success" : "staff-error"
            }`}
          >
            {message.text}
          </div>
        )}

        {activeTab === "Dashboard" && (
          <>
            <section className="staff-stat-grid">
              <div className="staff-stat-card">
                <span>Support Tickets</span>
                <strong>{stats.tickets}</strong>
                <p>Customer enquiries received.</p>
              </div>

              <div className="staff-stat-card">
                <span>Orders</span>
                <strong>{stats.orders}</strong>
                <p>Orders available locally.</p>
              </div>

              <div className="staff-stat-card">
                <span>Customers</span>
                <strong>{stats.customers}</strong>
                <p>Registered customer records.</p>
              </div>

              <div className="staff-stat-card">
                <span>Marketing</span>
                <strong>{stats.tasks}</strong>
                <p>Marketing tasks created.</p>
              </div>

              <div className="staff-stat-card">
                <span>Influencers</span>
                <strong>{stats.influencers}</strong>
                <p>Influencer campaigns.</p>
              </div>

              <div className="staff-stat-card">
                <span>Social</span>
                <strong>{stats.social}</strong>
                <p>Social media tasks.</p>
              </div>
            </section>

            <section className="staff-panel-card staff-highlight">
              <div>
                <span className="staff-eyebrow">Daily Staff Focus</span>
                <h2>Reply faster, support better</h2>
                <p>
                  Customer chat messages appear inside Support Tickets. Reply
                  from here and the customer can see your answer inside their
                  Profile Support Inbox.
                </p>
              </div>

              <div className="staff-action-grid">
                <button onClick={() => setActiveTab("Support Tickets")}>
                  Open Tickets
                </button>
                <button onClick={() => setActiveTab("Customers")}>
                  View Customers
                </button>
                <button onClick={() => setActiveTab("Marketing Tasks")}>
                  Marketing Work
                </button>
                <button onClick={() => setActiveTab("Influencers")}>
                  Influencers
                </button>
              </div>
            </section>
          </>
        )}

        {activeTab === "Support Tickets" && (
          <section className="staff-list-card">
            <h2>Customer Support Tickets</h2>

            {loading ? (
              <div className="staff-empty">Loading tickets...</div>
            ) : supportTickets.length === 0 ? (
              <div className="staff-empty">
                No customer queries yet. When customer uses chatbot, messages
                will appear here.
              </div>
            ) : (
              <div className="staff-ticket-grid">
                {supportTickets.map((ticket) => (
                  <article className="support-ticket-card" key={ticket.id}>
                    <h3>{ticket.subject}</h3>

                    <p>{ticket.message}</p>

                    <span className="staff-badge">
                      {ticket.customer_name || "Customer"}
                    </span>
                    <span className="staff-badge">
                      {ticket.customer_email}
                    </span>
                    <span className="staff-badge">{ticket.status}</span>
                    <span className="staff-badge">
                      {new Date(ticket.created_at).toLocaleString()}
                    </span>

                    {ticket.staff_reply && (
                      <div className="staff-reply-box">
                        <strong>Current Reply:</strong>
                        <p>{ticket.staff_reply}</p>
                      </div>
                    )}

                    <div className="staff-ticket-reply">
                      <textarea
                        placeholder="Write reply to customer..."
                        value={
                          replyForm.ticketId === ticket.id
                            ? replyForm.reply
                            : ""
                        }
                        onChange={(e) =>
                          handleReplyChange(ticket.id, e.target.value)
                        }
                      />

                      <button
                        onClick={() => sendReply(ticket.id)}
                        disabled={loading}
                      >
                        Send Reply
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "Customer Messages" && (
          <section className="staff-list-card">
            <h2>Customer Messages</h2>

            {supportTickets.length === 0 ? (
              <div className="staff-empty">No customer messages yet.</div>
            ) : (
              <div className="staff-message-grid">
                {supportTickets.map((ticket) => (
                  <article className="customer-message-card" key={ticket.id}>
                    <h3>{ticket.subject}</h3>
                    <p>{ticket.message}</p>
                    <span className="staff-badge">
                      {ticket.customer_email}
                    </span>
                    <span className="staff-badge">{ticket.status}</span>

                    <button
                      onClick={() =>
                        sendCustomerEmail({
                          full_name: ticket.customer_name,
                          email: ticket.customer_email,
                        })
                      }
                    >
                      Reply by Email
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "Orders Tracking" && (
          <section className="staff-list-card">
            <h2>Orders Tracking</h2>

            {orders.length === 0 ? (
              <div className="staff-empty">
                No orders found yet. Admin controls approval tracking.
              </div>
            ) : (
              <div className="staff-order-grid">
                {orders.map((order) => (
                  <article className="staff-order-card" key={order.id}>
                    <h3>{order.order_number}</h3>
                    <p>
                      {order.customer?.full_name} · {order.customer?.email}
                    </p>

                    <span className="staff-badge">₹{order.total}</span>
                    <span className="staff-badge">
                      {order.order_status || "Pending"}
                    </span>
                    <span className="staff-badge">
                      {order.payment_status || "pending"}
                    </span>

                    <p>
                      Staff can view order progress here. Admin approves fixed
                      steps from Admin Portal.
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "Customers" && (
          <section className="staff-list-card">
            <h2>Customers</h2>

            {customers.length === 0 ? (
              <div className="staff-empty">
                No customer records found. Signup customers will show here.
              </div>
            ) : (
              <div className="staff-customer-grid">
                {customers.map((customer) => (
                  <article className="customer-card" key={customer.id}>
                    <h3>{customer.full_name || customer.name}</h3>

                    <p>{customer.email}</p>
                    <p>{customer.phone || customer.mobile}</p>

                    <span className="staff-badge">
                      Age {customer.age || "N/A"}
                    </span>
                    <span className="staff-badge">
                      DOB {customer.dob || "N/A"}
                    </span>
                    <span className="staff-badge">
                      {customer.status || "active"}
                    </span>

                    <div className="staff-card-actions">
                      <button onClick={() => sendCustomerEmail(customer)}>
                        Send Email
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "Marketing Tasks" && (
          <>
            <section className="staff-form-card">
              <h2>Create Marketing Task</h2>

              <form className="staff-form" onSubmit={createMarketingTask}>
                <div className="staff-form-grid">
                  <input
                    name="title"
                    value={marketingForm.title}
                    onChange={handleMarketingChange}
                    placeholder="Task title"
                  />

                  <select
                    name="platform"
                    value={marketingForm.platform}
                    onChange={handleMarketingChange}
                  >
                    <option>Instagram</option>
                    <option>Facebook</option>
                    <option>WhatsApp</option>
                    <option>Email</option>
                    <option>Website Banner</option>
                  </select>

                  <select
                    name="priority"
                    value={marketingForm.priority}
                    onChange={handleMarketingChange}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>

                  <input
                    type="date"
                    name="deadline"
                    value={marketingForm.deadline}
                    onChange={handleMarketingChange}
                  />

                  <select
                    name="status"
                    value={marketingForm.status}
                    onChange={handleMarketingChange}
                  >
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </div>

                <textarea
                  name="notes"
                  value={marketingForm.notes}
                  onChange={handleMarketingChange}
                  placeholder="Task notes"
                />

                <button type="submit">Create Task</button>
              </form>
            </section>

            <section className="staff-list-card">
              <h2>Marketing Tasks</h2>

              {marketingTasks.length === 0 ? (
                <div className="staff-empty">No marketing tasks yet.</div>
              ) : (
                <div className="staff-task-grid">
                  {marketingTasks.map((task) => (
                    <article className="task-card" key={task.id}>
                      <h3>{task.title}</h3>
                      <p>{task.notes}</p>

                      <span className="staff-badge">{task.platform}</span>
                      <span className="staff-badge">{task.priority}</span>
                      <span className="staff-badge">{task.status}</span>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === "Influencers" && (
          <>
            <section className="staff-form-card">
              <h2>Add Influencer Campaign</h2>

              <form className="staff-form" onSubmit={createInfluencer}>
                <div className="staff-form-grid">
                  <input
                    name="name"
                    value={influencerForm.name}
                    onChange={handleInfluencerChange}
                    placeholder="Influencer name"
                  />

                  <input
                    name="instagram_id"
                    value={influencerForm.instagram_id}
                    onChange={handleInfluencerChange}
                    placeholder="Instagram ID"
                  />

                  <input
                    name="email"
                    value={influencerForm.email}
                    onChange={handleInfluencerChange}
                    placeholder="Email"
                  />

                  <input
                    name="products"
                    value={influencerForm.products}
                    onChange={handleInfluencerChange}
                    placeholder="Products promoted"
                  />

                  <input
                    type="date"
                    name="campaign_date"
                    value={influencerForm.campaign_date}
                    onChange={handleInfluencerChange}
                  />

                  <input
                    type="number"
                    name="budget"
                    value={influencerForm.budget}
                    onChange={handleInfluencerChange}
                    placeholder="Budget"
                  />

                  <select
                    name="status"
                    value={influencerForm.status}
                    onChange={handleInfluencerChange}
                  >
                    <option>Planned</option>
                    <option>Contacted</option>
                    <option>Confirmed</option>
                    <option>Paid</option>
                    <option>Completed</option>
                  </select>
                </div>

                <textarea
                  name="notes"
                  value={influencerForm.notes}
                  onChange={handleInfluencerChange}
                  placeholder="Campaign notes"
                />

                <button type="submit">Add Influencer</button>
              </form>
            </section>

            <section className="staff-list-card">
              <h2>Influencer Campaigns</h2>

              {influencers.length === 0 ? (
                <div className="staff-empty">No influencer campaigns yet.</div>
              ) : (
                <div className="staff-influencer-grid">
                  {influencers.map((influencer) => (
                    <article className="influencer-card" key={influencer.id}>
                      <h3>{influencer.name}</h3>
                      <p>{influencer.notes}</p>

                      <span className="staff-badge">
                        @{influencer.instagram_id}
                      </span>
                      <span className="staff-badge">
                        ₹{influencer.budget || 0}
                      </span>
                      <span className="staff-badge">{influencer.status}</span>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === "Social Media" && (
          <>
            <section className="staff-form-card">
              <h2>Social Banner / Post Task</h2>

              <form className="staff-form" onSubmit={createSocialPost}>
                <div className="staff-form-grid">
                  <select
                    name="platform"
                    value={socialForm.platform}
                    onChange={handleSocialChange}
                  >
                    <option>Instagram</option>
                    <option>Facebook</option>
                    <option>WhatsApp</option>
                    <option>Website Banner</option>
                  </select>

                  <input
                    name="banner_title"
                    value={socialForm.banner_title}
                    onChange={handleSocialChange}
                    placeholder="Banner title"
                  />

                  <input
                    name="banner_url"
                    value={socialForm.banner_url}
                    onChange={handleSocialChange}
                    placeholder="Banner image URL"
                  />

                  <input
                    type="date"
                    name="schedule_date"
                    value={socialForm.schedule_date}
                    onChange={handleSocialChange}
                  />

                  <select
                    name="status"
                    value={socialForm.status}
                    onChange={handleSocialChange}
                  >
                    <option>Draft</option>
                    <option>Scheduled</option>
                    <option>Posted</option>
                  </select>
                </div>

                <textarea
                  name="caption"
                  value={socialForm.caption}
                  onChange={handleSocialChange}
                  placeholder="Caption"
                />

                <button type="submit">Save Social Task</button>
              </form>
            </section>

            <section className="staff-list-card">
              <h2>Social Media Tasks</h2>

              {socialPosts.length === 0 ? (
                <div className="staff-empty">No social media tasks yet.</div>
              ) : (
                <div className="staff-social-grid">
                  {socialPosts.map((post) => (
                    <article className="social-card" key={post.id}>
                      {post.banner_url && (
                        <img src={post.banner_url} alt={post.banner_title} />
                      )}

                      <h3>{post.banner_title}</h3>
                      <p>{post.caption}</p>

                      <span className="staff-badge">{post.platform}</span>
                      <span className="staff-badge">{post.status}</span>
                      <span className="staff-badge">
                        {post.schedule_date || "No date"}
                      </span>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </section>
    </main>
  );
}