import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, User as UserIcon, Menu, X, Stethoscope, Shield, Phone, LogOut, Settings, Package } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { User } from '../../services/AuthService';
import { SearchBar } from './SearchBar';
import { CurrencyToggle } from './CurrencyToggle';
import { NavLink } from 'react-router-dom';

interface NavbarProps {
  isScrolled: boolean;
  cartItemsCount: number;
  onCartOpen: () => void;
  currency: 'VES' | 'REF';
  onCurrencyToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isScrolled,
  cartItemsCount,
  onCartOpen,
  currency,
  onCurrencyToggle
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // Don't render Navbar on admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const getUserDisplayName = (u: User | null): string => {
    if (!u) return '';
    if (u.user_type === 'natural') {
      return `${u.first_name} ${u.last_name}`;
    }
    return u.company_name;
  };

  const getUserInitials = (u: User | null): string => {
    if (!u) return '';
    const name = getUserDisplayName(u);
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  };

  // Detectar páginas con fondos claros que necesitan navbar más sólido
  const lightBackgroundPages = ['/catalog', '/cart', '/checkout', '/auth', '/profile'];
  const isLightBackgroundPage = lightBackgroundPages.includes(location.pathname) || 
                                location.pathname.startsWith('/product') ||
                                location.pathname.startsWith('/tracking');

  // Detectar páginas donde ocultar la barra de búsqueda
  const hideSearchBarPages = ['/auth', '/catalog','/cart'];
  const shouldHideSearchBar = hideSearchBarPages.includes(location.pathname) || location.pathname.startsWith('/product');

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Detectar si es mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Cerrar menús al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserMenuOpen) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const menuItems = [
    { name: 'Inicio', href: '/', icon: Stethoscope, isRoute: true },
    { name: 'Catálogo', href: '/catalog', icon: ShoppingCart, isRoute: true },
    { name: 'Blog', href: '/blog', icon: ShoppingCart, isRoute: true },
    { name: 'Contacto', href: '/contacto', icon: ShoppingCart, isRoute: true },
    { name: 'Consulta Online', href: '#consulta', icon: Phone, isRoute: false }
  ];

  // Función para obtener las clases del navbar según el contexto
  const getNavbarClasses = () => {
    // Páginas con fondo claro siempre tendrán fondo sólido
    if (isLightBackgroundPage) {
      return 'bg-white/95 backdrop-blur-xl shadow-medical border-b border-medical-gray-200/50';
    }
    // Con scroll, el fondo es oscuro y translúcido
    if (isScrolled) {
      return 'glass-bg bg-medical-gray-900/80 border-b border-white/10 shadow-lg';
    }
    // Estado inicial transparente
    return 'bg-transparent border-b border-transparent';
  };

  // Función para obtener las clases del logo según el contexto
  const getLogoClasses = () => {
    // En fondos claros o con scroll, el logo es oscuro
    if (isLightBackgroundPage) {
      return {
        iconContainer: 'bg-medical-blue-gradient text-white shadow-medical',
        title: 'text-medical-blue-700',
        subtitle: 'text-medical-gray-600'
      };
    } 
    // Siempre blanco en los demás casos (inicial y con scroll)
    return {
      iconContainer: 'bg-white/20 backdrop-blur-md text-white border border-white/30',
      title: 'text-white',
      subtitle: 'text-white/80'
    };
  };

  // Función para obtener las clases de los elementos de navegación
  const getNavItemClasses = (isActive: boolean) => {
    // En fondos claros, los items son oscuros
    if (isLightBackgroundPage) {
      return isActive
        ? 'text-medical-blue-700 bg-medical-blue-100'
        : 'text-medical-gray-700 hover:text-medical-blue-700 hover:bg-medical-blue-50';
    }
    // Siempre blancos en los demás casos (inicial y con scroll)
    return isActive
      ? 'text-white bg-white/20'
      : 'text-white/90 hover:text-white hover:bg-white/10';
  };

  // Función para obtener las clases de los botones de acción
  const getActionButtonClasses = (type: 'wishlist' | 'cart' | 'user' | 'mobile-menu') => {
    // En fondos claros, los botones son oscuros
    if (isLightBackgroundPage) {
      switch (type) {
        case 'wishlist':
          return 'text-medical-gray-600 hover:text-red-600 hover:bg-red-50 hover:shadow-medical';
        case 'cart':
        case 'user':
          return 'text-medical-gray-600 hover:text-medical-blue-700 hover:bg-medical-blue-50 hover:shadow-medical';
        case 'mobile-menu':
          return 'text-medical-gray-600 hover:text-medical-gray-900 hover:bg-medical-gray-100';
        default:
          return '';
      }
    }
    // Siempre blancos en los demás casos (inicial y con scroll)
    return 'text-white/90 hover:text-white hover:bg-white/10 backdrop-blur-md';
  };

  const logoClasses = getLogoClasses();

  return (
    <>
      <motion.nav
        data-navbar
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-600 ${getNavbarClasses()}`}
        initial={{ y: -100 }}
        animate={{ y: isMobile && isMobileMenuOpen ? '-110%' : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className='bg-medical-blue-gradient'>
          {/* Top Medical Banner - Oculto en mobile para páginas de auth */}
          {!(shouldHideSearchBar && isMobile) && (
            <motion.div
              className={`transition-all duration-500 ${
                isScrolled 
                  ? 'text-white py-1 px-4' 
                  : 'text-white py-2 px-4'
              }`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.5 }}
            >
            <div className="medical-container text-center">
              <motion.p 
                className={`font-medium transition-all duration-300 ${
                  isScrolled ? 'text-xs' : 'text-sm'
                }`}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {isScrolled 
                  ? '🚚 Envío GRATIS +$25 | 📞 0800-FARMA'
                  : '🚚 Envío GRATIS en compras mayores a $25 | 📞 Línea de emergencia 24/7: 0800-FARMA'
                }
              </motion.p>
            </div>
          </motion.div>
          )}
        </div>

        <div className="medical-container">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo Premium */}
            <Link to="/">
              <motion.div
                className="flex-shrink-0 flex items-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className="flex items-center space-x-3">
                  <motion.div
                    className={`rounded-2xl transition-all duration-300 overflow-hidden`}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                  >
                    <img 
                      src="/src/public/logo/Logo.webp" 
                      alt="FarmaPlus Logo" 
                      className="h-20 w-auto object-contain"
                    />
                  </motion.div>
                  <div className="flex flex-col">
                    {/* <div className={`text-2xl font-serif font-bold transition-colors duration-300 ${logoClasses.title}`}>
                      FarmaPlus
                    </div> */}
                    {/* <div className={`text-xs font-medium -mt-1 transition-colors duration-300 ${logoClasses.subtitle}`}>
                      Professional Care
                    </div> */}
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {menuItems.map((item, index) => {
                const isActive = item.isRoute && location.pathname === item.href;
                
                return (
                  <motion.div key={item.name}>
                    {item.isRoute ? (
                      <Link
                        to={item.href}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${getNavItemClasses(isActive)}`}
                      >
                        <motion.div
                          whileHover={{ y: -2, scale: 1.05 }}
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            delay: index * 0.1,
                            type: "spring", 
                            stiffness: 400, 
                            damping: 17 
                          }}
                          className="flex items-center space-x-2"
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </motion.div>
                      </Link>
                    ) : (
                      <a
                        href={item.href}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${getNavItemClasses(false)}`}
                      >
                        <motion.div
                          whileHover={{ y: -2, scale: 1.05 }}
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            delay: index * 0.1,
                            type: "spring", 
                            stiffness: 400, 
                            damping: 17 
                          }}
                          className="flex items-center space-x-2"
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </motion.div>
                      </a>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Search Bar - Desktop */}
            {!shouldHideSearchBar && (
              <div className="hidden lg:block flex-1 max-w-lg mx-8">
                <SearchBar />
              </div>
            )}

            {/* Right side actions */}
            <div className="flex items-center space-x-3">
              {/* Currency Toggle */}
              <div className="hidden sm:block">
                <CurrencyToggle
                  currency={currency}
                  onToggle={onCurrencyToggle}
                  isScrolled={isScrolled || isLightBackgroundPage}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {/* Wishlist */}
                <motion.button
                  className={`p-3 rounded-2xl transition-all duration-300 relative group ${getActionButtonClasses('wishlist')}`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Heart className="h-5 w-5" />
                  <motion.span
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    3
                  </motion.span>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-medical-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">
                      Lista de Deseos
                    </div>
                  </div>
                </motion.button>

                {/* Cart */}
                <Link to="/cart">
                  <motion.button
                    onClick={onCartOpen}
                    className={`relative p-3 rounded-2xl transition-all duration-300 group ${getActionButtonClasses('cart')}`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemsCount > 0 && (
                      <motion.span
                        className="absolute -top-1 -right-1 bg-medical-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      >
                        {cartItemsCount}
                      </motion.span>
                    )}
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-medical-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">
                        Ver Carrito
                      </div>
                    </div>
                  </motion.button>
                </Link>

                {/* User */}
                {isAuthenticated && user ? (
                  <div className="relative">
                    <motion.button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className={`p-3 rounded-2xl transition-all duration-300 group relative ${getActionButtonClasses('user')}`}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <UserIcon className="h-5 w-5" />
                      {/* Indicator de usuario autenticado */}
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-medical-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">
                          Hola, {getUserDisplayName(user).split(' ')[0]}
                        </div>
                      </div>
                    </motion.button>

                    {/* User Dropdown Menu */}
                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 top-full mt-2 w-72 glass-card rounded-2xl shadow-elegant border border-medical-gray-200/50 z-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* User Info Header */}
                          <div className="p-4 border-b border-medical-gray-200/50">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-medical-blue-gradient rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {getUserInitials(user)}
                              </div>
                              <div>
                                <div className="font-semibold text-medical-gray-900">{getUserDisplayName(user)}</div>
                                <div className="text-sm text-medical-gray-600">{user.email}</div>
                                <div className="text-xs text-medical-blue-600 font-medium">
                                  {user.user_type === 'natural' ? 'Persona Natural' : 'Persona Jurídica'}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="p-2">
                            <Link
                              to="/perfil"
                              className="flex items-center space-x-3 p-3 rounded-xl hover:bg-medical-blue-50 transition-colors duration-200 group"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <Settings className="h-4 w-4 text-medical-gray-500 group-hover:text-medical-blue-600" />
                              <span className="text-medical-gray-700 group-hover:text-medical-gray-900">Mi Perfil</span>
                            </Link>

                            <Link
                              to="/mis-pedidos"
                              className="flex items-center space-x-3 p-3 rounded-xl hover:bg-medical-blue-50 transition-colors duration-200 group"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <Package className="h-4 w-4 text-medical-gray-500 group-hover:text-medical-blue-600" />
                              <span className="text-medical-gray-700 group-hover:text-medical-gray-900">Mis Pedidos</span>
                            </Link>

                            <Link
                              to="/favoritos"
                              className="flex items-center space-x-3 p-3 rounded-xl hover:bg-medical-blue-50 transition-colors duration-200 group"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <Heart className="h-4 w-4 text-medical-gray-500 group-hover:text-medical-blue-600" />
                              <span className="text-medical-gray-700 group-hover:text-medical-gray-900">Lista de Deseos</span>
                            </Link>

                            <div className="border-t border-medical-gray-200/50 my-2"></div>

                            <motion.button
                              onClick={async () => {
                                setIsUserMenuOpen(false);
                                await logout();
                                navigate('/');
                              }}
                              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-red-50 transition-colors duration-200 group"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <LogOut className="h-4 w-4 text-red-500" />
                              <span className="text-red-600 group-hover:text-red-700">Cerrar Sesión</span>
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link to="/auth">
                    <motion.button
                      className={`p-3 rounded-2xl transition-all duration-300 group ${getActionButtonClasses('user')}`}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <UserIcon className="h-5 w-5" />
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-medical-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">
                          Iniciar Sesión
                        </div>
                      </div>
                    </motion.button>
                  </Link>
                )}
              </div>

              {/* Mobile menu button */}
              <motion.button
                onClick={() => setIsMobileMenuOpen(true)}
                className={`lg:hidden p-3 rounded-2xl transition-all duration-300 ${getActionButtonClasses('mobile-menu')}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Abrir menú"
              >
                <Menu className="h-6 w-6" />
              </motion.button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {!shouldHideSearchBar && (
            <div className="lg:hidden pb-4">
              <SearchBar />
            </div>
          )}
        </div>
      </motion.nav>

      {/* Enhanced Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)} 
            />
            
            {/* Mobile Menu */}
            <motion.div
              className="fixed right-0 top-0 h-full w-80 max-w-sm glass-card shadow-elegant border-l border-white/30"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="flex justify-between items-center p-6 border-b border-medical-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-xl overflow-hidden">
                      <img 
                        src="/src/public/logo/Logo.webp" 
                        alt="FarmaPlus Logo" 
                        className="h-10 w-auto object-contain"
                      />
                    </div>
                    <div>
                      <div className="text-lg font-serif font-bold text-medical-gray-900">FarmaPlus</div>
                      <div className="text-sm text-medical-gray-600">Professional Care</div>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-full text-medical-gray-600 hover:bg-medical-gray-100 transition-colors"
                    aria-label="Cerrar menú"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.button>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 p-6 space-y-2">
                  {menuItems.map((item, index) => (
                    <motion.a
                      key={item.name}
                      href={item.href}
                      className="flex items-center space-x-3 p-4 rounded-xl text-medical-gray-700 hover:text-medical-blue-700 hover:bg-medical-blue-50 transition-all duration-200 group"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="p-2 bg-medical-blue-50 text-medical-blue-600 rounded-lg group-hover:bg-medical-blue-100 transition-colors duration-200">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{item.name}</span>
                    </motion.a>
                  ))}
                </div>

                {/* Mobile Currency Toggle */}
                <div className="p-6 border-t border-medical-gray-200">
                  <CurrencyToggle
                    currency={currency}
                    onToggle={onCurrencyToggle}
                    isScrolled={true}
                  />
                </div>

                {/* Mobile Footer */}
                <div className="p-6 border-t border-medical-gray-200 bg-medical-blue-50">
                  <div className="text-center">
                    <p className="text-sm text-medical-gray-600 mb-2">
                      ¿Necesitas ayuda médica?
                    </p>
                    <motion.button
                      className="btn-medical-primary w-full"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Consulta Online 24/7
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};