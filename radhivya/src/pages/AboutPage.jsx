import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "./AboutPage.css";

const values = [
  "Premium skincare experience",
  "Trust-first product presentation",
  "Clean beauty-inspired design",
  "Customer support after purchase",
];

export default function AboutPage() {
  return (
    <>
      <Header />

      <main className="about-page">
        <section className="about-hero">
          <div>
            <span>About Radhivya</span>
            <h1>Luxury skincare with a soft Indian soul.</h1>
            <p>
              Radhivya is built as a premium skincare brand that feels elegant,
              trustworthy, modern, and emotionally beautiful for customers.
            </p>
          </div>

          <div className="about-hero-card">
            <strong>R</strong>
            <h2>Radhivya</h2>
            <p>Glow. Care. Ritual. Confidence.</p>
          </div>
        </section>

        <section className="about-story">
          <div className="about-story-card dark">
            <span>Our Story</span>
            <h2>Made for customers who want beauty with trust.</h2>
            <p>
              Radhivya focuses on creating a premium online shopping experience.
              The brand should feel clean, luxurious, warm, and reliable from
              homepage to checkout, invoice, tracking, and support.
            </p>
          </div>

          <div className="about-story-grid">
            {values.map((value, index) => (
              <article className="about-card" key={value}>
                <strong>0{index + 1}</strong>
                <h3>{value}</h3>
                <p>
                  A premium customer-focused value that improves brand trust and
                  shopping confidence.
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-luxury">
          <div>
            <span>Brand Feeling</span>
            <h2>Not only products — a complete skincare experience.</h2>
            <p>
              The website includes customer accounts, wishlist, cart, checkout,
              invoice, order tracking, support inbox, and admin/staff systems so
              the business feels real and professional.
            </p>
          </div>

          <div className="about-beauty-stack">
            <div>💄</div>
            <div>🧴</div>
            <div>✨</div>
            <div>🌸</div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}