import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "./InvoicePage.css";

function readInvoice() {
  try {
    return (
      JSON.parse(localStorage.getItem("radhivyaInvoice") || "null") ||
      JSON.parse(localStorage.getItem("radhivyaLastOrder") || "null")
    );
  } catch {
    return null;
  }
}

function getItems(order) {
  return Array.isArray(order?.items) ? order.items : [];
}

export default function InvoicePage() {
  const order = readInvoice();
  const items = getItems(order);

  function printInvoice() {
    window.print();
  }

  if (!order) {
    return (
      <>
        <Header />

        <main className="invoice-page">
          <section className="invoice-empty">
            <h2>No invoice found</h2>
            <p>
              Place an order first. After order confirmation, your invoice will appear here.
            </p>
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

      <main className="invoice-page">
        <section className="invoice-container">
          <div className="invoice-actions">
            <Link to="/profile">Back to Profile</Link>
            <button onClick={printInvoice}>Print / Save PDF</button>
          </div>

          <article className="invoice-card">
            <div className="invoice-top">
              <div className="invoice-brand">
                <img
                  src="/logo-transparent.png"
                  alt="Radhivya"
                  onError={(e) => {
                    e.currentTarget.src = "/logo.png";
                  }}
                />

                <div>
                  <h1>Radhivya</h1>
                  <p>Premium Indian Skincare</p>
                </div>
              </div>

              <div className="invoice-meta">
                <h2>Invoice</h2>
                <p>Order: {order.order_number}</p>
                <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="invoice-body">
              <div className="invoice-grid">
                <div className="invoice-box">
                  <h3>Bill To</h3>
                  <p>{order.customer?.full_name}</p>
                  <p>{order.customer?.email}</p>
                  <p>{order.customer?.phone}</p>
                  <p>{order.customer?.address}</p>
                  <p>
                    {order.customer?.city}, {order.customer?.state}{" "}
                    {order.customer?.pincode}
                  </p>
                </div>

                <div className="invoice-box">
                  <h3>Order Details</h3>
                  <p>Payment: {order.payment_status}</p>
                  <p>Order: {order.order_status}</p>
                  <p>Coupon: {order.coupon_code || "No coupon"}</p>
                  <p>Delivery Estimate: Within 7 days</p>
                </div>
              </div>

              <div className="invoice-table-wrap">
                <table className="invoice-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((item, index) => {
                      const qty = Number(item.quantity || 1);
                      const price = Number(item.price || 0);

                      return (
                        <tr key={`${item.id}-${index}`}>
                          <td>
                            <strong>{item.name}</strong>
                          </td>
                          <td>{qty}</td>
                          <td>₹{price}</td>
                          <td>₹{price * qty}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="invoice-total-box">
                <div className="invoice-total-row">
                  <span>Subtotal</span>
                  <strong>₹{order.subtotal || 0}</strong>
                </div>

                <div className="invoice-total-row">
                  <span>Shipping</span>
                  <strong>₹{order.shipping || 0}</strong>
                </div>

                <div className="invoice-total-row">
                  <span>Discount</span>
                  <strong>-₹{order.discount || 0}</strong>
                </div>

                <div className="invoice-total-row invoice-grand">
                  <span>Grand Total</span>
                  <strong>₹{order.total || 0}</strong>
                </div>
              </div>

              <div className="invoice-footer-note">
                Thank you for shopping with Radhivya. Your invoice is generated after successful order confirmation.
              </div>
            </div>
          </article>
        </section>
      </main>

      <Footer />
    </>
  );
}