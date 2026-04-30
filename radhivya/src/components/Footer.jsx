import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="premium-footer">
      <div className="footer-orb footer-orb-one"></div>
      <div className="footer-orb footer-orb-two"></div>

      <div className="premium-footer-inner">
        <div className="footer-brand-block">
          <img src="/logo-transparent.png" alt="Radhivya Logo" />
          <h2>Radhivya</h2>
          <p>
            Premium Indian skincare crafted for glowing rituals, clean beauty,
            and elegant self-care.
          </p>
        </div>

        <div className="footer-links">
          <h3>Shop</h3>
          <Link to="/products">All Products</Link>
          <Link to="/new-arrivals">New Arrivals</Link>
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/cart">Cart</Link>
        </div>

        <div className="footer-links">
          <h3>Company</h3>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/profile">My Profile</Link>
          <Link to="/login">Customer Login</Link>
        </div>

        <div className="footer-newsletter">
          <h3>Glow Letter</h3>
          <p>Get skincare drops, offers, and launch news.</p>
          <div>
            <input placeholder="Enter your email" />
            <button>Join</button>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Radhivya. All rights reserved.</span>
        <span>Designed for premium skincare commerce.</span>
      </div>
    </footer>
  );
}