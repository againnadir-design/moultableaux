import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import FloatingWhatsApp from './components/FloatingWhatsApp';

import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import { AppProvider } from './context/AppContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';

import './index.css';

// ─────────────────────────────
// Lazy Pages (code split)
// ─────────────────────────────
const ShopPage = lazy(() => import('./components/ShopPage'));
const ProductDetailPage = lazy(() => import('./components/ProductDetailPage'));
const ContactPage = lazy(() => import('./components/ContactPage'));
const CustomOrderPage = lazy(() => import('./components/CustomOrderPage'));
const OrderTracking = lazy(() => import('./components/OrderTracking'));
const UserFeedback = lazy(() => import('./components/UserFeedback'));
const CheckoutPage = lazy(() => import('./components/CheckoutPage'));

const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const AdminLoginPage = lazy(() => import('./components/AdminLoginPage'));

// ─────────────────────────────
// Loading UI
// ─────────────────────────────
const Loader = () => (
  <div className="min-h-screen flex items-center justify-center bg-theme-bg">
    <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
  </div>
);

// ─────────────────────────────
// Admin protection
// ─────────────────────────────
function AdminProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) return <Loader />;

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

// ─────────────────────────────
// Public Layout
// ─────────────────────────────
function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 bg-theme-bg text-theme-text">
        {children}
      </main>

      <Footer />
      <CartSidebar />
      <FloatingWhatsApp />
    </div>
  );
}

// ─────────────────────────────
// App
// ─────────────────────────────
function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <CartProvider>
          <AppProvider>
            <AdminAuthProvider>

              <Routes>

                {/* ───── ADMIN ───── */}
                <Route
                  path="/admin/login"
                  element={
                    <Suspense fallback={<Loader />}>
                      <AdminLoginPage />
                    </Suspense>
                  }
                />

                <Route
                  path="/admin"
                  element={
                    <AdminProtectedRoute>
                      <Suspense fallback={<Loader />}>
                        <AdminDashboard />
                      </Suspense>
                    </AdminProtectedRoute>
                  }
                />

                {/* ───── CHECKOUT ───── */}
                <Route
                  path="/checkout"
                  element={
                    <PublicLayout>
                      <Suspense fallback={<Loader />}>
                        <CheckoutPage />
                      </Suspense>
                    </PublicLayout>
                  }
                />

                {/* ───── PUBLIC PAGES ───── */}
                <Route
                  path="/shop"
                  element={
                    <PublicLayout>
                      <Suspense fallback={<Loader />}>
                        <ShopPage />
                      </Suspense>
                    </PublicLayout>
                  }
                />

                <Route
                  path="/product/:id"
                  element={
                    <PublicLayout>
                      <Suspense fallback={<Loader />}>
                        <ProductDetailPage />
                      </Suspense>
                    </PublicLayout>
                  }
                />

                <Route
                  path="/custom"
                  element={
                    <PublicLayout>
                      <Suspense fallback={<Loader />}>
                        <CustomOrderPage />
                      </Suspense>
                    </PublicLayout>
                  }
                />

                <Route
                  path="/contact"
                  element={
                    <PublicLayout>
                      <Suspense fallback={<Loader />}>
                        <ContactPage />
                      </Suspense>
                    </PublicLayout>
                  }
                />

                <Route
                  path="/tracking"
                  element={
                    <PublicLayout>
                      <Suspense fallback={<Loader />}>
                        <OrderTracking />
                      </Suspense>
                    </PublicLayout>
                  }
                />

                <Route
                  path="/feedback"
                  element={
                    <PublicLayout>
                      <Suspense fallback={<Loader />}>
                        <UserFeedback />
                      </Suspense>
                    </PublicLayout>
                  }
                />

                {/* ───── HOME ───── */}
                <Route
                  path="/"
                  element={
                    <PublicLayout>
                      <div className="animate-fade-in">
                        <Hero />
                        <DeliveryInfo />
                        <Categories />
                        <FeaturedProducts />
                        <Reviews />
                        <InstagramReels />
                        <FAQSection />
                      </div>
                    </PublicLayout>
                  }
                />

                {/* ───── FALLBACK ───── */}
                <Route path="*" element={<Navigate to="/" replace />} />

              </Routes>

            </AdminAuthProvider>
          </AppProvider>
        </CartProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
