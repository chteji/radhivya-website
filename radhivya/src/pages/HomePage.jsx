import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "./HomePage.css";

const categories = [
  ["🧴", "Cleansers", "Daily gentle cleansing", "/products?category=cleanser-facewash"],
  ["✨", "Serums", "Targeted glow care", "/products?category=serum"],
  ["💧", "Moisturizers", "Deep hydration", "/products?category=moisturizers"],
  ["☀️", "Sunscreens", "Daily protection", "/products?category=sunscreen"],
  ["🌿", "Face Oils", "Luxury nourishment", "/products?category=face-oil"],
  ["🫧", "Body Care", "Complete self-care", "/products?category=body-care"],
];

export default function HomePage() {
  return (
    <>
      <Header />

      <main className="home-page">
        <section className="home-hero-section">
          <div className="home-hero-inner">
            <div className="home-hero-content">
              <span className="home-eyebrow">Premium Indian Skincare</span>

              <h1>
                Radiance <br />
                Rooted <br />
                in Nature
              </h1>

              <p>
                Radhivya blends botanical care with modern skincare rituals.
                Discover clean, elegant, and thoughtfully crafted products for
                healthy glowing skin.
              </p>

              <div className="home-hero-buttons">
                <Link to="/products">Shop Products</Link>
                <Link to="/new-arrivals">View New Arrivals</Link>
              </div>
            </div>

            <div className="home-hero-visual">
              <div className="home-logo-stage">
                <div className="home-main-orb"></div>

                <img
                  src="/logo-transparent.png"
                  alt="Radhivya"
                  onError={(e) => {
                    e.currentTarget.src = "/logo.png";
                  }}
                />

                <div className="home-floating-card card-one">
                  <strong>Clean Glow</strong>
                  <span>Botanical skincare</span>
                </div>

                <div className="home-floating-card card-two">
                  <strong>Premium Care</strong>
                  <span>Luxury daily rituals</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="home-section">
          <div className="home-section-head">
            <span>Shop by Ritual</span>
            <h2>Choose your skincare category</h2>
            <p>
              Explore products by your daily beauty routine and skin needs.
            </p>
          </div>

          <div className="home-category-grid">
            {categories.map(([icon, title, text, path]) => (
              <Link to={path} className="home-category-card" key={title}>
                <div className="home-category-icon">{icon}</div>
                <h3>{title}</h3>
                <p>{text}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="home-story-section">
          <div className="home-story-card">
            <span>Brand Story</span>
            <h2>Luxury skincare made simple, graceful, and trustworthy.</h2>
            <p>
              Radhivya is designed as a premium skincare experience where every
              product feels elegant, clean, and easy to understand. From product
              discovery to checkout, the experience is built to feel smooth,
              modern, and reliable.
            </p>
            <Link to="/about">Learn More</Link>
          </div>

          <div className="home-story-visual">
            <div className="story-luxury-orb"></div>
            <div className="story-small-card">
              <strong>Natural care</strong>
              <p>Inspired by gentle daily rituals.</p>
            </div>
          </div>
        </section>

        <section className="home-section">
          <div className="home-section-head">
            <span>Daily Rituals</span>
            <h2>Build your glow routine</h2>
            <p>
              A premium skincare journey built around cleansing, nourishing,
              protecting, and glowing.
            </p>
          </div>

          <div className="home-ritual-grid">
            <article>
              <h3>Morning Radiance</h3>
              <p>Cleanse, hydrate, and protect your skin for the day.</p>
            </article>

            <article>
              <h3>Evening Repair</h3>
              <p>Calm, restore, and nourish your skin after a long day.</p>
            </article>

            <article>
              <h3>Glow Boost</h3>
              <p>Add serums and oils for a bright, premium skincare finish.</p>
            </article>
          </div>
        </section>

        <section className="home-final-cta">
          <h2>Ready to discover your next skincare favourite?</h2>
          <p>
            Explore Radhivya products and create a clean, premium skincare
            routine that fits your everyday lifestyle.
          </p>

          <div>
            <Link to="/products">Start Shopping</Link>
            <Link to="/contact">Ask Support</Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}