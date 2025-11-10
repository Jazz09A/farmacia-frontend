import React, { useState, useEffect, useLayoutEffect, lazy, Suspense, memo, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

// Components
import { Navbar } from './components/Header/Navbar';
import { Footer } from './components/Footer/Footer';
import { PageLayout } from './components/Layout/PageLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import AdminRoute from './components/Admin/AdminRoute';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import ScrollToTop from './components/ScrollToTop';

// Pages with Lazy Loading
const HomePage = lazy(() => import('./pages/HomePage'));
const WhyUsPage = lazy(() => import('./pages/WhyUsPage'));
const ClienteDrozainkaPage = lazy(() => import('./pages/ClienteDrozainkaPage'));
const ProveedorDrozainkaPage = lazy(() => import('./pages/ProveedorDrozainkaPage'));
const QueremosConocertePage = lazy(() => import('./pages/QueremosConocertePage'));
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const CheckoutQuotePage = lazy(() => import('./pages/CheckoutQuotePage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const QuoteDetailPage = lazy(() => import('./pages/QuoteDetailPage'));
const TrackingPage = lazy(() => import('./pages/TrackingPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const QuoteSuccessPage = lazy(() => import('./pages/QuoteSuccessPage'));
const VerificationRequiredPage = lazy(() => import('./pages/VerificationRequiredPage'));
const EmailVerificationPage = lazy(() => import('./pages/EmailVerificationPage'));
const CreditPage = lazy(() => import('./pages/CreditPage'));
const CreditOrdersPage = lazy(() => import('./pages/CreditOrdersPage'));

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
const CreateProductPage = lazy(() => import('./pages/Admin/CreateProductPage'));
const AdminEditProductPage = lazy(() => import('./pages/Admin/AdminEditProductPage'));
const AdminFlashOffersPage = lazy(() => import('./pages/Admin/AdminFlashOffersPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/Admin/AdminAnalyticsPage'));
const AdminCreditPage = lazy(() => import('./pages/Admin/AdminCreditPage'));
const AdminPaymentsPage = lazy(() => import('./pages/Admin/AdminPaymentsPage'));

// Hooks
import { useCart } from './contexts/CartContext'; 

// Contexts
import { ScrollProvider, useScrollContext } from './contexts/ScrollContext';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { GlobalCurrencyProviderWithAuth } from './contexts/GlobalCurrencyContext';
import { NavbarProvider } from './contexts/NavbarContext';
import { CreditProvider } from './contexts/CreditContext';

const AppLayout = () => {
  const { isScrolled, showScrollTop } = useApp();
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
          <Route path="/verify-email/:token" element={<EmailVerificationPage />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        isScrolled={isScrolled}
        cartItemsCount={cart?.total_items || 0}
      />
      <main id="main-content" className="flex-1 flex flex-col">
        <PageLayout>
          <Suspense fallback={<LoadingSpinner message="Cargando página..." />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/why-us" element={<WhyUsPage />} />
              <Route path="/cliente-drozainka" element={<ClienteDrozainkaPage />} />
              <Route path="/proveedor-drozainka" element={<ProveedorDrozainkaPage />} />
              <Route path="/queremos-conocerte" element={<QueremosConocertePage />} />
              <Route path="/catalog" element={<ProtectedRoute><CatalogPage /></ProtectedRoute>} />
              <Route path="/product/:id" element={<ProtectedRoute><ProductDetailPage /></ProtectedRoute>} />
              <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/checkout/quote" element={<ProtectedRoute><CheckoutQuotePage /></ProtectedRoute>} />
              <Route path="/order-success" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
              <Route path="/checkout/quote/success" element={<ProtectedRoute><QuoteSuccessPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/profile/quotes" element={<Navigate to="/profile" state={{ defaultTab: 'cotizaciones' }} replace />} />
              <Route path="/profile/quotes/:quoteId" element={<ProtectedRoute><QuoteDetailPage /></ProtectedRoute>} />
              <Route path="/tracking/:orderId" element={<ProtectedRoute><TrackingPage /></ProtectedRoute>} />
              <Route path="/credit" element={<ProtectedRoute><CreditPage /></ProtectedRoute>} />
              <Route path="/credit/orders" element={<ProtectedRoute><CreditOrdersPage /></ProtectedRoute>} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostDetailPage />} />
              <Route path="/verify-account" element={<VerificationRequiredPage />} />
              <Route path="/verify-email/:token" element={<EmailVerificationPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </PageLayout>
      </main>
      <Footer />
      <OptimizedScrollToTopButton showScrollTop={showScrollTop} />
    </div>
  );
};

// Hook personalizado para evitar pasar props repetidamente
const useApp = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 100);
      setShowScrollTop(scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { isScrolled, showScrollTop };
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
    <Routes>
      <Route path="/*" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/create" element={<CreateProductPage />} />
        <Route path="products/edit/:id" element={<AdminEditProductPage />} />
        <Route path="flash-offers" element={<AdminFlashOffersPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="credit" element={<AdminCreditPage />} />
        <Route path="payments" element={<AdminPaymentsPage />} />
        <Route path="blog" element={<AdminBlogPage />} />
        <Route path="blog/new" element={<CreateBlogPostPage />} />
        <Route path="blog/edit/:id" element={<EditBlogPostPage />} />
      </Route>
    </Routes>
  </AdminRoute>
);

// Component to handle different container styles for admin vs public routes
const AppContainer = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <div className={`App w-full bg-medical-gray-50 relative ${
      isAdminRoute ? '' : 'min-h-screen'
    }`}>
      <AppLayout />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <GlobalCurrencyProviderWithAuth>
          <ScrollProvider>
            <ScrollToTop />
            <NavbarProvider>
              <CartProvider>
                <CreditProvider>
                  <AppContainer />
                </CreditProvider>
              </CartProvider>
            </NavbarProvider>
          </ScrollProvider>
        </GlobalCurrencyProviderWithAuth>
      </AuthProvider>
    </Router>
  );
}

export default App;
