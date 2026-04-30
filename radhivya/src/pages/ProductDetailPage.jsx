import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Toast from "../components/Toast.jsx";
import Premium3DBackground from "../components/Premium3DBackground.jsx";
import {
  isProductInCart,
  isProductInWishlist,
  toggleProductInCart,
  toggleProductInWishlist,
} from "../utils/customerStorage.js";
import "./ProductDetailPage.css";

const API_URL = "http://localhost:5000";

export default function ProductDetailPage() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("/logo-transparent.png");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [refreshState, setRefreshState] = useState(0);

  useEffect(() => {
    loadProduct();
  }, [id]);

  async function loadProduct() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/products/${id}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to load product");
      }

      setProduct(data.product);

      const mainImage = data.product.product_images?.find((img) => img.is_main);
      const firstImage = data.product.product_images?.[0];

      setSelectedImage(
        data.product.image_url ||
          mainImage?.image_url ||
          firstImage?.image_url ||
          "/logo-transparent.png"
      );
    } catch (err) {
      setError(err.message || "Something went wrong while loading product.");
    } finally {
      setLoading(false);
    }
  }

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  }

  function handleCart() {
    const result = toggleProductInCart(product);
    setRefreshState((prev) => prev + 1);

    if (result.status === "added") {
      showToast(`${product.name} added to cart successfully!`);
    }

    if (result.status === "removed") {
      showToast(`${product.name} removed from cart.`);
    }
  }

  function handleWishlist() {
    const result = toggleProductInWishlist(product);
    setRefreshState((prev) => prev + 1);

    if (result.status === "added") {
      showToast(`${product.name} added to wishlist successfully!`);
    }

    if (result.status === "removed") {
      showToast(`${product.name} removed from wishlist.`);
    }
  }

  if (loading) {
    return (
      <>
        <Premium3DBackground />
        <Header />
        <main className="premium-detail-page">
          <div className="detail-state">Loading product details...</div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Premium3DBackground />
        <Header />
        <main className="premium-detail-page">
          <div className="detail-state error">
            <h2>Product not found</h2>
            <p>{error}</p>
            <Link to="/products">Back to Products</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const images = product.product_images || [];
  const inStock = Number(product.stock) > 0;
  const productInCart = isProductInCart(product.id);
  const productInWishlist = isProductInWishlist(product.id);

  return (
    <>
      <Premium3DBackground />
      <Header />
      <Toast message={toast} />

      <main className="premium-detail-page">
        <div className="detail-container-premium">
          <Link className="detail-back" to="/products">
            ← Back to Products
          </Link>

          <section className="premium-detail-grid">
            <div className="detail-gallery-card">
              <div className="detail-main-stage">
                <div className="detail-glow"></div>
                <img src={selectedImage} alt={product.name} />
              </div>

              {images.length > 0 && (
                <div className="premium-thumbs">
                  {images.map((img) => (
                    <button
                      key={img.id}
                      className={selectedImage === img.image_url ? "active" : ""}
                      onClick={() => setSelectedImage(img.image_url)}
                    >
                      <img src={img.image_url} alt={img.alt_text || product.name} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="premium-detail-info">
              <div className="detail-badge-row">
                {product.is_bestseller && <span>Bestseller</span>}
                {product.is_featured && <span>Featured</span>}
                {product.is_new_arrival && <span>New Arrival</span>}
                <span>{product.category || "Skincare"}</span>
              </div>

              <h1>{product.name}</h1>

              <p className="detail-lead">
                {product.short_description ||
                  "Premium skincare product by Radhivya."}
              </p>

              <div className="detail-price-premium">
                <strong>₹{Number(product.price).toFixed(0)}</strong>

                {product.old_price && (
                  <del>₹{Number(product.old_price).toFixed(0)}</del>
                )}
              </div>

              <div className={`detail-stock-pill ${!inStock ? "soldout" : ""}`}>
                {inStock ? `In Stock · ${product.stock} available` : "Sold Out"}
              </div>

              <div className="detail-action-row">
                <button
                  className={productInCart ? "remove-cart" : ""}
                  onClick={handleCart}
                  disabled={!inStock}
                >
                  {!inStock
                    ? "Sold Out"
                    : productInCart
                    ? "Remove from Cart"
                    : "Add to Cart"}
                </button>

                <button
                  className={productInWishlist ? "wishlist-active" : ""}
                  onClick={handleWishlist}
                >
                  {productInWishlist ? "♥ Remove Wishlist" : "♡ Add Wishlist"}
                </button>
              </div>

              <div className="detail-mini-grid">
                <div>
                  <span>Skin Type</span>
                  <strong>{product.skin_type || "All skin types"}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>{product.status || "active"}</strong>
                </div>

                <div>
                  <span>Brand</span>
                  <strong>{product.brand || "Radhivya"}</strong>
                </div>
              </div>

              <div className="premium-detail-section">
                <h2>Description</h2>
                <p>{product.description || "No detailed description added yet."}</p>
              </div>

              <div className="premium-detail-section">
                <h2>Ingredients</h2>
                <p>{product.ingredients || "Ingredients will be updated soon."}</p>
              </div>

              <div className="premium-detail-section">
                <h2>How to Use</h2>
                <p>{product.how_to_use || "Usage instructions will be updated soon."}</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}