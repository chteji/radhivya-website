import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import {
  getWishlistItems,
  removeWishlistItem,
} from "../utils/customerStorage.js";
import "./WishlistPage.css";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    setWishlist(getWishlistItems());
  }, []);

  function removeItem(id) {
    const updated = removeWishlistItem(id);
    setWishlist(updated);
  }

  if (wishlist.length === 0) {
    return (
      <>
        <Header />

        <main className="wishlist-page">
          <div className="wishlist-container">
            <div className="empty-wishlist">
              <h2>Your wishlist is empty</h2>
              <p>Save your favourite Radhivya products here.</p>
              <Link to="/products">Explore Products</Link>
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

      <main className="wishlist-page">
        <div className="wishlist-container">
          <section className="wishlist-header">
            <div>
              <h1>Your Wishlist</h1>
              <p>Products you saved for later.</p>
            </div>

            <Link to="/products">Continue Shopping</Link>
          </section>

          <section className="wishlist-grid">
            {wishlist.map((item) => (
              <article className="wishlist-card" key={item.id}>
                <div className="wishlist-img">
                  <img src={item.image} alt={item.name} />
                </div>

                <h3>{item.name}</h3>

                <p>
                  {item.short_description ||
                    "Premium skincare product by Radhivya."}
                </p>

                <div className="wishlist-price">₹{item.price}</div>

                <div className="wishlist-actions">
                  <Link className="wishlist-view" to={`/product/${item.id}`}>
                    View
                  </Link>

                  <button
                    className="wishlist-remove"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}