const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* =========================
   ROUTE IMPORTS
========================= */

const authRoutes = require("./routes/auth");
const businessRoutes = require("./routes/business");
const productRoutes = require("./routes/products");
const paymentRoutes = require("./routes/payments");
const orderRoutes = require("./routes/orders");
const supportRoutes = require("./routes/support");
const adminRoutes = require("./routes/admin");
const uploadRoutes = require("./routes/upload");
const staffRoutes = require("./routes/staff");
const orderEmailRoutes = require("./routes/orderEmail");

/* =========================
   MIDDLEWARE
========================= */

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-role"],
    credentials: true,
  })
);

app.options("*", cors());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/* =========================
   TEST ROUTE
========================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Radhivya backend is running successfully.",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend API is healthy.",
    time: new Date().toISOString(),
  });
});

/* =========================
   API ROUTES
========================= */

app.use("/api/auth", authRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/products", productRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/order-email", orderEmailRoutes);


/* =========================
   404 HANDLER
========================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/* =========================
   ERROR HANDLER
========================= */

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error.",
    error: err.message,
  });
});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Radhivya backend running on http://localhost:${PORT}`);
});