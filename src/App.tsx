import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

// Components
import { Navbar } from './components/Header/Navbar';
import { Footer } from './components/Footer/Footer';
import { PageLayout } from './components/Layout/PageLayout';

// Pages
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import TrackingPage from './pages/TrackingPage';
// import ContactPage from './pages/ContactPage';

// Blog Pages
import BlogPage from './pages/BlogPage';
import BlogPostDetailPage from './pages/BlogPostDetailPage';

// Importaciones del Panel de Administración
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import AdminOrdersPage from './pages/Admin/AdminOrdersPage';
import AdminBlogPage from './pages/Admin/AdminBlogPage';
import CreateBlogPostPage from './pages/Admin/CreateBlogPostPage';
import EditBlogPostPage from './pages/Admin/EditBlogPostPage';
import AdminRoute from './components/Admin/AdminRoute';

// Hooks
import { useCart } from './hooks/useCart';
import { useCurrency } from './hooks/useCurrency';
import { AuthProvider } from './hooks/useAuth';

// Data
import { mockProducts } from './data/mockData';

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
  const heroRef = useRef<HTMLDivElement>(null);
  
  const cart = useCart();
  const currency = useCurrency();

  // Handle add to cart
  const handleAddToCart = (productId: string, quantity: number = 1) => {
    const product = mockProducts.find(p => p.id === productId);
    if (product) {
      cart.addItem(product, quantity);
    }
  };

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
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/tracking" element={<TrackingPage />} />
              {/* <Route path="/contacto" element={<ContactPage />} /> */}

              {/* Rutas del Blog para usuarios */}
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostDetailPage />} />

              {/* Rutas del Panel de Administración */}
              <Route path="/admin" element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<Navigate to="dashboard" />} />
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  
                  {/* Rutas del Blog en el Admin Panel */}
                  <Route path="blog" element={<AdminBlogPage />} />
                  <Route path="blog/new" element={<CreateBlogPostPage />} />
                  <Route path="blog/edit/:id" element={<EditBlogPostPage />} />
                </Route>
              </Route>
            </Routes>
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