import { useEffect, useMemo, useState } from "react";
import "./AdminPortalPage.css";
import { approveTrackingStage, getNextPendingStage, normalizeTracking, saveOrders } from "../utils/orderWorkflow.js";

const API_URL = "http://localhost:5000";

const emptyProductForm = {
  name: "",
  slug: "",
  short_description: "",
  description: "",
  price: "",
  old_price: "",
  category: "",
  category_slug: "",
  stock: "",
  status: "active",
  skin_type: "",
  ingredients: "",
  how_to_use: "",
  brand: "Radhivya",
  sku: "",
  is_featured: false,
  is_bestseller: false,
  is_new_arrival: false,
  is_available: true,
  image_url: "",
};

const emptyCouponForm = {
  code: "",
  title: "",
  description: "",
  discount_type: "fixed",
  discount_value: "",
  max_discount: "",
  min_order_value: "",
  usage_limit: "100",
  start_date: "",
  end_date: "",
  status: true,
};

const emptyStaffForm = {
  full_name: "",
  email: "",
  password: "",
  phone: "",
  role: "staff",
  department: "Support",
  status: "active",
};

const emptyTrackingForm = {
  order_number: "",
  status: "Order Confirmed",
  location: "",
  tracking_date: "",
  tracking_time: "",
  note: "",
};

const emptySettingsForm = {
  store_name: "Radhivya",
  support_email: "support@radhivya.com",
  support_phone: "",
  free_shipping_limit: "999",
  announcement:
    "Free shipping above ₹999 • Premium skincare rituals by Radhivya",
};

const tabs = [
  "Dashboard",
  "Products",
  "Orders",
  "Payments",
  "Customers",
  "Coupons",
  "Staff",
  "Settings",
];

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function getProductImage(product) {
  const mainImage = product.product_images?.find((img) => img.is_main);
  const firstImage = product.product_images?.[0];

  return (
    product.image_url ||
    mainImage?.image_url ||
    firstImage?.image_url ||
    "/logo-transparent.png"
  );
}

function getLocalOrders() {
  try {
    return JSON.parse(localStorage.getItem("radhivyaOrders") || "[]");
  } catch {
    return [];
  }
}

function getAdminName() {
  return localStorage.getItem("adminName") || "Radhivya Admin";
}

export default function AdminPortalPage() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState(getLocalOrders());
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [staff, setStaff] = useState([]);

  const [productForm, setProductForm] = useState(emptyProductForm);
  const [couponForm, setCouponForm] = useState(emptyCouponForm);
  const [staffForm, setStaffForm] = useState(emptyStaffForm);
  const [trackingForm, setTrackingForm] = useState(emptyTrackingForm);
  const [settingsForm, setSettingsForm] = useState(emptySettingsForm);

  const [productImages, setProductImages] = useState(Array(10).fill(""));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const isAdminLoggedIn = localStorage.getItem("userRole") === "admin";

  useEffect(() => {
    loadAllData();
  }, []);

  function showMessage(type, text) {
    setMessage({ type, text });

    setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, 4500);
  }

  async function loadAllData() {
    setLoading(true);

    await Promise.allSettled([
      loadProducts(),
      loadCustomers(),
      loadCoupons(),
      loadStaff(),
      loadPayments(),
    ]);

    setOrders(getLocalOrders());
    setLoading(false);
  }

  async function loadProducts() {
    try {
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();

      if (data.success) {
        setProducts(safeArray(data.products));
      }
    } catch (error) {
      console.error("Products load error:", error);
    }
  }

  async function loadCustomers() {
    try {
      const response = await fetch(`${API_URL}/api/business/customers`, {
        headers: {
          "x-user-role": "admin",
        },
      });

      const data = await response.json();

      if (data.success) {
        setCustomers(safeArray(data.customers));
      }
    } catch (error) {
      console.error("Customers load error:", error);
    }
  }

  async function loadCoupons() {
    try {
      const response = await fetch(`${API_URL}/api/business/coupons`, {
        headers: {
          "x-user-role": "admin",
        },
      });

      const data = await response.json();

      if (data.success) {
        setCoupons(safeArray(data.coupons));
      }
    } catch (error) {
      console.error("Coupons load error:", error);
    }
  }

  async function loadStaff() {
    try {
      const response = await fetch(`${API_URL}/api/staff`, {
        headers: {
          "x-user-role": "admin",
        },
      });

      const data = await response.json();

      if (data.success) {
        setStaff(safeArray(data.staff || data.staff_accounts || data.users));
      }
    } catch (error) {
      console.error("Staff load error:", error);
    }
  }

  async function loadPayments() {
    try {
      const response = await fetch(`${API_URL}/api/payments`, {
        headers: {
          "x-user-role": "admin",
        },
      });

      const data = await response.json();

      if (data.success) {
        setPayments(safeArray(data.payments));
      }
    } catch (error) {
      console.error("Payments load error:", error);
    }
  }

  function handleProductChange(e) {
    const { name, value, type, checked } = e.target;

    setProductForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleCouponChange(e) {
    const { name, value, type, checked } = e.target;

    setCouponForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleStaffChange(e) {
    const { name, value } = e.target;

    setStaffForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleTrackingChange(e) {
    const { name, value } = e.target;

    setTrackingForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSettingsChange(e) {
    const { name, value } = e.target;

    setSettingsForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleImageChange(index, value) {
    setProductImages((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  }

  async function createProduct(e) {
    e.preventDefault();

    try {
      setLoading(true);

      const galleryImages = productImages
        .filter((url) => url.trim())
        .map((url, index) => ({
          image_url: url.trim(),
          alt_text: productForm.name,
          is_main: index === 0,
          sort_order: index + 1,
        }));

      const response = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "admin",
        },
        body: JSON.stringify({
          ...productForm,
          price: Number(productForm.price || 0),
          old_price: productForm.old_price
            ? Number(productForm.old_price)
            : null,
          stock: Number(productForm.stock || 0),
          image_url: galleryImages[0]?.image_url || productForm.image_url || "",
          gallery_images: galleryImages,
          product_images: galleryImages,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || data.error || "Failed to create product.");
      }

      showMessage("success", "Product added successfully.");
      setProductForm(emptyProductForm);
      setProductImages(Array(10).fill(""));
      await loadProducts();
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function createCoupon(e) {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        code: couponForm.code.trim().toUpperCase(),
        title: couponForm.title.trim(),
        description: couponForm.description || "",
        discount_type: couponForm.discount_type,
        discount_value: Number(couponForm.discount_value || 0),
        max_discount: Number(couponForm.max_discount || 0),
        min_order_value: Number(couponForm.min_order_value || 0),
        usage_limit: Number(couponForm.usage_limit || 100),
        status: couponForm.status ? "active" : "inactive",
        start_date: couponForm.start_date || null,
        end_date: couponForm.end_date || null,
        created_by: getAdminName(),
      };

      const response = await fetch(`${API_URL}/api/business/coupons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "admin",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.success) {
        console.error("Coupon create failed:", data);
        throw new Error(
          data.error ||
            data.message ||
            data.details ||
            data.hint ||
            "Failed to create coupon."
        );
      }

      showMessage("success", "Coupon saved successfully.");
      setCouponForm(emptyCouponForm);
      await loadCoupons();
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function createStaff(e) {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/staff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "admin",
        },
        body: JSON.stringify(staffForm),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || data.error || "Failed to create staff.");
      }

      showMessage("success", "Staff account created successfully.");
      setStaffForm(emptyStaffForm);
      await loadStaff();
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function addTrackingUpdate(e) {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/business/tracking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "admin",
        },
        body: JSON.stringify({
          ...trackingForm,
          updated_by: getAdminName(),
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message || data.error || "Failed to add tracking update."
        );
      }

      const updatedOrders = orders.map((order) => {
        if (order.order_number !== trackingForm.order_number) return order;

        const newTracking = {
          status: trackingForm.status,
          location: trackingForm.location,
          date:
            trackingForm.tracking_date ||
            new Date().toLocaleDateString(),
          time:
            trackingForm.tracking_time ||
            new Date().toLocaleTimeString(),
          note: trackingForm.note,
          completed: true,
        };

        return {
          ...order,
          order_status: trackingForm.status,
          tracking: [...safeArray(order.tracking), newTracking],
        };
      });

      setOrders(updatedOrders);
      localStorage.setItem("radhivyaOrders", JSON.stringify(updatedOrders));

      showMessage("success", "Tracking update added successfully.");
      setTrackingForm(emptyTrackingForm);
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  }

  function saveSettings(e) {
    e.preventDefault();
    localStorage.setItem("radhivyaSettings", JSON.stringify(settingsForm));
    showMessage("success", "Settings saved successfully.");
  }

  function logoutAdmin() {
    localStorage.removeItem("userRole");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminEmail");
    window.location.href = "/admin-login";
  }

  const dashboardStats = useMemo(() => {
    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );

    return {
      products: products.length,
      orders: orders.length,
      customers: customers.length,
      revenue: totalRevenue,
      coupons: coupons.length,
      staff: staff.length,
    };
  }, [products, orders, customers, coupons, staff]);

  if (!isAdminLoggedIn) {
    return (
      <main className="admin-login-required">
        <div>
          <h1>Admin Login Required</h1>
          <p>Please login as admin to access this portal.</p>
          <a href="/admin-login">Go to Admin Login</a>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img
            src="/logo-transparent.png"
            alt="Radhivya"
            onError={(e) => {
              e.currentTarget.src = "/logo.png";
            }}
          />

          <div>
            <h2>Radhivya</h2>
            <p>Admin Control</p>
          </div>
        </div>

        <nav className="admin-nav">
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

        <button className="logout-btn" onClick={logoutAdmin}>
          Logout Admin
        </button>
      </aside>

      <section className="admin-content">
        <div className="admin-topbar">
          <div>
            <span className="admin-eyebrow">Luxury Store Management</span>
            <h1>Admin Portal</h1>
            <p>
              Control products, orders, payments, customers, coupons, staff,
              tracking, and settings.
            </p>
          </div>

          <button onClick={loadAllData} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {message.text && (
          <div
            className={`admin-message ${
              message.type === "success" ? "admin-success" : "admin-error"
            }`}
          >
            {message.text}
          </div>
        )}

        {activeTab === "Dashboard" && (
          <>
            <section className="admin-dashboard-grid">
              <div className="admin-stat-card">
                <span>Total Products</span>
                <strong>{dashboardStats.products}</strong>
                <p>Products in your catalog.</p>
              </div>

              <div className="admin-stat-card">
                <span>Total Orders</span>
                <strong>{dashboardStats.orders}</strong>
                <p>Customer orders stored.</p>
              </div>

              <div className="admin-stat-card">
                <span>Customers</span>
                <strong>{dashboardStats.customers}</strong>
                <p>Registered customers.</p>
              </div>

              <div className="admin-stat-card">
                <span>Revenue</span>
                <strong>₹{dashboardStats.revenue}</strong>
                <p>Total order value.</p>
              </div>

              <div className="admin-stat-card">
                <span>Coupons</span>
                <strong>{dashboardStats.coupons}</strong>
                <p>Admin-created offers.</p>
              </div>

              <div className="admin-stat-card">
                <span>Staff</span>
                <strong>{dashboardStats.staff}</strong>
                <p>Staff accounts.</p>
              </div>
            </section>

            <section className="admin-panel-card admin-dashboard-highlight">
              <div>
                <span className="admin-eyebrow">Today Focus</span>
                <h2>Luxury operations overview</h2>
                <p>
                  Manage every important business action from here: add products,
                  create coupon campaigns, update delivery tracking, monitor
                  customer records, and control staff access.
                </p>
              </div>

              <div className="admin-action-grid">
                <button onClick={() => setActiveTab("Products")}>
                  Add Product
                </button>
                <button onClick={() => setActiveTab("Coupons")}>
                  Create Coupon
                </button>
                <button onClick={() => setActiveTab("Orders")}>
                  Update Tracking
                </button>
                <button onClick={() => setActiveTab("Staff")}>
                  Create Staff
                </button>
              </div>
            </section>
          </>
        )}

        {activeTab === "Products" && (
          <>
            <section className="admin-form-card">
              <h2>Add Product</h2>

              <form className="admin-form" onSubmit={createProduct}>
                <div className="admin-form-grid">
                  <input
                    name="name"
                    value={productForm.name}
                    onChange={handleProductChange}
                    placeholder="Product name"
                  />

                  <input
                    name="slug"
                    value={productForm.slug}
                    onChange={handleProductChange}
                    placeholder="Slug"
                  />

                  <input
                    name="sku"
                    value={productForm.sku}
                    onChange={handleProductChange}
                    placeholder="SKU"
                  />

                  <input
                    name="price"
                    type="number"
                    value={productForm.price}
                    onChange={handleProductChange}
                    placeholder="Price"
                  />

                  <input
                    name="old_price"
                    type="number"
                    value={productForm.old_price}
                    onChange={handleProductChange}
                    placeholder="Old price"
                  />

                  <input
                    name="stock"
                    type="number"
                    value={productForm.stock}
                    onChange={handleProductChange}
                    placeholder="Stock"
                  />

                  <input
                    name="category"
                    value={productForm.category}
                    onChange={handleProductChange}
                    placeholder="Category"
                  />

                  <input
                    name="category_slug"
                    value={productForm.category_slug}
                    onChange={handleProductChange}
                    placeholder="Category slug"
                  />

                  <input
                    name="skin_type"
                    value={productForm.skin_type}
                    onChange={handleProductChange}
                    placeholder="Skin type"
                  />
                </div>

                <textarea
                  name="short_description"
                  value={productForm.short_description}
                  onChange={handleProductChange}
                  placeholder="Short description"
                />

                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleProductChange}
                  placeholder="Full product description"
                />

                <textarea
                  name="ingredients"
                  value={productForm.ingredients}
                  onChange={handleProductChange}
                  placeholder="Ingredients"
                />

                <textarea
                  name="how_to_use"
                  value={productForm.how_to_use}
                  onChange={handleProductChange}
                  placeholder="How to use"
                />

                <div className="admin-checkbox-row">
                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={productForm.is_featured}
                      onChange={handleProductChange}
                    />
                    Featured
                  </label>

                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      name="is_bestseller"
                      checked={productForm.is_bestseller}
                      onChange={handleProductChange}
                    />
                    Bestseller
                  </label>

                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      name="is_new_arrival"
                      checked={productForm.is_new_arrival}
                      onChange={handleProductChange}
                    />
                    New Arrival
                  </label>

                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      name="is_available"
                      checked={productForm.is_available}
                      onChange={handleProductChange}
                    />
                    Available
                  </label>
                </div>

                <div className="admin-image-section">
                  <h3>Product Images</h3>
                  <p>Add up to 10 product image URLs. First image becomes main image.</p>

                  <div className="image-upload-grid">
                    {productImages.map((image, index) => (
                      <div className="image-upload-box" key={index}>
                        <label>Image {index + 1}</label>
                        <input
                          value={image}
                          onChange={(e) =>
                            handleImageChange(index, e.target.value)
                          }
                          placeholder="Image URL"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <button className="save-product-btn" type="submit">
                  Add Product
                </button>
              </form>
            </section>

            <section className="admin-list-card">
              <h2>Products</h2>

              {products.length === 0 ? (
                <div className="admin-empty">No products found.</div>
              ) : (
                <div className="admin-product-grid">
                  {products.map((product) => (
                    <article className="admin-product-row" key={product.id}>
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        onError={(e) => {
                          e.currentTarget.src = "/logo-transparent.png";
                        }}
                      />

                      <div>
                        <h3>{product.name}</h3>
                        <p>{product.short_description || product.description}</p>

                        <span className="admin-badge">
                          ₹{Number(product.price || 0)}
                        </span>
                        <span className="admin-badge">
                          Stock {product.stock || 0}
                        </span>
                        <span className="admin-badge">
                          {product.category || "Skincare"}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === "Orders" && (
          <>
            <section className="admin-form-card">
              <h2>Update Order Tracking</h2>

              <form className="admin-form" onSubmit={addTrackingUpdate}>
                <div className="admin-form-grid">
                  <input
                    name="order_number"
                    value={trackingForm.order_number}
                    onChange={handleTrackingChange}
                    placeholder="Order number, e.g. RAD-123"
                  />

                  <select
                    name="status"
                    value={trackingForm.status}
                    onChange={handleTrackingChange}
                  >
                    <option>Order Confirmed</option>
                    <option>Packed</option>
                    <option>Shipped</option>
                    <option>Out for Delivery</option>
                    <option>Delivered</option>
                    <option>Delayed</option>
                    <option>Cancelled</option>
                  </select>

                  <input
                    name="location"
                    value={trackingForm.location}
                    onChange={handleTrackingChange}
                    placeholder="Location"
                  />

                  <input
                    name="tracking_date"
                    type="date"
                    value={trackingForm.tracking_date}
                    onChange={handleTrackingChange}
                  />

                  <input
                    name="tracking_time"
                    type="time"
                    value={trackingForm.tracking_time}
                    onChange={handleTrackingChange}
                  />
                </div>

                <textarea
                  name="note"
                  value={trackingForm.note}
                  onChange={handleTrackingChange}
                  placeholder="Tracking note"
                />

                <button type="submit">Add Tracking Update</button>
              </form>
            </section>

            <section className="admin-list-card">
              <h2>Orders</h2>

              {orders.length === 0 ? (
                <div className="admin-empty">
                  No local orders yet. Orders will appear after checkout.
                </div>
              ) : (
                <div className="admin-order-grid">
                  {orders.map((order) => (
                    <article className="admin-order-card" key={order.id}>
                      <h3>{order.order_number}</h3>
                      <p>
                        Customer: {order.customer?.full_name || "Customer"} ·{" "}
                        {order.customer?.email}
                      </p>

                      <span className="admin-badge">₹{order.total}</span>
                      <span className="admin-badge">
                        {order.order_status || "Pending"}
                      </span>
                      <span className="admin-badge">
                        {order.payment_status || "pending"}
                      </span>

                      <div className="admin-mini-list">
                        {safeArray(order.tracking).map((track, index) => (
                          <div key={index}>
                            <strong>{track.status}</strong>
                            <p>
                              {track.location} · {track.date} · {track.time}
                            </p>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === "Payments" && (
          <section className="admin-list-card">
            <h2>Payments</h2>

            {payments.length === 0 ? (
              <div className="admin-empty">
                No payment records found yet. Payment integration records will
                show here.
              </div>
            ) : (
              <div className="admin-payment-grid">
                {payments.map((payment) => (
                  <article className="admin-payment-card" key={payment.id}>
                    <h3>{payment.payment_id || payment.id}</h3>
                    <p>{payment.customer_email || "No customer email"}</p>
                    <span className="admin-badge">₹{payment.amount}</span>
                    <span className="admin-badge">
                      {payment.status || "pending"}
                    </span>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "Customers" && (
          <section className="admin-list-card">
            <h2>Customers</h2>

            {customers.length === 0 ? (
              <div className="admin-empty">
                No customers found. Signup customers will appear here.
              </div>
            ) : (
              <div className="admin-customer-grid">
                {customers.map((customer) => (
                  <article className="admin-customer-card" key={customer.id}>
                    <h3>{customer.full_name || customer.name}</h3>

                    <p>{customer.email}</p>
                    <p>{customer.phone || customer.mobile}</p>

                    <span className="admin-badge">
                      Age {customer.age || "N/A"}
                    </span>
                    <span className="admin-badge">
                      DOB {customer.dob || "N/A"}
                    </span>
                    <span className="admin-badge">
                      {customer.status || "active"}
                    </span>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "Coupons" && (
          <>
            <section className="admin-form-card">
              <h2>Add Coupon</h2>

              <form className="admin-form" onSubmit={createCoupon}>
                <div className="admin-form-grid">
                  <input
                    name="code"
                    value={couponForm.code}
                    onChange={handleCouponChange}
                    placeholder="Coupon code, e.g. WELCOME10"
                  />

                  <input
                    name="title"
                    value={couponForm.title}
                    onChange={handleCouponChange}
                    placeholder="Coupon title"
                  />

                  <select
                    name="discount_type"
                    value={couponForm.discount_type}
                    onChange={handleCouponChange}
                  >
                    <option value="fixed">Fixed Amount</option>
                    <option value="percentage">Percentage</option>
                  </select>

                  <input
                    name="discount_value"
                    type="number"
                    value={couponForm.discount_value}
                    onChange={handleCouponChange}
                    placeholder="Discount value"
                  />

                  <input
                    name="min_order_value"
                    type="number"
                    value={couponForm.min_order_value}
                    onChange={handleCouponChange}
                    placeholder="Minimum order"
                  />

                  <input
                    name="max_discount"
                    type="number"
                    value={couponForm.max_discount}
                    onChange={handleCouponChange}
                    placeholder="Max discount"
                  />

                  <input
                    name="usage_limit"
                    type="number"
                    value={couponForm.usage_limit}
                    onChange={handleCouponChange}
                    placeholder="Usage limit"
                  />

                  <input
                    name="start_date"
                    type="date"
                    value={couponForm.start_date}
                    onChange={handleCouponChange}
                  />

                  <input
                    name="end_date"
                    type="date"
                    value={couponForm.end_date}
                    onChange={handleCouponChange}
                  />
                </div>

                <textarea
                  name="description"
                  value={couponForm.description}
                  onChange={handleCouponChange}
                  placeholder="Coupon description"
                />

                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    name="status"
                    checked={couponForm.status}
                    onChange={handleCouponChange}
                  />
                  Active Coupon
                </label>

                <button type="submit">Add Coupon</button>
              </form>
            </section>

            <section className="admin-list-card">
              <h2>Coupons</h2>

              {coupons.length === 0 ? (
                <div className="admin-empty">No coupons created yet.</div>
              ) : (
                <div className="admin-coupon-grid">
                  {coupons.map((coupon) => (
                    <article className="admin-coupon-card" key={coupon.id}>
                      <h3>{coupon.code}</h3>
                      <p>{coupon.title}</p>
                      <p>{coupon.description}</p>

                      <span className="admin-badge">
                        {coupon.discount_type}
                      </span>
                      <span className="admin-badge">
                        {coupon.discount_value}
                        {coupon.discount_type === "percentage" ? "%" : "₹"}
                      </span>
                      <span className="admin-badge">
                        {coupon.status}
                      </span>
                      <span className="admin-badge">
                        Used {coupon.used_count || 0}/{coupon.usage_limit || 0}
                      </span>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === "Staff" && (
          <>
            <section className="admin-form-card">
              <h2>Create Staff Login</h2>

              <form className="admin-form" onSubmit={createStaff}>
                <div className="admin-form-grid">
                  <input
                    name="full_name"
                    value={staffForm.full_name}
                    onChange={handleStaffChange}
                    placeholder="Staff name"
                  />

                  <input
                    name="email"
                    type="email"
                    value={staffForm.email}
                    onChange={handleStaffChange}
                    placeholder="Staff email"
                  />

                  <input
                    name="password"
                    type="password"
                    value={staffForm.password}
                    onChange={handleStaffChange}
                    placeholder="Password"
                  />

                  <input
                    name="phone"
                    value={staffForm.phone}
                    onChange={handleStaffChange}
                    placeholder="Phone"
                  />

                  <select
                    name="department"
                    value={staffForm.department}
                    onChange={handleStaffChange}
                  >
                    <option>Support</option>
                    <option>Marketing</option>
                    <option>Orders</option>
                    <option>Social Media</option>
                  </select>

                  <select
                    name="status"
                    value={staffForm.status}
                    onChange={handleStaffChange}
                  >
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                <button type="submit">Create Staff Account</button>
              </form>
            </section>

            <section className="admin-list-card">
              <h2>Staff Accounts</h2>

              {staff.length === 0 ? (
                <div className="admin-empty">
                  No staff accounts found. Create staff from above.
                </div>
              ) : (
                <div className="admin-staff-grid">
                  {staff.map((person) => (
                    <article className="admin-staff-card" key={person.id}>
                      <h3>{person.full_name || person.name}</h3>
                      <p>{person.email}</p>

                      <span className="admin-badge">
                        {person.department || "Support"}
                      </span>
                      <span className="admin-badge">
                        {person.status || "active"}
                      </span>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === "Settings" && (
          <section className="admin-settings-card">
            <h2>Store Settings</h2>

            <form className="admin-form" onSubmit={saveSettings}>
              <div className="admin-form-grid">
                <input
                  name="store_name"
                  value={settingsForm.store_name}
                  onChange={handleSettingsChange}
                  placeholder="Store name"
                />

                <input
                  name="support_email"
                  value={settingsForm.support_email}
                  onChange={handleSettingsChange}
                  placeholder="Support email"
                />

                <input
                  name="support_phone"
                  value={settingsForm.support_phone}
                  onChange={handleSettingsChange}
                  placeholder="Support phone"
                />

                <input
                  name="free_shipping_limit"
                  value={settingsForm.free_shipping_limit}
                  onChange={handleSettingsChange}
                  placeholder="Free shipping limit"
                />
              </div>

              <textarea
                name="announcement"
                value={settingsForm.announcement}
                onChange={handleSettingsChange}
                placeholder="Top announcement text"
              />

              <button type="submit">Save Settings</button>
            </form>
          </section>
        )}
      </section>
    </main>
  );
}