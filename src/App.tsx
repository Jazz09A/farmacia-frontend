import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

// Components
import { Navbar } from './components/Header/Navbar';
import { Footer } from './components/Footer/Footer';
import { PageLayout } from './components/Layout/PageLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages with Lazy Loading
const HomePage = lazy(() => import('./pages/HomePage'));
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const TrackingPage = lazy(() => import('./pages/TrackingPage'));
// const ContactPage = lazy(() => import('./pages/ContactPage'));

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
import AdminRoute from './components/Admin/AdminRoute';

// Hooks
import { useCart } from './hooks/useCart';
import { useCurrency } from './hooks/useCurrency';
import { AuthProvider } from './hooks/useAuth';

// Component to conditionally render Navbar and Footer with automatic spacing
const ConditionalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      <div className={!isAdminRoute ? 'flex-1 flex flex-col' : ''}>
        <PageLayout>
          {children}
        </PageLayout>
      </div>
      {!isAdminRoute && <Footer />}
    </>
  );
};

// Component for Navbar with conditional rendering
const ConditionalNavbar: React.FC<{
  isScrolled: boolean;
  cartItemsCount: number;
  onCartOpen: () => void;
  currency: 'VES' | 'REF';
  onCurrencyToggle: () => void;
}> = ({ isScrolled, cartItemsCount, onCartOpen, currency, onCurrencyToggle }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) return null;

  return (
    <Navbar
      isScrolled={isScrolled}
      cartItemsCount={cartItemsCount}
      onCartOpen={onCartOpen}
      currency={currency}
      onCurrencyToggle={onCurrencyToggle}
    />
  );
};

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  // const heroRef = useRef<HTMLDivElement>(null);
  
  const cart = useCart();
  const currency = useCurrency();

  // Scroll to top functionality
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen flex flex-col bg-medical-gray-50">
          <ConditionalNavbar
            isScrolled={isScrolled}
            cartItemsCount={cart.totalItems}
            onCartOpen={() => cart.setIsOpen(true)}
            currency={currency.currency}
            onCurrencyToggle={currency.toggleCurrency}
          />
          
          <ConditionalLayout>
            <Suspense fallback={<div className="flex justify-center items-center h-screen">Cargando...</div>}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/catalog" element={<CatalogPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/tracking" element={<TrackingPage />} />

                {/* Blog Routes */}
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogPostDetailPage />} />

                {/* Admin Panel Routes */}
                <Route path="/admin" element={<AdminRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboardPage />} />
                    <Route path="orders" element={<AdminOrdersPage />} />
                    <Route path="customers" element={<AdminCustomersPage />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    <Route path="products/edit/:id" element={<AdminEditProductPage />} />
                    <Route path="analytics" element={<AdminAnalyticsPage />} />

                    {/* Blog Admin Routes */}
                    <Route path="blog" element={<AdminBlogPage />} />
                    <Route path="blog/new" element={<CreateBlogPostPage />} />
                    <Route path="blog/edit/:id" element={<EditBlogPostPage />} />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </ConditionalLayout>
        
          {/* Global Scroll to Top Button - Solo en páginas que no son admin */}
          <ScrollToTopButton showScrollTop={showScrollTop} scrollToTop={scrollToTop} />
        </div>
      </Router>
    </AuthProvider>
  );
}

// Separate component for scroll to top button
const ScrollToTopButton: React.FC<{
  showScrollTop: boolean;
  scrollToTop: () => void;
}> = ({ showScrollTop, scrollToTop }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) return null;

  return (
    <AnimatePresence>
      {showScrollTop && (
        <motion.button
          onClick={scrollToTop}
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
};

export default App;