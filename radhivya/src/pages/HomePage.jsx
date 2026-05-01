import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "./HomePage.css";

const categories = [
  {
    title: "Cleansers",
    text: "Gentle daily cleansing for a fresh, glowing start.",
    link: "/products?category=Cleanser%2FFacewash",
  },
  {
    title: "Serums",
    text: "Targeted glow care for hydration, brightness, and smooth skin.",
    link: "/products?category=Serum",
  },
  {
    title: "Moisturizers",
    text: "Soft, rich hydration for everyday skin comfort.",
    link: "/products?category=Moisturizers",
  },
  {
    title: "Face Masks",
    text: "Premium self-care rituals for relaxing skincare moments.",
    link: "/products?category=Face%20Mask",
  },
];

const rituals = [
  "Cleanse gently",
  "Apply active serum",
  "Lock hydration",
  "Protect and glow",
];

export default function HomePage() {
  return (
    <>
      <Header />

      <main className="home-page">
        <section className="home-hero-section">
          <div className="home-hero-content">
            <span className="home-eyebrow">Premium Indian Skincare</span>

            <h1>Glow like luxury feels.</h1>

            <p>
              Radhivya is designed for customers who want skincare that feels
              premium, trusted, elegant, and easy to use every day.
            </p>

            <div className="home-hero-actions">
              <Link to="/products">Shop Collection</Link>
              <Link to="/new-arrivals" className="secondary">
                New Arrivals
              </Link>
            </div>

            <div className="home-hero-stats">
              <div>
                <strong>100%</strong>
                <span>Premium feel</span>
              </div>

              <div>
                <strong>11+</strong>
                <span>Skincare categories</span>
              </div>

              <div>
                <strong>7 Days</strong>
                <span>Delivery tracking</span>
              </div>
            </div>
          </div>

          <div className="home-hero-visual">
            <div className="home-product-orbit orbit-one">💄</div>
            <div className="home-product-orbit orbit-two">🧴</div>
            <div className="home-product-orbit orbit-three">✨</div>

            <div className="home-luxury-bottle">
              <div className="bottle-cap"></div>
              <div className="bottle-body">
                <span>R</span>
                <p>Radhivya</p>
              </div>
            </div>
          </div>
        </section>

        <section className="home-section">
          <div className="home-section-head">
            <span>Shop By Ritual</span>
            <h2>Skincare categories made simple</h2>
            <p>
              Customers can explore products by need, routine, or beauty goal.
            </p>
          </div>

          <div className="home-category-grid">
            {categories.map((category) => (
              <Link
                to={category.link}
                className="home-category-card"
                key={category.title}
              >
                <span>{category.title}</span>
                <h3>{category.title}</h3>
                <p>{category.text}</p>
                <strong>Explore →</strong>
              </Link>
            ))}
          </div>
        </section>

        <section className="home-ritual-section">
          <div className="home-ritual-content">
            <span>Daily Glow System</span>
            <h2>Your premium skincare routine</h2>
            <p>
              Build a simple routine that looks beautiful, feels luxurious, and
              helps customers trust your brand from the first visit.
            </p>

            <Link to="/products">Start Shopping</Link>
          </div>

          <div className="home-ritual-grid">
            {rituals.map((item, index) => (
              <article key={item}>
                <strong>0{index + 1}</strong>
                <h3>{item}</h3>
                <p>
                  A clean, attractive step in the Radhivya skincare experience.
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-banner">
          <div>
            <span>Luxury Customer Experience</span>
            <h2>Premium shopping with cart, wishlist, checkout, invoice, tracking and support.</h2>
          </div>

          <Link to="/products">Shop Now</Link>
        </section>
      </main>

      <Footer />
    </>
  );
}