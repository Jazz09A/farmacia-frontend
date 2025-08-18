import React, { useState, useEffect, lazy, Suspense, memo, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

// Components
import { Navbar } from './components/Header/Navbar';
import { Footer } from './components/Footer/Footer';
import { PageLayout } from './components/Layout/PageLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import AdminRoute from './components/Admin/AdminRoute';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Pages with Lazy Loading
const HomePage = lazy(() => import('./pages/HomePage'));
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const TrackingPage = lazy(() => import('./pages/TrackingPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const VerificationRequiredPage = lazy(() => import('./pages/VerificationRequiredPage'));

// Blog Pages with Lazy Loading
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostDetailPage = lazy(() => import('./pages/BlogPostDetailPage'));

// Admin Panel Imports with Lazy Loading
const AdminLayout = lazy(() => import('./pages/Admin/AdminLayout'));
const AdminDashboardPage = lazy(() => import('./pages/Admin/AdminDashboardPage'));
const AdminOrdersPage = lazy(() => import('./pages/Admin/AdminOrdersPage'));
const AdminBlogPage = lazy(() => import('./pages/Admin/AdminBlogPage'));
const CreateBlogPostPage = lazy(() => import('./pages/Admin/CreateBlogPostPage'));
const EditBlogPostPage = lazy(() => import('./pages/Admin/EditBlogPostPage'));
const AdminCustomersPage = lazy(() => import('./pages/Admin/AdminCustomersPage'));
const AdminProductsPage = lazy(() => import('./pages/Admin/AdminProductsPage'));
const AdminEditProductPage = lazy(() => import('./pages/Admin/AdminEditProductPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/Admin/AdminAnalyticsPage'));

// Hooks
import { useCurrency } from './hooks/useCurrency';
import { useCart } from './contexts/CartContext'; 

// Contexts
import { ScrollProvider, useScrollContext } from './contexts/ScrollContext';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';

const AppLayout = () => {
  const { isScrolled, showScrollTop, currency } = useApp();
  const { cart } = useCart();
  const location = useLocation();
  const isAuthRoute = location.pathname.startsWith('/auth');
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAuthRoute || isAdminRoute) {
    return (
      <Suspense fallback={<LoadingSpinner message="Cargando página..." />}>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/verify-account" element={<VerificationRequiredPage />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <>
      <Navbar
        isScrolled={isScrolled}
        cartItemsCount={cart?.total_items || 0}
        currency={currency.currency}
        onCurrencyToggle={currency.toggleCurrency}
      />
      <div className="flex-1 flex flex-col w-full max-w-full">
        <PageLayout>
          <Suspense fallback={<LoadingSpinner message="Cargando página..." />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/catalog" element={<ProtectedRoute><CatalogPage /></ProtectedRoute>} />
              <Route path="/product/:id" element={<ProtectedRoute><ProductDetailPage /></ProtectedRoute>} />
              <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/order-success" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/tracking" element={<ProtectedRoute><TrackingPage /></ProtectedRoute>} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostDetailPage />} />
              <Route path="/verify-account" element={<VerificationRequiredPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </PageLayout>
      </div>
      <Footer />
      <OptimizedScrollToTopButton showScrollTop={showScrollTop} />
    </>
  );
};

// Hook personalizado para evitar pasar props repetidamente
const useApp = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const currency = useCurrency();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 100);
      setShowScrollTop(scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { isScrolled, showScrollTop, currency };
}

// Optimized component for scroll button to avoid re-renders
const OptimizedScrollToTopButton: React.FC<{
  showScrollTop: boolean;
}> = memo(({ showScrollTop }) => {
  const location = useLocation();
  const { scrollToTop } = useScrollContext();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const handleClick = useCallback(() => {
    scrollToTop({ smooth: true });
  }, [scrollToTop]);

  if (isAdminRoute) return null;

  return (
    <AnimatePresence>
      {showScrollTop && (
        <motion.button
          onClick={handleClick}
          className="fixed bottom-8 right-8 z-40 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
});

OptimizedScrollToTopButton.displayName = 'OptimizedScrollToTopButton';

const AdminRoutes = () => (
  <AdminRoute>
    <AdminLayout>
      <Suspense fallback={<LoadingSpinner message="Cargando página..." />}>
        <Routes>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="products/edit/:id" element={<AdminEditProductPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="blog" element={<AdminBlogPage />} />
          <Route path="blog/new" element={<CreateBlogPostPage />} />
          <Route path="blog/edit/:id" element={<EditBlogPostPage />} />
        </Routes>
      </Suspense>
    </AdminLayout>
  </AdminRoute>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollProvider>
          <CartProvider>
            <ScrollToTop />
            <div className="App min-h-screen w-full flex flex-col bg-medical-gray-50 relative pb-16">
              <AppLayout />
            </div>
          </CartProvider>
        </ScrollProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
