import { Link, NavLink } from "react-router-dom";
import "./Header.css";

const shopCategories = [
  ["Cleanser / Facewash", "/products?category=cleanser-facewash"],
  ["Serum", "/products?category=serum"],
  ["Toner", "/products?category=toner"],
  ["Moisturizers", "/products?category=moisturizers"],
  ["Face Oil", "/products?category=face-oil"],
  ["Scrub", "/products?category=scrub"],
  ["Face Mask", "/products?category=face-mask"],
  ["Eye Care", "/products?category=eye-care"],
  ["Lip Care", "/products?category=lip-care"],
  ["Body Care", "/products?category=body-care"],
  ["Hair Care", "/products?category=hair-care"],
];

export default function Header() {
  return (
    <header className="premium-header">
      <div className="premium-announcement">
        Free shipping above ₹999 • Premium skincare rituals by Radhivya
      </div>

      <nav className="premium-nav">
        <Link to="/" className="premium-brand">
          <img
            src="/logo-transparent.png"
            alt="Radhivya Logo"
            onError={(e) => {
              e.currentTarget.src = "/logo.png";
            }}
          />

          <div>
            <strong>Radhivya</strong>
            <span>Premium Skincare</span>
          </div>
        </Link>

        <div className="premium-links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About Us</NavLink>

          <div className="shop-dropdown">
            <NavLink to="/products">Shop</NavLink>

            <div className="shop-menu">
              {shopCategories.map(([label, path]) => (
                <Link key={label} to={path}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <NavLink to="/new-arrivals">New Arrivals</NavLink>
          <NavLink to="/contact">Contact Us</NavLink>
        </div>

        <div className="premium-actions">
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/cart">Cart</Link>
          <Link className="profile-pill" to="/profile">
            Profile
          </Link>
        </div>
      </nav>
    </header>
  );
}