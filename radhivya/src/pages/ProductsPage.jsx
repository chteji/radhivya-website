import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Toast from "../components/Toast.jsx";
import {
  isProductInCart,
  isProductInWishlist,
  toggleProductInCart,
  toggleProductInWishlist,
} from "../utils/customerStorage.js";
import "./ProductsPage.css";

const API_URL = "http://localhost:5000";

const categoryButtons = [
  ["All", "all"],
  ["Cleanser", "cleanser-facewash"],
  ["Serum", "serum"],
  ["Toner", "toner"],
  ["Moisturizers", "moisturizers"],
  ["Face Oil", "face-oil"],
  ["Scrub", "scrub"],
  ["Face Mask", "face-mask"],
  ["Eye Care", "eye-care"],
  ["Lip Care", "lip-care"],
  ["Body Care", "body-care"],
  ["Hair Care", "hair-care"],
];

export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategory = searchParams.get("category") || "all";

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [stockFilter, setStockFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [refreshState, setRefreshState] = useState(0);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to load products.");
      }

      setProducts(data.products || []);
    } catch (err) {
      setError(err.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  }

  function changeCategory(category) {
    if (category === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ category });
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

  function categoryMatches(product, category) {
    if (category === "all") return true;

    const readable = category.replaceAll("-", " ");

    const text = `
      ${product.name || ""}
      ${product.category || ""}
      ${product.category_slug || ""}
      ${product.categories?.name || ""}
      ${product.short_description || ""}
      ${product.description || ""}
    `.toLowerCase();

    return text.includes(category.toLowerCase()) || text.includes(readable.toLowerCase());
  }

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const keyword = search.toLowerCase();

      list = list.filter((product) => {
        const text = `
          ${product.name || ""}
          ${product.category || ""}
          ${product.short_description || ""}
          ${product.description || ""}
          ${product.skin_type || ""}
        `.toLowerCase();

        return text.includes(keyword);
      });
    }

    list = list.filter((product) => categoryMatches(product, selectedCategory));

    if (stockFilter === "in_stock") {
      list = list.filter((product) => Number(product.stock || 0) > 0);
    }

    if (stockFilter === "sold_out") {
      list = list.filter((product) => Number(product.stock || 0) <= 0);
    }

    if (sort === "price_low") {
      list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }

    if (sort === "price_high") {
      list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }

    if (sort === "name") {
      list.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
    }

    if (sort === "newest") {
      list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }

    return list;
  }, [products, search, sort, stockFilter, selectedCategory, refreshState]);

  function getPageTitle() {
    if (selectedCategory === "all") return "Luxury Skincare Shop";

    return selectedCategory
      .replaceAll("-", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function handleCart(product) {
    const result = toggleProductInCart(product);
    setRefreshState((prev) => prev + 1);

    if (result.status === "added") {
      showToast("Yeah! Added to cart successfully.");
    } else {
      showToast("Removed from cart.");
    }
  }

  function handleWishlist(product) {
    const result = toggleProductInWishlist(product);
    setRefreshState((prev) => prev + 1);

    if (result.status === "added") {
      showToast("Yeah! Added to wishlist successfully.");
    } else {
      showToast("Removed from wishlist.");
    }
  }

  function handleBuyNow(product) {
    if (Number(product.stock || 0) <= 0) {
      showToast("This product is sold out.");
      return;
    }

    if (!isProductInCart(product.id)) {
      toggleProductInCart(product);
    }

    showToast("Product added. Opening checkout...");
    setTimeout(() => {
      navigate("/checkout");
    }, 600);
  }

  return (
    <>
      <Header />
      <Toast message={toast} />

      <main className="shop-lux-page">
        <section className="shop-lux-hero">
          <div className="shop-lux-hero-text">
            <span>Radhivya Collection</span>
            <h1>{getPageTitle()}</h1>
            <p>
              Discover premium skincare products with a black-gold luxury shopping
              experience. Click product image to view full details.
            </p>
          </div>

          <div className="shop-lux-hero-card">
            <div className="shop-lux-orb"></div>
            <img
              src="/logo-transparent.png"
              alt="Radhivya"
              onError={(e) => {
                e.currentTarget.src = "/logo.png";
              }}
            />
          </div>
        </section>

        <section className="shop-category-bar">
          {categoryButtons.map(([label, value]) => (
            <button
              key={value}
              className={selectedCategory === value ? "active" : ""}
              onClick={() => changeCategory(value)}
            >
              {label}
            </button>
          ))}
        </section>

        <section className="shop-lux-layout">
          <aside className="shop-filter-panel">
            <h2>Refine</h2>

            <label>
              Search
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search serum, cream..."
              />
            </label>

            <label>
              Stock
              <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
                <option value="all">All Products</option>
                <option value="in_stock">In Stock</option>
                <option value="sold_out">Sold Out</option>
              </select>
            </label>

            <label>
              Sort
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="price_low">Price Low to High</option>
                <option value="price_high">Price High to Low</option>
                <option value="name">Name A-Z</option>
              </select>
            </label>

            <button
              onClick={() => {
                setSearch("");
                setSort("newest");
                setStockFilter("all");
                setSearchParams({});
              }}
            >
              Clear Filters
            </button>
          </aside>

          <section className="shop-products-area">
            <div className="shop-toolbar">
              <strong>{filteredProducts.length}</strong>
              <span>products found</span>
            </div>

            {loading && <div className="shop-state">Loading luxury products...</div>}

            {!loading && error && <div className="shop-state error">{error}</div>}

            {!loading && !error && filteredProducts.length === 0 && (
              <div className="shop-state">
                <h2>No products found</h2>
                <p>Add products from Admin Portal or choose another filter.</p>
              </div>
            )}

            {!loading && !error && filteredProducts.length > 0 && (
              <div className="shop-product-grid">
                {filteredProducts.map((product) => {
                  const inWishlist = isProductInWishlist(product.id);
                  const inCart = isProductInCart(product.id);
                  const soldOut = Number(product.stock || 0) <= 0;

                  return (
                    <article className="shop-product-card" key={product.id}>
                      <div className="shop-badges">
                        {product.is_bestseller && <span>Bestseller</span>}
                        {product.is_featured && <span>Featured</span>}
                        {product.is_new_arrival && <span>New</span>}
                        {soldOut && <span className="sold">Sold Out</span>}
                      </div>

                      <button
                        className={`shop-heart ${inWishlist ? "active" : ""}`}
                        onClick={() => handleWishlist(product)}
                      >
                        {inWishlist ? "♥" : "♡"}
                      </button>

                      <Link to={`/product/${product.id}`} className="shop-product-image">
                        <img src={getProductImage(product)} alt={product.name} />
                      </Link>

                      <div className="shop-product-info">
                        <small>{product.category || "Skincare"}</small>

                        <h3>{product.name}</h3>

                        <p>
                          {product.short_description ||
                            product.description ||
                            "Premium skincare by Radhivya."}
                        </p>

                        <div className="shop-meta">
                          <span>{product.skin_type || "All Skin Types"}</span>
                          <span>{soldOut ? "Sold Out" : `Stock ${product.stock}`}</span>
                        </div>

                        <div className="shop-price">
                          <strong>₹{Number(product.price || 0).toFixed(0)}</strong>
                          {product.old_price && (
                            <del>₹{Number(product.old_price).toFixed(0)}</del>
                          )}
                        </div>

                        <div className="shop-actions">
                          <button
                            onClick={() => handleCart(product)}
                            disabled={soldOut}
                            className={inCart ? "remove" : ""}
                          >
                            {soldOut ? "Sold Out" : inCart ? "Remove Cart" : "Add Cart"}
                          </button>

                          <button onClick={() => handleBuyNow(product)} disabled={soldOut}>
                            Buy Now
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </section>
      </main>

      <Footer />
    </>
  );
}