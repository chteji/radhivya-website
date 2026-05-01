import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "./NewArrivalsPage.css";

const API_URL = "http://localhost:5000";

const fallbackArrivals = [
  {
    id: "new-1",
    name: "Luxe Glow Face Oil",
    price: 1199,
    category: "Face Oil",
    short_description: "A rich glow oil for premium night rituals.",
    image_url: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=800",
  },
  {
    id: "new-2",
    name: "Gold Dew Toner",
    price: 799,
    category: "Toner",
    short_description: "Fresh hydration with a soft luxury feel.",
    image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800",
  },
  {
    id: "new-3",
    name: "Silk Repair Lip Care",
    price: 499,
    category: "Lip Care",
    short_description: "Smooth lip ritual for everyday softness.",
    image_url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800",
  },
];

function getProductImage(product) {
  const mainImage = product.product_images?.find((img) => img.is_main);
  const firstImage = product.product_images?.[0];

  return (
    product.image_url ||
    mainImage?.image_url ||
    firstImage?.image_url ||
    product.image ||
    "/logo-transparent.png"
  );
}

export default function NewArrivalsPage() {
  const [arrivals, setArrivals] = useState([]);

  useEffect(() => {
    loadArrivals();
  }, []);

  async function loadArrivals() {
    try {
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();

      if (data.success && Array.isArray(data.products)) {
        const newProducts = data.products.filter(
          (product) => product.is_new_arrival || product.status === "new"
        );

        setArrivals(newProducts.length > 0 ? newProducts : fallbackArrivals);
      } else {
        setArrivals(fallbackArrivals);
      }
    } catch {
      setArrivals(fallbackArrivals);
    }
  }

  return (
    <>
      <Header />

      <main className="premium-arrivals-page">
        <section className="arrivals-hero">
          <span>Fresh Drops</span>
          <h1>New arrivals for your next glow ritual.</h1>
          <p>
            Discover the newest Radhivya skincare picks with premium product
            presentation and luxurious customer experience.
          </p>
        </section>

        <section className="arrival-feature">
          <div>
            <span>Limited New Collection</span>
            <h2>Designed for beauty lovers who want something fresh.</h2>
            <p>
              Add new arrivals from admin and highlight fresh products here for
              customers to explore quickly.
            </p>
            <Link to="/products">Explore Shop</Link>
          </div>

          <div className="arrival-feature-visual">
            <div>💄</div>
            <div>🧴</div>
            <div>✨</div>
          </div>
        </section>

        <section className="arrival-grid">
          {arrivals.map((product) => (
            <article className="arrival-premium-card" key={product.id}>
              <Link to={`/product/${product.id}`} className="arrival-image">
                <img src={getProductImage(product)} alt={product.name} />
              </Link>

              <div className="arrival-content">
                <span>{product.category || "New Arrival"}</span>
                <h3>{product.name}</h3>
                <p>{product.short_description || product.description}</p>

                <div>
                  <strong>₹{product.price}</strong>
                  <Link to={`/product/${product.id}`}>View Product</Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>

      <Footer />
    </>
  );
}