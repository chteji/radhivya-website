import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "./AboutPage.css";

const values = [
  {
    icon: "🌿",
    title: "Nature-Inspired",
    text: "We believe skincare should feel gentle, thoughtful, and connected to natural beauty rituals.",
  },
  {
    icon: "✨",
    title: "Glow With Care",
    text: "Every product experience is designed around confidence, softness, radiance, and everyday self-care.",
  },
  {
    icon: "🧴",
    title: "Clean Rituals",
    text: "Our brand focuses on simple routines, clear product information, and a trustworthy shopping experience.",
  },
  {
    icon: "🤍",
    title: "Customer First",
    text: "From product browsing to support tickets, Radhivya is built around helping customers feel supported.",
  },
];

const process = [
  {
    title: "Thoughtful Selection",
    text: "Products are organized by categories such as cleansers, serums, moisturizers, oils, masks, and body care.",
  },
  {
    title: "Admin Managed Catalog",
    text: "Only authorized admin users can add, update, or manage product information through the Admin Portal.",
  },
  {
    title: "Secure Checkout",
    text: "Orders, customer details, payments, and invoices are handled through backend APIs and database storage.",
  },
  {
    title: "Support After Purchase",
    text: "Customers can contact support and staff can manage support tickets through the Staff Portal.",
  },
];

const promises = [
  {
    icon: "🌸",
    title: "Softness in Every Detail",
    text: "Radhivya is created for customers who love skincare that feels calm, elegant, and gentle in their daily routine.",
  },
  {
    icon: "💧",
    title: "Hydration-Focused Beauty",
    text: "Our product experience is built around glowing skin, moisture, freshness, and a naturally healthy appearance.",
  },
  {
    icon: "🪷",
    title: "Inspired by Indian Grace",
    text: "The brand carries a soft Indian luxury feeling, blending modern beauty with graceful self-care rituals.",
  },
  {
    icon: "🔒",
    title: "Trust & Transparency",
    text: "Clear product details, organized categories, customer profiles, invoices, and order records help create confidence.",
  },
];

const skincareFocus = [
  {
    title: "Cleansing",
    text: "A clean skincare routine begins with removing dirt, oil, and impurities while keeping the skin feeling fresh and balanced.",
  },
  {
    title: "Hydrating",
    text: "Hydration is important for a soft, plump, glowing look. Radhivya focuses on routines that feel refreshing and nourishing.",
  },
  {
    title: "Repairing",
    text: "Good skincare supports the skin barrier with gentle care, simple steps, and products that fit everyday use.",
  },
  {
    title: "Protecting",
    text: "A premium routine should help customers feel confident by supporting healthy-looking skin in daily life.",
  },
];

const experience = [
  {
    title: "Premium Visual Experience",
    text: "Radhivya is designed to feel elegant from the first visit, with a modern layout, soft visuals, and a luxury skincare identity.",
  },
  {
    title: "Easy Product Journey",
    text: "Customers can move smoothly from browsing to product details, wishlist, cart, checkout, payment, and invoice.",
  },
  {
    title: "Personal Customer Space",
    text: "The customer profile allows users to manage their shopping experience and feel connected with the brand.",
  },
  {
    title: "Business Control",
    text: "Admin and staff portals help manage products, customers, orders, coupons, and support without confusion.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Header />

      <main className="about-page">
        <div className="about-container">
          <section className="about-hero">
            <div>
              <div className="about-eyebrow">About Radhivya</div>

              <h1>
                Beauty that feels <br /> personal, pure, and premium.
              </h1>

              <p>
                Radhivya is a premium Indian skincare brand created around the
                idea of graceful self-care. We combine nature-inspired beauty,
                elegant digital shopping, and customer-first service to create a
                skincare experience that feels trustworthy, modern, and deeply
                personal.
              </p>

              <p>
                Our website is built as a complete ecommerce system where
                customers can explore products, save favourites, add items to
                cart, checkout securely, receive invoices, and contact support
                whenever they need help.
              </p>

              <p>
                Radhivya is made for people who want skincare to feel more than
                just a product purchase. It is about building a daily ritual that
                feels soft, confident, clean, and emotionally connected to your
                personal beauty journey.
              </p>

              <div className="about-hero-actions">
                <Link className="about-primary-btn" to="/products">
                  Explore Products
                </Link>

                <Link className="about-secondary-btn" to="/contact">
                  Contact Us
                </Link>
              </div>
            </div>

            <div className="about-visual">
              <div className="float-card one">
                <strong>Clean</strong>
                <span>Beauty rituals</span>
              </div>

              <img src="/logo-transparent.png" alt="Radhivya skincare brand" />

              <div className="float-card two">
                <strong>Premium</strong>
                <span>Skincare experience</span>
              </div>
            </div>
          </section>

          <section className="about-section">
            <div className="story-grid">
              <div className="story-image"></div>

              <div className="story-content">
                <h3>Our Story</h3>

                <p>
                  Radhivya was imagined as more than a skincare shop. It was
                  created as a digital beauty space where product discovery,
                  trust, and customer care come together in one elegant
                  experience.
                </p>

                <p>
                  In many ecommerce stores, products are shown without enough
                  clarity. Radhivya focuses on detailed product information,
                  clear categories, product descriptions, ingredients, how-to-use
                  instructions, and a smooth shopping journey.
                </p>

                <p>
                  Behind the website, every product is managed through an admin
                  system. This means customers only see approved products while
                  admins control product details, pricing, stock, order status,
                  and catalog updates.
                </p>

                <p>
                  The goal is simple: create a premium skincare website that
                  feels beautiful on the outside and works properly on the
                  inside.
                </p>

                <p>
                  Radhivya is built with a modern customer in mind. Today,
                  customers do not only want products; they want trust,
                  education, comfort, and a brand that feels reliable from the
                  first click to the final delivery.
                </p>

                <p>
                  Every part of the website has been planned to support this
                  goal — from product browsing and wishlist features to checkout,
                  invoice generation, customer profile, contact support, and
                  admin control.
                </p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <div className="about-section-head center">
              <span>Brand Essence</span>
              <h2>The feeling behind Radhivya</h2>
              <p>
                Radhivya is inspired by softness, purity, Indian elegance, and
                modern beauty confidence. The brand is made to feel calm,
                graceful, premium, and trustworthy.
              </p>
            </div>

            <div className="philosophy-band">
              <div>
                <h2>Where modern skincare meets graceful self-care</h2>

                <p>
                  The name Radhivya carries a soft, elegant, and beautiful
                  feeling. It represents skincare that feels personal, glowing,
                  and connected to inner confidence.
                </p>

                <p>
                  Our vision is to create a brand where every customer feels
                  welcomed, informed, and cared for. Whether someone is buying a
                  cleanser, serum, face oil, body care product, or moisturizer,
                  the experience should feel smooth and premium.
                </p>

                <p>
                  Radhivya is not designed to feel loud or confusing. It is
                  designed to feel warm, clean, elegant, and trustworthy — like a
                  peaceful beauty ritual customers can return to again and
                  again.
                </p>
              </div>

              <div className="philosophy-points">
                <div className="philosophy-point">
                  <strong>Elegant beauty identity</strong>
                  <span>
                    A soft premium skincare brand experience with a modern
                    Indian luxury touch.
                  </span>
                </div>

                <div className="philosophy-point">
                  <strong>Customer comfort</strong>
                  <span>
                    Clear product information helps customers shop with more
                    confidence and less confusion.
                  </span>
                </div>

                <div className="philosophy-point">
                  <strong>Glow-focused routine</strong>
                  <span>
                    Radhivya celebrates skincare as a daily ritual for softness,
                    freshness, and confidence.
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="about-section">
            <div className="about-section-head center">
              <span>Our Values</span>
              <h2>What Radhivya stands for</h2>
              <p>
                Our values guide the design, shopping experience, customer
                support, and product management system behind the brand.
              </p>
            </div>

            <div className="values-grid">
              {values.map((value) => (
                <div className="value-card" key={value.title}>
                  <div className="value-icon">{value.icon}</div>
                  <h3>{value.title}</h3>
                  <p>{value.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="about-section">
            <div className="about-section-head center">
              <span>Our Promise</span>
              <h2>Skincare made to feel calm, clear, and premium</h2>
              <p>
                Radhivya promises a shopping experience that feels beautiful,
                simple, and trustworthy from product discovery to final order.
              </p>
            </div>

            <div className="values-grid">
              {promises.map((item) => (
                <div className="value-card" key={item.title}>
                  <div className="value-icon">{item.icon}</div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="about-section">
            <div className="philosophy-band">
              <div>
                <h2>Our Skincare Philosophy</h2>
                <p>
                  Radhivya believes skincare should not feel confusing. A good
                  beauty routine should be simple to understand, easy to follow,
                  and enjoyable every day.
                </p>

                <p>
                  That is why our ecommerce experience is designed around clear
                  information, categorized products, customer support, and a
                  shopping flow that feels calm and premium.
                </p>

                <p>
                  We want customers to understand what they are buying, why it
                  matters, and how it can become part of their daily care. From
                  product details to usage instructions, Radhivya is designed to
                  make skincare feel easier and more enjoyable.
                </p>
              </div>

              <div className="philosophy-points">
                <div className="philosophy-point">
                  <strong>Clear product discovery</strong>
                  <span>
                    Customers can browse by product type, category, skin concern,
                    and product details.
                  </span>
                </div>

                <div className="philosophy-point">
                  <strong>Trust-first shopping</strong>
                  <span>
                    Cart, checkout, payment records, and order data are handled
                    through structured backend and database logic.
                  </span>
                </div>

                <div className="philosophy-point">
                  <strong>Support when needed</strong>
                  <span>
                    Customer messages are stored as support tickets and can be
                    reviewed by the staff team.
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="about-section">
            <div className="about-section-head center">
              <span>Skincare Focus</span>
              <h2>Every routine begins with understanding your skin</h2>
              <p>
                Radhivya supports simple, organized skincare routines that help
                customers choose products with more clarity and confidence.
              </p>
            </div>

            <div className="process-grid">
              {skincareFocus.map((item) => (
                <div className="process-card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="about-section">
            <div className="story-grid">
              <div className="story-content">
                <h3>Why Customers Choose Radhivya</h3>

                <p>
                  Radhivya is created for customers who want their skincare
                  shopping experience to feel premium, peaceful, and clear. The
                  brand focuses on beauty with trust, not confusion.
                </p>

                <p>
                  Customers can explore categories, read product details, save
                  favourites, add products to cart, apply coupons, checkout, and
                  receive a professional invoice after placing an order.
                </p>

                <p>
                  The experience is designed to feel personal because skincare is
                  personal. Every customer has different needs, different beauty
                  goals, and different routines. Radhivya gives them a space to
                  explore products in a simple and elegant way.
                </p>

                <p>
                  From the home page to the admin portal, every section is made
                  with one goal: build a skincare brand that looks premium, works
                  smoothly, and feels trustworthy.
                </p>
              </div>

              <div className="story-image"></div>
            </div>
          </section>

          <section className="about-section">
            <div className="about-section-head center">
              <span>Digital Experience</span>
              <h2>A beauty brand built for modern ecommerce</h2>
              <p>
                Radhivya is more than a visual website. It is planned as a full
                ecommerce system with customer, admin, and staff workflows.
              </p>
            </div>

            <div className="process-grid">
              {experience.map((item) => (
                <div className="process-card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="about-section">
            <div className="about-section-head center">
              <span>How It Works</span>
              <h2>A complete skincare shopping journey</h2>
              <p>
                Radhivya is not only a frontend website. It includes database,
                backend APIs, admin portal, staff support, cart, wishlist,
                checkout, and invoice flow.
              </p>
            </div>

            <div className="process-grid">
              {process.map((item) => (
                <div className="process-card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="about-section">
            <div className="philosophy-band">
              <div>
                <h2>Designed for beauty, trust, and long-term growth</h2>

                <p>
                  A premium skincare brand needs more than attractive visuals. It
                  needs a strong system behind it. Radhivya is built with this
                  mindset, combining frontend beauty with backend control.
                </p>

                <p>
                  Admin users can manage products, update prices, control stock,
                  handle coupons, view customers, and manage orders. Staff users
                  can support customers and help keep the business running
                  smoothly.
                </p>

                <p>
                  This makes Radhivya ready for real ecommerce growth because
                  the website is not only designed for customers, but also for
                  the people managing the business behind the scenes.
                </p>
              </div>

              <div className="philosophy-points">
                <div className="philosophy-point">
                  <strong>Admin control</strong>
                  <span>
                    Product catalog, pricing, stock status, coupons, and order
                    management can be controlled from the admin side.
                  </span>
                </div>

                <div className="philosophy-point">
                  <strong>Staff support</strong>
                  <span>
                    Staff users can help with customer messages and support
                    workflows.
                  </span>
                </div>

                <div className="philosophy-point">
                  <strong>Customer confidence</strong>
                  <span>
                    A smooth shopping flow helps customers trust the brand and
                    return again.
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="about-section">
            <div className="about-section-head center">
              <span>Trust Built In</span>
              <h2>Designed for customers and business control</h2>
            </div>

            <div className="trust-grid">
              <div className="trust-card">
                <strong>3</strong>
                <span>Separate login roles: Customer, Admin, Staff</span>
              </div>

              <div className="trust-card">
                <strong>100%</strong>
                <span>Admin-only product management control</span>
              </div>

              <div className="trust-card">
                <strong>24/7</strong>
                <span>Support-ready contact and ticket workflow</span>
              </div>
            </div>
          </section>

          <section className="about-section">
            <div className="about-section-head center">
              <span>Our Vision</span>
              <h2>To become a trusted skincare name for everyday glow</h2>
              <p>
                Radhivya’s vision is to create a skincare brand that customers
                remember for its elegance, clarity, softness, and reliable
                shopping experience.
              </p>
            </div>

            <div className="philosophy-band">
              <div>
                <h2>A brand customers can feel connected to</h2>

                <p>
                  We want Radhivya to feel like a beauty destination where
                  customers can discover products, understand routines, and build
                  confidence in their skin journey.
                </p>

                <p>
                  The long-term goal is to grow Radhivya into a premium skincare
                  platform that combines product quality, elegant design,
                  customer care, and smooth technology.
                </p>
              </div>

              <div className="philosophy-points">
                <div className="philosophy-point">
                  <strong>Premium identity</strong>
                  <span>
                    A soft, elegant, and luxury-inspired skincare brand
                    experience.
                  </span>
                </div>

                <div className="philosophy-point">
                  <strong>Real ecommerce flow</strong>
                  <span>
                    Product browsing, wishlist, cart, checkout, payment, and
                    invoice features support a complete shopping journey.
                  </span>
                </div>

                <div className="philosophy-point">
                  <strong>Future-ready growth</strong>
                  <span>
                    Admin and staff systems make the platform easier to manage
                    as the brand grows.
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="about-section">
            <div className="about-cta">
              <h2>Start your Radhivya ritual</h2>

              <p>
                Explore products, save your favourites, build your cart, and
                experience a clean, premium skincare shopping journey.
              </p>

              <p>
                Let Radhivya become part of your daily glow ritual — simple,
                elegant, caring, and made for modern beauty.
              </p>

              <div className="about-cta-actions">
                <Link className="about-primary-btn" to="/products">
                  Shop Now
                </Link>

                <Link className="about-secondary-btn" to="/contact">
                  Ask a Question
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}