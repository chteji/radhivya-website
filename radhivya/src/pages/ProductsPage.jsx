import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Toast from "../components/Toast.jsx";
import "./ProductsPage.css";

const API_URL = "http://localhost:5000";

const categories = [
  "All",
  "Cleanser/Facewash",
  "Serum",
  "Toner",
  "Moisturizers",
  "Face Oil",
  "Scrub",
  "Face Mask",
  "Eye Care",
  "Lip Care",
  "Body Care",
  "Hair Care",
];

const fallbackProducts = [
  {
    id: "demo-1",
    name: "Golden Glow Serum",
    price: 999,
    old_price: 1299,
    category: "Serum",
    stock: 20,
    short_description: "A premium glow serum for smooth, radiant skin.",
    image_url:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=900",
  },
  {
    id: "demo-2",
    name: "Soft Ritual Cleanser",
    price: 699,
    old_price: 899,
    category: "Cleanser/Facewash",
    stock: 18,
    short_description: "Gentle daily cleanser for fresh skin.",
    image_url:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=900",
  },
  {
    id: "demo-3",
    name: "Velvet Moisturizer",
    price: 899,
    old_price: 1199,
    category: "Moisturizers",
    stock: 12,
    short_description: "Rich hydration with a luxury skin feel.",
    image_url:
      "https://images.unsplash.com/photo-1629198735660-e39ea93f5c18?q=80&w=900",
  },
];

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

export default function ProductsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const urlCategory =
    new URLSearchParams(location.search).get("category") || "All";

  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [searchText, setSearchText] = useState("");
  const [sortType, setSortType] = useState("default");
  const [priceRange, setPriceRange] = useState("all");
  const [availability, setAvailability] = useState("all");

  const [toast, setToast] = useState("");
  const [cart, setCart] = useState(getCart());
  const [wishlist, setWishlist] = useState(getWishlist());

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    setSelectedCategory(urlCategory || "All");
  }, [urlCategory]);

  async function loadProducts() {
    try {
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();

      if (
        data.success &&
        Array.isArray(data.products) &&
        data.products.length > 0
      ) {
        setProducts(data.products);
      } else {
        setProducts(fallbackProducts);
      }
    } catch (error) {
      console.error("Products load failed:", error);
      setProducts(fallbackProducts);
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

  function addToCart(product) {
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

  function buyNow(product) {
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

  function toggleWishlist(product) {
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

  function selectCategory(category) {
    setSelectedCategory(category);

    if (category === "All") {
      navigate("/products");
    } else {
      navigate(`/products?category=${encodeURIComponent(category)}`);
    }
  }

  function resetFilters() {
    setSelectedCategory("All");
    setSearchText("");
    setSortType("default");
    setPriceRange("all");
    setAvailability("all");
    navigate("/products");
  }

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (selectedCategory !== "All") {
      list = list.filter(
        (product) =>
          String(product.category || "").toLowerCase() ===
          selectedCategory.toLowerCase()
      );
    }

    if (searchText.trim()) {
      const text = searchText.toLowerCase();

      list = list.filter(
        (product) =>
          String(product.name || "").toLowerCase().includes(text) ||
          String(product.category || "").toLowerCase().includes(text) ||
          String(product.short_description || "")
            .toLowerCase()
            .includes(text) ||
          String(product.description || "").toLowerCase().includes(text)
      );
    }

    if (priceRange !== "all") {
      list = list.filter((product) => {
        const price = Number(product.price || 0);

        if (priceRange === "under-500") return price < 500;
        if (priceRange === "500-1000") return price >= 500 && price <= 1000;
        if (priceRange === "1000-2000") return price > 1000 && price <= 2000;
        if (priceRange === "above-2000") return price > 2000;

        return true;
      });
    }

    if (availability === "available") {
      list = list.filter(
        (product) =>
          product.is_available !== false && Number(product.stock || 0) !== 0
      );
    }

    if (availability === "sold-out") {
      list = list.filter(
        (product) =>
          product.is_available === false || Number(product.stock || 0) === 0
      );
    }

    if (sortType === "low-high") {
      list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }

    if (sortType === "high-low") {
      list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }

    if (sortType === "name") {
      list.sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || ""))
      );
    }

    return list;
  }, [
    products,
    selectedCategory,
    searchText,
    sortType,
    priceRange,
    availability,
  ]);

  return (
    <>
      <Header />
      <Toast message={toast} />

      <main className="shop-lux-page">
        <section className="shop-lux-hero">
          <span>Radhivya Shop</span>
          <h1>Premium skincare collection</h1>
          <p>
            Explore cleansers, serums, moisturizers, masks, oils, lip care, body
            care and complete beauty rituals with a premium shopping experience.
          </p>
        </section>

        <section className="shop-filter-panel">
          <div className="filter-field search-field">
            <label>Search Product</label>
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search serum, cleanser, lip care..."
            />
          </div>

          <div className="filter-field">
            <label>Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => selectCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Price</label>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
            >
              <option value="all">All Prices</option>
              <option value="under-500">Under ₹500</option>
              <option value="500-1000">₹500 - ₹1000</option>
              <option value="1000-2000">₹1000 - ₹2000</option>
              <option value="above-2000">Above ₹2000</option>
            </select>
          </div>

          <div className="filter-field">
            <label>Availability</label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
            >
              <option value="all">All</option>
              <option value="available">Available</option>
              <option value="sold-out">Sold Out</option>
            </select>
          </div>

          <div className="filter-field">
            <label>Sort</label>
            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
            >
              <option value="default">Default</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>

          <button className="reset-filter-btn" type="button" onClick={resetFilters}>
            Reset
          </button>
        </section>

        <section className="shop-result-bar">
          <span>{filteredProducts.length} products found</span>
          <strong>
            {selectedCategory === "All"
              ? "All Categories"
              : selectedCategory}
          </strong>
        </section>

        {filteredProducts.length === 0 ? (
          <section className="shop-empty">
            <h2>No products found</h2>
            <p>Try changing category, search text, price or availability.</p>
            <button onClick={resetFilters}>Reset Filters</button>
          </section>
        ) : (
          <section className="shop-product-grid">
            {filteredProducts.map((product) => {
              const inCart = cart.some((item) => item.id === product.id);
              const inWishlist = wishlist.some((item) => item.id === product.id);
              const isSoldOut =
                product.is_available === false ||
                Number(product.stock || 0) === 0;

              return (
                <article className="shop-product-card" key={product.id}>
                  <button
                    className={`shop-heart ${inWishlist ? "active" : ""}`}
                    onClick={() => toggleWishlist(product)}
                    aria-label="Wishlist"
                  >
                    ♥
                  </button>

                  {isSoldOut && <div className="sold-out-ribbon">Sold Out</div>}

                  <Link
                    to={`/product/${product.id}`}
                    className="shop-product-image"
                  >
                    <img src={getProductImage(product)} alt={product.name} />
                  </Link>

                  <div className="shop-product-content">
                    <span>{product.category || "Skincare"}</span>

                    <h3>{product.name}</h3>

                    <p>{product.short_description || product.description}</p>

                    <div className="shop-product-bottom">
                      <strong>₹{product.price}</strong>

                      {product.old_price && (
                        <small className="old-price">₹{product.old_price}</small>
                      )}

                      <small>{isSoldOut ? "Sold Out" : "Available"}</small>
                    </div>

                    <div className="shop-product-actions">
                      <button
                        onClick={() => buyNow(product)}
                        disabled={isSoldOut}
                      >
                        Buy Now
                      </button>

                      <button
                        className="secondary"
                        onClick={() => addToCart(product)}
                        disabled={isSoldOut}
                      >
                        {inCart ? "Remove Cart" : "Add Cart"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}