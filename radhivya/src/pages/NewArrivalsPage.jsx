import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Premium3DBackground from "../components/Premium3DBackground.jsx";
import "./NewArrivalsPage.css";

const API_URL = "http://localhost:5000";

const arrivalCategories = [
  ["✨", "Glow Serums", "/products?category=serum"],
  ["💧", "Hydration Care", "/products?category=moisturizers"],
  ["🌿", "Face Oils", "/products?category=face-oil"],
  ["🫧", "Cleansing Rituals", "/products?category=cleanser-facewash"],
];

export default function NewArrivalsPage() {
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNewArrivals();
  }, []);

  async function loadNewArrivals() {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();

      if (data.success) {
        const newest = [...data.products]
          .filter((product) => product.is_new_arrival || product.is_featured)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 8);

        if (newest.length > 0) {
          setNewProducts(newest);
        } else {
          setNewProducts(
            [...data.products]
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .slice(0, 8)
          );
        }
      }
    } catch (error) {
      console.error("Failed to load new arrivals:", error);
    } finally {
      setLoading(false);
    }
  }

  function getProductImage(product) {
    const mainImage = product.product_images?.find((img) => img.is_main);
    const firstImage = product.product_images?.[0];

    return (
      product.image_url ||
      mainImage?.image_url ||
      firstImage?.image_url ||
      "/logo-transparent.png"
    );
  }

  return (
    <>
      <Premium3DBackground />
      <Header />

      <main className="premium-arrivals-page">
        <section className="arrivals-hero">
          <div>
            <span>Freshly Added</span>
            <h1>
              New arrivals for <br /> your next glow ritual.
            </h1>
            <p>
              Discover the latest Radhivya skincare additions. Fresh launches,
              elegant formulas, and premium product drops curated for your
              everyday self-care ritual.
            </p>

            <div className="arrival-hero-actions">
              <Link to="/products">Shop All Products</Link>
              <Link to="/contact">Ask Support</Link>
            </div>
          </div>

          <div className="arrival-hero-stage">
            <div className="arrival-main-orb"></div>
            <img src="/logo-transparent.png" alt="Radhivya New Arrivals" />
            <div className="arrival-note top">New Drop</div>
            <div className="arrival-note bottom">Premium Glow</div>
          </div>
        </section>

        <section className="arrival-products-section">
          <div className="arrival-section-head">
            <span>Latest Collection</span>
            <h2>Recently added products</h2>
            <p>
              New products from the admin catalog appear here automatically.
            </p>
          </div>

          {loading && <div className="arrival-state">Loading new arrivals...</div>}

          {!loading && newProducts.length === 0 && (
            <div className="arrival-state">No new arrivals yet.</div>
          )}

          {!loading && newProducts.length > 0 && (
            <div className="arrival-premium-grid">
              {newProducts.map((product) => (
                <Link
                  className="arrival-premium-card"
                  to={`/product/${product.id}`}
                  key={product.id}
                >
                  <span className="arrival-badge">New Arrival</span>

                  <div className="arrival-img">
                    <img src={getProductImage(product)} alt={product.name} />
                  </div>

                  <div className="arrival-card-body">
                    <small>{product.category || "Skincare"}</small>
                    <h3>{product.name}</h3>
                    <p>
                      {product.short_description ||
                        product.description ||
                        "Premium skincare product by Radhivya."}
                    </p>

                    <div>
                      <strong>₹{Number(product.price).toFixed(0)}</strong>
                      {product.old_price && (
                        <del>₹{Number(product.old_price).toFixed(0)}</del>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="arrival-rituals">
          <div className="arrival-section-head center">
            <span>Explore by Ritual</span>
            <h2>Shop newness by category</h2>
          </div>

          <div className="arrival-category-grid">
            {arrivalCategories.map(([icon, title, path]) => (
              <Link to={path} className="arrival-category-card" key={title}>
                <div>{icon}</div>
                <h3>{title}</h3>
                <p>
                  Explore new skincare additions selected for this beauty ritual.
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="arrival-luxury-band">
          <h2>Fresh launches. Premium rituals. Clean glow.</h2>
          <p>
            Use this page for monthly launches, influencer campaigns, seasonal
            drops, and new product promotions.
          </p>
          <Link to="/products">Explore Full Catalog</Link>
        </section>
      </main>

      <Footer />
    </>
  );
}