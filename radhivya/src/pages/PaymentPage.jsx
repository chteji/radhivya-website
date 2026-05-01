import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "./PaymentPage.css";

const API_URL = "http://127.0.0.1:5000";

function readPendingOrder() {
  try {
    return JSON.parse(localStorage.getItem("radhivyaPendingOrder") || "null");
  } catch {
    return null;
  }
}

function readOrders() {
  try {
    return JSON.parse(localStorage.getItem("radhivyaOrders") || "[]");
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem("radhivyaOrders", JSON.stringify(orders));
}

async function sendOrderEmail(order) {
  try {
    const response = await fetch(`${API_URL}/api/order-email/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-role": "customer",
      },
      body: JSON.stringify({
        order,
        customer_email:
          order.customer?.email ||
          order.customer_email ||
          localStorage.getItem("customerEmail") ||
          "",
      }),
    });

    const data = await response.json();

    if (!data.success) {
      console.error("Order email backend error:", data);
      alert("Payment successful, but invoice email was not sent: " + data.message);
      return false;
    }

    console.log("Order email sent:", data);
    return true;
  } catch (error) {
    console.error("Order email fetch failed:", error);
    alert("Payment successful, but invoice email failed: " + error.message);
    return false;
  }
}

export default function PaymentPage() {
  const navigate = useNavigate();

  const pendingOrder = readPendingOrder();

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");

  const [cardForm, setCardForm] = useState({
    card_name: "",
    card_number: "",
    expiry: "",
    cvv: "",
    upi_id: "",
  });

  const orderItems = Array.isArray(pendingOrder?.items)
    ? pendingOrder.items
    : [];

  const total = Number(pendingOrder?.total || 0);

  const itemCount = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
  }, [orderItems]);

  function handleChange(e) {
    const { name, value } = e.target;

    setCardForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function validatePayment() {
    if (!pendingOrder) return "No pending order found.";

    if (paymentMethod === "card") {
      if (!cardForm.card_name.trim()) return "Card holder name is required.";
      if (!cardForm.card_number.trim()) return "Card number is required.";
      if (!cardForm.expiry.trim()) return "Expiry is required.";
      if (!cardForm.cvv.trim()) return "CVV is required.";
    }

    if (paymentMethod === "upi") {
      if (!cardForm.upi_id.trim()) return "UPI ID is required.";
    }

    return "";
  }

  function buildConfirmedOrder() {
    const now = new Date().toISOString();

    const tracking = Array.isArray(pendingOrder.tracking)
      ? pendingOrder.tracking.map((step) => {
          if (step.key === "order_placed") {
            return {
              ...step,
              completed: true,
            };
          }

          return step;
        })
      : [];

    return {
      ...pendingOrder,
      updated_at: now,
      payment_status: "paid",
      order_status: "Order Placed",
      payment_method: paymentMethod,
      payment_reference: `PAY-${Date.now()}`,
      tracking,
    };
  }

  async function completePayment(e) {
    e.preventDefault();

    const validationError = validatePayment();

    if (validationError) {
      setMessage(validationError);
      return;
    }

    try {
      setProcessing(true);
      setMessage("Processing payment...");

      await new Promise((resolve) => setTimeout(resolve, 900));

      const confirmedOrder = buildConfirmedOrder();

      const allOrders = readOrders();
      saveOrders([confirmedOrder, ...allOrders]);

      localStorage.setItem("radhivyaInvoice", JSON.stringify(confirmedOrder));
      localStorage.setItem("radhivyaLastOrder", JSON.stringify(confirmedOrder));

      localStorage.removeItem("radhivyaPendingOrder");
      localStorage.removeItem("radhivyaCart");
      localStorage.removeItem("radhivya_cart");

      setMessage("Payment successful. Sending invoice email...");

      await sendOrderEmail(confirmedOrder);

      setMessage("Order confirmed successfully.");

      setTimeout(() => {
        navigate("/invoice");
      }, 700);
    } catch (error) {
      setMessage(error.message || "Payment failed.");
    } finally {
      setProcessing(false);
    }
  }

  if (!pendingOrder) {
    return (
      <>
        <Header />

        <main className="payment-page">
          <section className="payment-empty">
            <h1>No pending payment</h1>
            <p>
              There is no order waiting for payment. Please add products to cart
              and checkout first.
            </p>
            <button onClick={() => navigate("/products")}>Shop Products</button>
          </section>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="payment-page">
        <section className="payment-shell">
          <div className="payment-header">
            <span>Secure Payment</span>
            <h1>Complete your payment</h1>
            <p>
              This test payment confirms your Radhivya order and automatically
              sends the invoice to your email.
            </p>
          </div>

          <form className="payment-layout" onSubmit={completePayment}>
            <section className="payment-card">
              <h2>Payment Method</h2>

              <div className="payment-method-grid">
                <button
                  type="button"
                  className={paymentMethod === "card" ? "active" : ""}
                  onClick={() => setPaymentMethod("card")}
                >
                  Card
                </button>

                <button
                  type="button"
                  className={paymentMethod === "upi" ? "active" : ""}
                  onClick={() => setPaymentMethod("upi")}
                >
                  UPI
                </button>

                <button
                  type="button"
                  className={paymentMethod === "cod" ? "active" : ""}
                  onClick={() => setPaymentMethod("cod")}
                >
                  Cash on Delivery
                </button>
              </div>

              {paymentMethod === "card" && (
                <div className="payment-form-grid">
                  <label>
                    Card Holder Name *
                    <input
                      name="card_name"
                      value={cardForm.card_name}
                      onChange={handleChange}
                      placeholder="Name on card"
                    />
                  </label>

                  <label>
                    Card Number *
                    <input
                      name="card_number"
                      value={cardForm.card_number}
                      onChange={handleChange}
                      placeholder="4242 4242 4242 4242"
                    />
                  </label>

                  <label>
                    Expiry *
                    <input
                      name="expiry"
                      value={cardForm.expiry}
                      onChange={handleChange}
                      placeholder="MM/YY"
                    />
                  </label>

                  <label>
                    CVV *
                    <input
                      name="cvv"
                      value={cardForm.cvv}
                      onChange={handleChange}
                      placeholder="123"
                    />
                  </label>
                </div>
              )}

              {paymentMethod === "upi" && (
                <div className="payment-form-grid single">
                  <label>
                    UPI ID *
                    <input
                      name="upi_id"
                      value={cardForm.upi_id}
                      onChange={handleChange}
                      placeholder="yourname@upi"
                    />
                  </label>
                </div>
              )}

              {paymentMethod === "cod" && (
                <div className="cod-box">
                  <h3>Cash on Delivery</h3>
                  <p>
                    Your order will be confirmed now. Payment will be collected
                    when the product is delivered.
                  </p>
                </div>
              )}

              {message && <div className="payment-message">{message}</div>}

              <button type="submit" disabled={processing}>
                {processing
                  ? "Processing..."
                  : paymentMethod === "cod"
                  ? "Confirm COD Order"
                  : `Pay ₹${total}`}
              </button>
            </section>

            <aside className="payment-card payment-summary">
              <h2>Order Summary</h2>

              <div className="payment-order-box">
                <span>Order Number</span>
                <strong>{pendingOrder.order_number}</strong>
              </div>

              <div className="payment-order-box">
                <span>Customer</span>
                <strong>{pendingOrder.customer?.full_name}</strong>
                <small>{pendingOrder.customer?.email}</small>
              </div>

              <div className="payment-items">
                {orderItems.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="payment-item">
                    <strong>{item.name}</strong>
                    <span>
                      Qty {item.quantity || 1} · ₹{item.price}
                    </span>
                  </div>
                ))}
              </div>

              <div className="payment-total-box">
                <div>
                  <span>Items</span>
                  <strong>{itemCount}</strong>
                </div>

                <div>
                  <span>Subtotal</span>
                  <strong>₹{pendingOrder.subtotal}</strong>
                </div>

                <div>
                  <span>Shipping</span>
                  <strong>₹{pendingOrder.shipping}</strong>
                </div>

                <div>
                  <span>Discount</span>
                  <strong>-₹{pendingOrder.discount}</strong>
                </div>

                <div className="payment-grand-total">
                  <span>Total</span>
                  <strong>₹{pendingOrder.total}</strong>
                </div>
              </div>
            </aside>
          </form>
        </section>
      </main>

      <Footer />
    </>
  );
}