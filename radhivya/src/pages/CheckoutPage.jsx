import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Toast from "../components/Toast.jsx";
import {
  createTrackingTimeline,
  saveInvoice,
} from "../utils/orderWorkflow.js";
import "./CheckoutPage.css";

const API_URL = "http://localhost:5000";

function readCartItems() {
  const keys = ["radhivya_cart", "radhivyaCart", "cart", "cartItems"];

  for (const key of keys) {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (Array.isArray(data)) return data;
    } catch {
      // ignore
    }
  }

  return [];
}

function clearCartItems() {
  ["radhivya_cart", "radhivyaCart", "cart", "cartItems"].forEach((key) => {
    localStorage.removeItem(key);
  });
}

function getProductImage(product) {
  const mainImage = product.product_images?.find((img) => img.is_main);
  const firstImage = product.product_images?.[0];

  return (
    product.image_url ||
    mainImage?.image_url ||
    firstImage?.image_url ||
    product.image ||
    "/logo-transparent.png"
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();

  const [cartItems] = useState(readCartItems());
  const [toast, setToast] = useState("");

  const [customer, setCustomer] = useState({
    full_name: localStorage.getItem("userName") || "",
    email: localStorage.getItem("customerEmail") || "",
    phone: localStorage.getItem("customerPhone") || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    note: "",
  });

  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2800);
  }

  function handleCustomerChange(e) {
    const { name, value } = e.target;

    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const quantity = Number(item.quantity || 1);
      const price = Number(item.price || 0);
      return sum + price * quantity;
    }, 0);
  }, [cartItems]);

  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 99;

  const discount = useMemo(() => {
    if (!coupon) return 0;
    return Number(coupon.dbDiscount || 0);
  }, [coupon]);

  const total = Math.max(subtotal + shipping - discount, 0);

  async function applyCoupon() {
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      setCoupon(null);
      setCouponMessage("Please enter a coupon code.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/business/coupons/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          subtotal,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Invalid coupon.");
      }

      setCoupon({
        code: data.coupon.code,
        type: data.coupon.discount_type,
        value: Number(data.coupon.discount_value || 0),
        maxDiscount: Number(data.coupon.max_discount || 0),
        dbDiscount: Number(data.discount || 0),
      });

      setCouponMessage(data.message || "Coupon applied successfully.");
    } catch (error) {
      setCoupon(null);
      setCouponMessage(error.message);
    }
  }

  function createOrder(paymentStatus) {
    const now = new Date();
    const orderNumber = `RAD-${Date.now()}`;

    const order = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      order_number: orderNumber,
      customer,
      items: cartItems,
      subtotal,
      shipping,
      discount,
      coupon_code: coupon?.code || "",
      total,
      payment_status: paymentStatus,
      order_status: "Order Placed",
      created_at: now.toISOString(),
      tracking: createTrackingTimeline(now, customer.city),
    };

    const oldOrders = JSON.parse(localStorage.getItem("radhivyaOrders") || "[]");
    const updatedOrders = [order, ...oldOrders];

    localStorage.setItem("radhivyaOrders", JSON.stringify(updatedOrders));
    saveInvoice(order);

    return order;
  }

  async function sendOrderEmail(order) {
    try {
      setSendingEmail(true);

      const response = await fetch(
        `${API_URL}/api/order-email/send-order-confirmation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ order }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        console.error("Email failed:", data);
        showToast(data.message || data.error || "Order saved, but email failed.");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Email sending failed:", error);
      showToast("Order saved, but email failed. Check backend email settings.");
      return false;
    } finally {
      setSendingEmail(false);
    }
  }

  function validateCustomer() {
    if (!customer.full_name.trim()) return "Full name is required.";
    if (!customer.email.trim()) return "Email is required.";
    if (!customer.phone.trim()) return "Phone number is required.";
    if (!customer.address.trim()) return "Address is required.";
    if (!customer.city.trim()) return "City is required.";
    if (!customer.state.trim()) return "State is required.";
    if (!customer.pincode.trim()) return "Pincode is required.";
    return "";
  }

  async function proceedToPayment(e) {
    e.preventDefault();

    if (cartItems.length === 0) {
      showToast("Your cart is empty.");
      return;
    }

    const validationError = validateCustomer();

    if (validationError) {
      showToast(validationError);
      return;
    }

    localStorage.setItem("userName", customer.full_name);
    localStorage.setItem("customerEmail", customer.email);
    localStorage.setItem("customerPhone", customer.phone);

    if (total === 0) {
      const order = createOrder("not_required");

      await sendOrderEmail(order);

      clearCartItems();

      showToast("Order confirmed. Invoice generated.");

      setTimeout(() => {
        navigate("/invoice");
      }, 900);

      return;
    }

    const checkoutData = {
      customer,
      items: cartItems,
      subtotal,
      shipping,
      discount,
      coupon_code: coupon?.code || "",
      total,
      created_at: new Date().toISOString(),
    };

    localStorage.setItem("radhivyaCheckout", JSON.stringify(checkoutData));

    showToast("Opening payment page...");

    setTimeout(() => {
      navigate("/payment");
    }, 700);
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Header />

        <main className="checkout-page">
          <section className="checkout-empty">
            <h2>Your cart is empty</h2>
            <p>Add products to your cart before checkout.</p>
            <Link to="/products">Shop Products</Link>
          </section>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Toast message={toast} />

      <main className="checkout-page">
        <section className="checkout-container">
          <div className="checkout-header">
            <span>Secure Checkout</span>
            <h1>Complete your order</h1>
            <p>
              Enter customer details, apply an admin-created coupon, review your
              order, and continue to payment.
            </p>
          </div>

          <div className="checkout-layout">
            <section className="checkout-form-card">
              <h2>Customer Details</h2>

              <form className="checkout-form" onSubmit={proceedToPayment}>
                <div className="checkout-grid">
                  <label>
                    Full Name *
                    <input
                      name="full_name"
                      value={customer.full_name}
                      onChange={handleCustomerChange}
                      placeholder="Enter full name"
                    />
                  </label>

                  <label>
                    Email *
                    <input
                      name="email"
                      type="email"
                      value={customer.email}
                      onChange={handleCustomerChange}
                      placeholder="Enter email"
                    />
                  </label>

                  <label>
                    Phone *
                    <input
                      name="phone"
                      value={customer.phone}
                      onChange={handleCustomerChange}
                      placeholder="Enter phone number"
                    />
                  </label>

                  <label>
                    Pincode *
                    <input
                      name="pincode"
                      value={customer.pincode}
                      onChange={handleCustomerChange}
                      placeholder="Enter pincode"
                    />
                  </label>

                  <label>
                    City *
                    <input
                      name="city"
                      value={customer.city}
                      onChange={handleCustomerChange}
                      placeholder="Enter city"
                    />
                  </label>

                  <label>
                    State *
                    <input
                      name="state"
                      value={customer.state}
                      onChange={handleCustomerChange}
                      placeholder="Enter state"
                    />
                  </label>
                </div>

                <label>
                  Full Address *
                  <textarea
                    name="address"
                    value={customer.address}
                    onChange={handleCustomerChange}
                    placeholder="House number, street, area, landmark"
                  />
                </label>

                <label>
                  Order Note
                  <textarea
                    name="note"
                    value={customer.note}
                    onChange={handleCustomerChange}
                    placeholder="Any delivery note?"
                  />
                </label>

                <div className="coupon-box">
                  <div>
                    <h3>Coupon Code</h3>
                    <p>Only coupons created by admin will work here.</p>
                  </div>

                  <div className="coupon-row">
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter admin coupon code"
                    />

                    <button type="button" onClick={applyCoupon}>
                      Apply
                    </button>
                  </div>

                  {couponMessage && (
                    <p className="coupon-message">{couponMessage}</p>
                  )}
                </div>

                <button
                  className="checkout-main-btn"
                  type="submit"
                  disabled={sendingEmail}
                >
                  {sendingEmail
                    ? "Confirming..."
                    : total === 0
                    ? "Confirm Free Order"
                    : "Proceed to Payment"}
                </button>
              </form>
            </section>

            <aside className="checkout-summary-card">
              <h2>Order Summary</h2>

              <div className="checkout-items">
                {cartItems.map((item) => (
                  <article className="checkout-item" key={item.id}>
                    <img src={getProductImage(item)} alt={item.name} />

                    <div>
                      <h3>{item.name}</h3>
                      <p>Qty: {item.quantity || 1}</p>
                    </div>

                    <strong>
                      ₹{Number(item.price || 0) * Number(item.quantity || 1)}
                    </strong>
                  </article>
                ))}
              </div>

              <div className="checkout-summary-row">
                <span>Subtotal</span>
                <strong>₹{subtotal}</strong>
              </div>

              <div className="checkout-summary-row">
                <span>Shipping</span>
                <strong>{shipping === 0 ? "Free" : `₹${shipping}`}</strong>
              </div>

              <div className="checkout-summary-row">
                <span>Coupon</span>
                <strong>{coupon?.code || "Not applied"}</strong>
              </div>

              <div className="checkout-summary-row">
                <span>Discount</span>
                <strong>-₹{discount}</strong>
              </div>

              <div className="checkout-summary-row checkout-total">
                <span>Total</span>
                <strong>₹{total}</strong>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}