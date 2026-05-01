import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Premium3DBackground from "./components/Premium3DBackground.jsx";

import HomePage from "./pages/HomePage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import NewArrivalsPage from "./pages/NewArrivalsPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";

import CustomerLoginPage from "./pages/CustomerLoginPage.jsx";
import CustomerSignupPage from "./pages/CustomerSignupPage.jsx";
import AdminLoginPage from "./pages/AdminLoginPage.jsx";
import StaffLoginPage from "./pages/StaffLoginPage.jsx";

import AdminPortalPage from "./pages/AdminPortalPage.jsx";
import StaffPortalPage from "./pages/StaffPortalPage.jsx";

import CartPage from "./pages/CartPage.jsx";
import WishlistPage from "./pages/WishlistPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import PaymentPage from "./pages/PaymentPage.jsx";
import InvoicePage from "./pages/InvoicePage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ChatBot from "./components/ChatBot.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Premium3DBackground />
      <ChatBot />
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/about" element={<AboutPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/shop" element={<Navigate to="/products" replace />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/new-arrivals" element={<NewArrivalsPage />} />
        <Route path="/contact" element={<ContactPage />} />

        <Route path="/login" element={<CustomerLoginPage />} />
        <Route path="/signup" element={<CustomerSignupPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/staff-login" element={<StaffLoginPage />} />

        <Route path="/admin" element={<AdminPortalPage />} />
        <Route path="/staff" element={<StaffPortalPage />} />

        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/invoice" element={<InvoicePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/ChatBot" element={<ChatBot />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}