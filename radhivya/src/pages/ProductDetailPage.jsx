import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Toast from "../components/Toast.jsx";
import "./ProductDetailPage.css";

const API_URL = "http://localhost:5000";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem("radhivyaCart") || "[]");
  } catch {
    return [];
  }
}

function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem("radhivyaWishlist") || "[]");
  } catch {
    return [];
  }
}

function getProductImage(product) {
  const mainImage = product?.product_images?.find((img) => img.is_main);
  const firstImage = product?.product_images?.[0];

  return (
    product?.image_url ||
    mainImage?.image_url ||
    firstImage?.image_url ||
    product?.image ||
    "/logo-transparent.png"
  );
}

function normalizeProduct(product) {
  return {
    ...product,
    price: Number(product?.price || 0),
    old_price: product?.old_price ? Number(product.old_price) : null,
    stock: Number(product?.stock || 0),
  };
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [cart, setCart] = useState(getCart());
  const [wishlist, setWishlist] = useState(getWishlist());
  const [toast, setToast] = useState("");

  useEffect(() => {
    loadProductData();
  }, [id]);

  async function loadProductData() {
    try {
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();

      if (data.success && Array.isArray(data.products)) {
        const allProducts = data.products.map(normalizeProduct);
        setProducts(allProducts);

        const foundProduct = allProducts.find(
          (item) => String(item.id) === String(id) || String(item.slug) === String(id)
        );

        setProduct(foundProduct || null);
      }
    } catch (error) {
      console.error("Product detail load failed:", error);
    }
  }

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2600);
  }

  function updateCart(nextCart) {
    setCart(nextCart);
    localStorage.setItem("radhivyaCart", JSON.stringify(nextCart));
    localStorage.setItem("radhivya_cart", JSON.stringify(nextCart));
  }

  function updateWishlist(nextWishlist) {
    setWishlist(nextWishlist);
    localStorage.setItem("radhivyaWishlist", JSON.stringify(nextWishlist));
  }

  function addToCart() {
    if (!product) return;

    const exists = cart.some((item) => item.id === product.id);

    if (exists) {
      const nextCart = cart.filter((item) => item.id !== product.id);
      updateCart(nextCart);
      showToast("Removed from cart.");
      return;
    }

    const nextCart = [
      ...cart,
      {
        ...product,
        quantity: 1,
        image: getProductImage(product),
      },
    ];

    updateCart(nextCart);
    showToast("Yeah! Added to cart successfully.");
  }

  function buyNow() {
    if (!product) return;

    const nextCart = [
      {
        ...product,
        quantity: 1,
        image: getProductImage(product),
      },
    ];

    updateCart(nextCart);
    navigate("/checkout");
  }

  function toggleWishlist() {
    if (!product) return;

    const exists = wishlist.some((item) => item.id === product.id);

    if (exists) {
      const nextWishlist = wishlist.filter((item) => item.id !== product.id);
      updateWishlist(nextWishlist);
      showToast("Removed from wishlist.");
      return;
    }

    const nextWishlist = [
      ...wishlist,
      {
        ...product,
        image: getProductImage(product),
      },
    ];

    updateWishlist(nextWishlist);
    showToast("Added to wishlist successfully.");
  }

  function addSuggestionToCart(item) {
    const exists = cart.some((cartItem) => cartItem.id === item.id);

    if (exists) {
      showToast("Already in cart.");
      return;
    }

    const nextCart = [
      ...cart,
      {
        ...item,
        quantity: 1,
        image: getProductImage(item),
      },
    ];

    updateCart(nextCart);
    showToast("Suggested product added to cart.");
  }

  const inCart = product ? cart.some((item) => item.id === product.id) : false;
  const inWishlist = product
    ? wishlist.some((item) => item.id === product.id)
    : false;

  const isSoldOut =
    product?.is_available === false || Number(product?.stock || 0) === 0;

  const suggestions = useMemo(() => {
    if (!product) return [];

    const sameCategory = products.filter(
      (item) =>
        item.id !== product.id &&
        String(item.category || "").toLowerCase() ===
          String(product.category || "").toLowerCase()
    );

    const others = products.filter((item) => item.id !== product.id);

    return [...sameCategory, ...others]
      .filter(
        (item, index, array) =>
          array.findIndex((p) => p.id === item.id) === index
      )
      .slice(0, 4);
  }, [products, product]);

  if (!product) {
    return (
      <>
        <Header />

        <main className="product-detail-page">
          <section className="product-not-found">
            <h2>Product not found</h2>
            <p>This product could not be loaded. Please return to shop.</p>
            <Link to="/products">Back to Shop</Link>
          </section>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Toast message={toast} />

      <main className="product-detail-page">
        <section className="product-detail-shell">
          <div className="product-gallery-card">
            <div className="product-main-image">
              <img src={getProductImage(product)} alt={product.name} />
            </div>

            <div className="product-mini-gallery">
              {(product.product_images || []).slice(0, 4).map((img, index) => (
                <img
                  key={`${img.image_url}-${index}`}
                  src={img.image_url}
                  alt={product.name}
                />
              ))}
            </div>
          </div>

          <div className="product-info-card">
            <div className="product-badges">
              {product.is_bestseller && <span>Bestseller</span>}
              {product.is_featured && <span>Featured</span>}
              {product.category && <span>{product.category}</span>}
            </div>

            <h1>{product.name}</h1>

            <p className="product-short">
              {product.short_description || product.description}
            </p>

            <div className="product-price-row">
              <strong>₹{product.price}</strong>
              {product.old_price && <span>₹{product.old_price}</span>}
            </div>

            <div className={`stock-pill ${isSoldOut ? "sold" : ""}`}>
              {isSoldOut
                ? "Sold Out"
                : `In Stock · ${product.stock || "Available"} available`}
            </div>

            <div className="product-action-row">
              <button onClick={buyNow} disabled={isSoldOut}>
                Buy Now
              </button>

              <button className="secondary" onClick={addToCart} disabled={isSoldOut}>
                {inCart ? "Remove Cart" : "Add to Cart"}
              </button>

              <button
                className={`wishlist-action ${inWishlist ? "active" : ""}`}
                onClick={toggleWishlist}
              >
                {inWishlist ? "♥ Remove Wishlist" : "♡ Add Wishlist"}
              </button>
            </div>

            <div className="product-meta-grid">
              <div>
                <span>Skin Type</span>
                <strong>{product.skin_type || "All skin types"}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong>{product.status || "Active"}</strong>
              </div>

              <div>
                <span>Brand</span>
                <strong>{product.brand || "Radhivya"}</strong>
              </div>
            </div>

            <div className="product-description-box">
              <h2>Description</h2>
              <p>{product.description || product.short_description}</p>

              {product.ingredients && (
                <>
                  <h2>Ingredients</h2>
                  <p>{product.ingredients}</p>
                </>
              )}

              {product.how_to_use && (
                <>
                  <h2>How to Use</h2>
                  <p>{product.how_to_use}</p>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="product-suggestions">
          <div className="suggestion-head">
            <span>More to explore</span>
            <h2>You may also like</h2>
            <p>
              Similar Radhivya products customers can add to cart or open for
              more details.
            </p>
          </div>

          {suggestions.length === 0 ? (
            <div className="no-suggestions">
              No suggestions available yet. Add more products from admin.
            </div>
          ) : (
            <div className="suggestion-grid">
              {suggestions.map((item) => (
                <article className="suggestion-card" key={item.id}>
                  <Link to={`/product/${item.id}`} className="suggestion-image">
                    <img src={getProductImage(item)} alt={item.name} />
                  </Link>

                  <div>
                    <span>{item.category || "Skincare"}</span>
                    <h3>{item.name}</h3>
                    <p>{item.short_description || item.description}</p>

                    <div className="suggestion-bottom">
                      <strong>₹{item.price}</strong>

                      <button onClick={() => addSuggestionToCart(item)}>
                        Add Cart
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}