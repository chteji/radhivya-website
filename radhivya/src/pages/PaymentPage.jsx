import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Toast from "../components/Toast.jsx";
import { useState } from "react";
import {
  createTrackingTimeline,
  saveInvoice,
} from "../utils/orderWorkflow.js";
import "./PaymentPage.css";

const API_URL = "http://localhost:5000";

function clearCartItems() {
  ["radhivya_cart", "radhivyaCart", "cart", "cartItems"].forEach((key) => {
    localStorage.removeItem(key);
  });
}

function readCheckout() {
  try {
    return JSON.parse(localStorage.getItem("radhivyaCheckout") || "null");
  } catch {
    return null;
  }
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const checkout = readCheckout();

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2800);
  }

  async function sendOrderEmail(order) {
    const response = await fetch(`${API_URL}/api/order-email/send-order-confirmation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ order }),
    });

    const data = await response.json();

    if (!data.success) {
      console.error("Email failed:", data);
      throw new Error(data.message || data.error || "Email sending failed.");
    }

    return data;
  }

  async function confirmPayment() {
    if (!checkout) {
      showToast("No checkout data found.");
      return;
    }

    try {
      setLoading(true);

      const now = new Date();
      const orderNumber = `RAD-${Date.now()}`;

      const order = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        order_number: orderNumber,
        customer: checkout.customer,
        items: checkout.items || [],
        subtotal: checkout.subtotal || 0,
        shipping: checkout.shipping || 0,
        discount: checkout.discount || 0,
        coupon_code: checkout.coupon_code || "",
        total: checkout.total || 0,
        payment_status: "paid",
        order_status: "Order Placed",
        created_at: now.toISOString(),
        tracking: createTrackingTimeline(now, checkout.customer?.city),
      };

      const oldOrders = JSON.parse(localStorage.getItem("radhivyaOrders") || "[]");
      const updatedOrders = [order, ...oldOrders];

      localStorage.setItem("radhivyaOrders", JSON.stringify(updatedOrders));
      saveInvoice(order);

      try {
        await sendOrderEmail(order);
        showToast("Payment successful. Invoice email sent.");
      } catch (emailError) {
        showToast("Payment successful. Invoice generated, but email failed.");
      }

      clearCartItems();
      localStorage.removeItem("radhivyaCheckout");

      setTimeout(() => {
        navigate("/invoice");
      }, 1000);
    } catch (error) {
      showToast(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (!checkout) {
    return (
      <>
        <Header />

        <main className="payment-page">
          <section className="payment-container">
            <div className="payment-card">
              <h2>No payment data found</h2>
              <p className="payment-note">
                Please go back to checkout and place your order again.
              </p>

              <div className="payment-actions">
                <Link className="payment-back-btn" to="/checkout">
                  Back to Checkout
                </Link>
              </div>
            </div>
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

      <main className="payment-page">
        <section className="payment-container">
          <div className="payment-hero">
            <span>Secure Payment</span>
            <h1>Complete payment</h1>
            <p>
              Confirm the payment to complete your Radhivya order. After success,
              invoice will be generated and sent to customer email.
            </p>
          </div>

          <div className="payment-card">
            <h2>Payment Summary</h2>

            <div className="payment-summary">
              <div className="payment-row">
                <span>Customer</span>
                <strong>{checkout.customer?.full_name}</strong>
              </div>

              <div className="payment-row">
                <span>Email</span>
                <strong>{checkout.customer?.email}</strong>
              </div>

              <div className="payment-row">
                <span>Subtotal</span>
                <strong>₹{checkout.subtotal}</strong>
              </div>

              <div className="payment-row">
                <span>Shipping</span>
                <strong>₹{checkout.shipping}</strong>
              </div>

              <div className="payment-row">
                <span>Discount</span>
                <strong>-₹{checkout.discount}</strong>
              </div>

              <div className="payment-row payment-total">
                <span>Total Payable</span>
                <strong>₹{checkout.total}</strong>
              </div>
            </div>

            <div className="payment-actions">
              <button className="pay-now-btn" onClick={confirmPayment} disabled={loading}>
                {loading ? "Processing..." : "Pay & Confirm Order"}
              </button>

              <Link className="payment-back-btn" to="/checkout">
                Back to Checkout
              </Link>
            </div>

            <div className="payment-note">
              This is test payment. Later Razorpay can be connected here, and email will only send after Razorpay success.
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}