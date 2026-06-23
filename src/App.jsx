import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import DeliveryInfo from './components/DeliveryInfo';
import Categories from './components/Categories';
import FeaturedProducts from './components/FeaturedProducts';
import InstagramReels from './components/InstagramReels';
import Reviews from './components/Reviews';
import FAQSection from './components/FAQSection';

import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import CheckoutPage from './components/CheckoutPage';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import { AppProvider, useApp } from './context/AppContext';
import './index.css';

// Page Views - lazily loaded (code-split for smaller initial bundle)
const ShopPage = lazy(() => import('./components/ShopPage'));
const ProductDetailPage = lazy(() => import('./components/ProductDetailPage'));
const ContactPage = lazy(() => import('./components/ContactPage'));
const CustomOrderPage = lazy(() => import('./components/CustomOrderPage'));
const OrderTracking = lazy(() => import('./components/OrderTracking'));
const UserFeedback = lazy(() => import('./components/UserFeedback'));

// Admin - lazily loaded (code-split, only loaded when visiting /admin)
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const AdminLoginPage = lazy(() => import('./components/AdminLoginPage'));

// Admin
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';

function PublicLayout() {
  const { page } = useApp();
  const location = useLocation();
  const isCheckout = location.pathname === '/checkout';

  const pageFallback = (
    <div className="min-h-screen flex items-center justify-center bg-theme-bg">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-theme-muted text-xs font-bold uppercase tracking-wider">Chargement...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 bg-theme-bg text-theme-text transition-colors duration-300">
        {isCheckout ? (
          <Suspense fallback={pageFallback}>
            <CheckoutPage />
          </Suspense>
        ) : (
          <Suspense fallback={pageFallback}>
            {page === 'home' && (
              <div className="animate-fade-in">
                <Hero />
                <DeliveryInfo />
                <Categories />
                <FeaturedProducts />
                <Reviews />
                <InstagramReels />
                <FAQSection />
              </div>
            )}

            {page === 'shop' && <ShopPage />}
            {page === 'product' && <ProductDetailPage />}
            {page === 'custom' && <CustomOrderPage />}
            {page === 'contact' && <ContactPage />}
            {page === 'admin' && <Navigate to="/admin" replace />}
            {page === 'tracking' && <OrderTracking />}
            {page === 'feedback' && <UserFeedback />}
          </Suspense>
        )}
      </main>

      <Footer />
      <CartSidebar />
      <FloatingWhatsApp />
    </div>
  );
}

function AdminProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-bg">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-theme-muted text-xs font-bold uppercase tracking-wider">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <CartProvider>
          <AppProvider>
            <AdminAuthProvider>
              <Routes>
              {/* Admin routes — no Navbar/Footer, separate layout */}
              <Route path="/admin/login" element={
                <Suspense fallback={
                  <div className="min-h-screen flex items-center justify-center bg-theme-bg">
                    <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                }>
                  <AdminLoginPage />
                </Suspense>
              } />
              <Route path="/admin" element={
                <AdminProtectedRoute>
                  <Suspense fallback={
                    <div className="min-h-screen flex items-center justify-center bg-theme-bg">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-theme-muted text-xs font-bold uppercase tracking-wider">Chargement...</p>
                      </div>
                    </div>
                  }>
                    <AdminDashboard />
                  </Suspense>
                </AdminProtectedRoute>
              } />

              {/* Public routes — existing layout preserved */}
              <Route path="/checkout" element={<PublicLayout />} />
              <Route path="*" element={<PublicLayout />} />
            </Routes>
          </AdminAuthProvider>
        </AppProvider>
      </CartProvider>
    </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
