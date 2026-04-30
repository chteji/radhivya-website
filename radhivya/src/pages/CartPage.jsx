import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import {
  getCartItems,
  removeCartItem,
  updateCartQuantity,
} from "../utils/customerStorage.js";
import "./CartPage.css";

export default function CartPage() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    setCart(getCartItems());
  }, []);

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 99;
  const total = subtotal + shipping;

  function increase(item) {
    const updated = updateCartQuantity(item.id, item.quantity + 1);
    setCart(updated);
  }

  function decrease(item) {
    const updated = updateCartQuantity(item.id, item.quantity - 1);
    setCart(updated);
  }

  function removeItem(id) {
    const updated = removeCartItem(id);
    setCart(updated);
  }

  if (cart.length === 0) {
    return (
      <>
        <Header />

        <main className="cart-page">
          <div className="cart-container">
            <div className="empty-cart">
              <h2>Your cart is empty</h2>
              <p>Add skincare products to your cart and continue shopping.</p>
              <Link to="/products">Shop Products</Link>
            </div>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="cart-page">
        <div className="cart-container">
          <section className="cart-header">
            <div>
              <h1>Your Cart</h1>
              <p>Review your selected Radhivya products before checkout.</p>
            </div>

            <Link to="/products">Continue Shopping</Link>
          </section>

          <section className="cart-layout">
            <div className="cart-card">
              <div className="cart-items">
                {cart.map((item) => (
                  <article className="cart-item" key={item.id}>
                    <div className="cart-item-img">
                      <img src={item.image} alt={item.name} />
                    </div>

                    <div className="cart-item-info">
                      <h3>{item.name}</h3>
                      <p>Stock available: {item.stock}</p>

                      <div className="quantity-controls">
                        <button onClick={() => decrease(item)}>-</button>
                        <strong>{item.quantity}</strong>
                        <button onClick={() => increase(item)}>+</button>
                      </div>
                    </div>

                    <div className="cart-price-box">
                      <strong>₹{item.price * item.quantity}</strong>
                      <br />
                      <button
                        className="remove-btn"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <aside className="summary-card">
              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Subtotal</span>
                <strong>₹{subtotal}</strong>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <strong>{shipping === 0 ? "Free" : `₹${shipping}`}</strong>
              </div>

              <div className="summary-row summary-total">
                <span>Total</span>
                <strong>₹{total}</strong>
              </div>

              <Link className="checkout-btn" to="/checkout">
                Proceed to Checkout
              </Link>
            </aside>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}