import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "./CheckoutPage.css";

const API_URL = "http://127.0.0.1:5000";

function getCart() {
  try {
    const cartOne = JSON.parse(localStorage.getItem("radhivyaCart") || "[]");
    const cartTwo = JSON.parse(localStorage.getItem("radhivya_cart") || "[]");

    if (Array.isArray(cartOne) && cartOne.length > 0) return cartOne;
    if (Array.isArray(cartTwo) && cartTwo.length > 0) return cartTwo;

    return [];
  } catch {
    return [];
  }
}

function getCustomerProfile() {
  try {
    return JSON.parse(localStorage.getItem("radhivyaCustomerProfile") || "null");
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

function createDefaultTracking(orderDate, city) {
  const start = new Date(orderDate);

  function addDays(days) {
    const date = new Date(start);
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  }

  return [
    {
      key: "order_placed",
      status: "Order Placed",
      note: "Your order has been placed successfully.",
      admin_note: "Order placed by customer.",
      location: city || "Online Store",
      date: addDays(0),
      time: start.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      completed: true,
    },
    {
      key: "order_confirmed",
      status: "Order Confirmed",
      note: "Admin will confirm your order soon.",
      admin_note: "",
      location: city || "Radhivya",
      date: addDays(1),
      time: "10:00",
      completed: false,
    },
    {
      key: "packed",
      status: "Packed",
      note: "Your products will be packed carefully.",
      admin_note: "",
      location: "Warehouse",
      date: addDays(2),
      time: "12:00",
      completed: false,
    },
    {
      key: "shipped",
      status: "Shipped",
      note: "Your order will be shipped after packing.",
      admin_note: "",
      location: "Courier Partner",
      date: addDays(3),
      time: "14:00",
      completed: false,
    },
    {
      key: "out_for_delivery",
      status: "Out for Delivery",
      note: "Your order will reach your delivery area.",
      admin_note: "",
      location: city || "Delivery City",
      date: addDays(6),
      time: "11:00",
      completed: false,
    },
    {
      key: "delivered",
      status: "Delivered",
      note: "Order delivery completed.",
      admin_note: "",
      location: city || "Customer Address",
      date: addDays(7),
      time: "18:00",
      completed: false,
    },
  ];
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
      alert("Order placed, but invoice email was not sent: " + data.message);
      return false;
    }

    console.log("Order email sent:", data);
    return true;
  } catch (error) {
    console.error("Order email fetch failed:", error);
    alert("Order placed, but invoice email failed: " + error.message);
    return false;
  }
}

export default function CheckoutPage() {
  const navigate = useNavigate();

  const cartItems = getCart();
  const savedCustomer = getCustomerProfile();

  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [discount, setDiscount] = useState(0);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [customerForm, setCustomerForm] = useState({
    full_name: savedCustomer?.full_name || localStorage.getItem("userName") || "",
    email: savedCustomer?.email || localStorage.getItem("customerEmail") || "",
    phone: savedCustomer?.phone || localStorage.getItem("customerPhone") || "",
    address: savedCustomer?.address || "",
    city: savedCustomer?.city || "",
    state: savedCustomer?.state || "",
    pincode: savedCustomer?.pincode || "",
    country: savedCustomer?.country || "India",
  });

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      return sum + Number(item.price || 0) * Number(item.quantity || 1);
    }, 0);
  }, [cartItems]);

  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 99;
  const total = Math.max(subtotal + shipping - discount, 0);

  function handleCustomerChange(e) {
    const { name, value } = e.target;

    setCustomerForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function applyCoupon() {
    if (!couponCode.trim()) {
      setCouponMessage("Please enter coupon code.");
      return;
    }

    try {
      setCouponMessage("Checking coupon...");

      const response = await fetch(`${API_URL}/api/business/coupons/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "customer",
        },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          order_total: subtotal + shipping,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Invalid coupon.");
      }

      const couponDiscount = Number(data.discount || data.discount_amount || 0);

      setDiscount(couponDiscount);
      setCouponMessage(`Coupon applied successfully. Discount ₹${couponDiscount}`);
    } catch (error) {
      setDiscount(0);
      setCouponMessage(error.message);
    }
  }

  function validateCheckout() {
    if (cartItems.length === 0) return "Cart is empty.";
    if (!customerForm.full_name.trim()) return "Full name is required.";
    if (!customerForm.email.trim()) return "Email is required.";
    if (!customerForm.phone.trim()) return "Phone number is required.";
    if (!customerForm.address.trim()) return "Address is required.";
    if (!customerForm.city.trim()) return "City is required.";
    if (!customerForm.state.trim()) return "State is required.";
    if (!customerForm.pincode.trim()) return "Pincode is required.";
    return "";
  }

  function createOrder(paymentStatus = "pending", orderStatus = "Order Placed") {
    const orderDate = new Date().toISOString();
    const orderNumber = `RAD-${Date.now()}`;
    const customerId = localStorage.getItem("customerId") || savedCustomer?.id || "";
    const customerEmail =
      customerForm.email || localStorage.getItem("customerEmail") || "";

    return {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now()),
      order_number: orderNumber,
      created_at: orderDate,
      updated_at: orderDate,

      customer_id: customerId,
      customer_email: customerEmail,

      customer: {
        id: customerId,
        full_name:
          customerForm.full_name || localStorage.getItem("userName") || "",
        email: customerEmail,
        phone:
          customerForm.phone || localStorage.getItem("customerPhone") || "",
        address: customerForm.address,
        city: customerForm.city,
        state: customerForm.state,
        pincode: customerForm.pincode,
        country: customerForm.country,
      },

      items: cartItems.map((item) => ({
        ...item,
        quantity: Number(item.quantity || 1),
        price: Number(item.price || 0),
      })),

      subtotal,
      shipping,
      discount,
      total,

      coupon_code: couponCode.trim().toUpperCase() || "",
      payment_status: paymentStatus,
      order_status: orderStatus,
      tracking: createDefaultTracking(orderDate, customerForm.city),
    };
  }

  async function placeOrder(e) {
    e.preventDefault();

    const validationError = validateCheckout();

    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      setPlacingOrder(true);

      const updatedProfile = {
        ...(savedCustomer || {}),
        ...customerForm,
        id: localStorage.getItem("customerId") || savedCustomer?.id || "",
      };

      localStorage.setItem(
        "radhivyaCustomerProfile",
        JSON.stringify(updatedProfile)
      );
      localStorage.setItem("userName", customerForm.full_name);
      localStorage.setItem("customerEmail", customerForm.email);
      localStorage.setItem("customerPhone", customerForm.phone);

      if (total === 0) {
        const freeOrder = createOrder("not_required", "Order Placed");

        const allOrders = readOrders();
        saveOrders([freeOrder, ...allOrders]);

        localStorage.setItem("radhivyaInvoice", JSON.stringify(freeOrder));
        localStorage.setItem("radhivyaLastOrder", JSON.stringify(freeOrder));

        localStorage.removeItem("radhivyaCart");
        localStorage.removeItem("radhivya_cart");

        await sendOrderEmail(freeOrder);

        navigate("/invoice");
        return;
      }

      const pendingOrder = createOrder("pending", "Order Placed");

      localStorage.setItem("radhivyaPendingOrder", JSON.stringify(pendingOrder));

      navigate("/payment");
    } catch (error) {
      alert(error.message || "Failed to place order.");
    } finally {
      setPlacingOrder(false);
    }
  }

  return (
    <>
      <Header />

      <main className="checkout-page">
        <section className="checkout-shell">
          <div className="checkout-header">
            <span>Secure Checkout</span>
            <h1>Complete your Radhivya order</h1>
            <p>
              Add your delivery details, apply coupon, and continue to payment.
            </p>
          </div>

          <form className="checkout-layout" onSubmit={placeOrder}>
            <section className="checkout-card">
              <h2>Customer Details</h2>

              <div className="checkout-grid">
                <label>
                  Full Name *
                  <input
                    name="full_name"
                    value={customerForm.full_name}
                    onChange={handleCustomerChange}
                    placeholder="Full name"
                  />
                </label>

                <label>
                  Email *
                  <input
                    name="email"
                    type="email"
                    value={customerForm.email}
                    onChange={handleCustomerChange}
                    placeholder="Email"
                  />
                </label>

                <label>
                  Phone *
                  <input
                    name="phone"
                    value={customerForm.phone}
                    onChange={handleCustomerChange}
                    placeholder="Phone"
                  />
                </label>

                <label>
                  City *
                  <input
                    name="city"
                    value={customerForm.city}
                    onChange={handleCustomerChange}
                    placeholder="City"
                  />
                </label>

                <label>
                  State *
                  <input
                    name="state"
                    value={customerForm.state}
                    onChange={handleCustomerChange}
                    placeholder="State"
                  />
                </label>

                <label>
                  Pincode *
                  <input
                    name="pincode"
                    value={customerForm.pincode}
                    onChange={handleCustomerChange}
                    placeholder="Pincode"
                  />
                </label>
              </div>

              <label>
                Full Address *
                <textarea
                  name="address"
                  value={customerForm.address}
                  onChange={handleCustomerChange}
                  placeholder="House number, street, area..."
                />
              </label>
            </section>

            <aside className="checkout-card checkout-summary">
              <h2>Order Summary</h2>

              <div className="checkout-items">
                {cartItems.length === 0 ? (
                  <p>Your cart is empty.</p>
                ) : (
                  cartItems.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="checkout-item">
                      <strong>{item.name}</strong>
                      <span>
                        Qty {item.quantity || 1} · ₹{item.price}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="coupon-box">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon code"
                />
                <button type="button" onClick={applyCoupon}>
                  Apply
                </button>
              </div>

              {couponMessage && (
                <p className="coupon-message">{couponMessage}</p>
              )}

              <div className="checkout-total-box">
                <div>
                  <span>Subtotal</span>
                  <strong>₹{subtotal}</strong>
                </div>

                <div>
                  <span>Shipping</span>
                  <strong>₹{shipping}</strong>
                </div>

                <div>
                  <span>Discount</span>
                  <strong>-₹{discount}</strong>
                </div>

                <div className="grand-total">
                  <span>Total</span>
                  <strong>₹{total}</strong>
                </div>
              </div>

              <button
                type="submit"
                disabled={placingOrder || cartItems.length === 0}
              >
                {placingOrder
                  ? "Placing Order..."
                  : total === 0
                  ? "Confirm Free Order"
                  : "Proceed to Payment"}
              </button>
            </aside>
          </form>
        </section>
      </main>

      <Footer />
    </>
  );
}