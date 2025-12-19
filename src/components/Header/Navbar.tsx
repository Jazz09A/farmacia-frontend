import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, User as UserIcon, Menu, X, Stethoscope, Phone, LogOut, HelpCircle, Briefcase, Tag, BookText, Shield } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Updated import
import { useNavbar } from '../../contexts/NavbarContext';
import { useGlobalCurrency } from '../../contexts/GlobalCurrencyContext';
import type { User } from '../../types/auth';
// import { SearchBar } from './SearchBar';
import ExchangeRateDisplay from './ExchangeRateDisplay';
import { SimpleSearchInput } from '../common/SimpleSearchInput';
import logoSrc from '../../public/logo/Logo.webp';

interface NavbarProps {
  isScrolled?: boolean;
  cartItemsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  isScrolled = false,
  cartItemsCount,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { isNavbarVisible } = useNavbar();
  // const { currency, toggleCurrency, exchangeRates } = useGlobalCurrency();

  // Don't render Navbar on admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const getUserDisplayName = (u: User | null): string => {
    if (!u) return '';
    return u.company_name || '';
  };

  const getUserInitials = (u: User | null): string => {
    if (!u) return '';
    const name = getUserDisplayName(u);
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  };

  const lightBackgroundPages = ['/catalog', '/cart', '/checkout', '/checkout/quote', '/auth', '/profile', '/blog'];
  const isLightBackgroundPage = lightBackgroundPages.includes(location.pathname) || 
                                location.pathname.startsWith('/product') ||
                                location.pathname.startsWith('/tracking') ||
                                location.pathname.startsWith('/blog');

  const hideSearchBarPages = ['/auth', '/catalog','/cart', '/checkout/quote'];
  const shouldHideSearchBar = hideSearchBarPages.includes(location.pathname) || location.pathname.startsWith('/product');

  const getMobileOptimizedTransition = useCallback((baseTransition: any) => {
    if (isMobile) {
      return {
        ...baseTransition,
        type: "tween",
        ease: "easeOut",
        duration: baseTransition.duration ? Math.min(baseTransition.duration, 0.25) : 0.25
      };
    }
    return baseTransition;
  }, [isMobile]);

  useEffect(() => {
    if (isMobileMenuOpen || isUserMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen, isUserMenuOpen]);


  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 1024);
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      if (isUserMenuOpen) setIsUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const menuItems = [
    { name: 'INICIO', href: '/', icon: Stethoscope },
    { name: '¿POR QUÉ NOSOTROS?', href: '/why-us', icon: HelpCircle },
    { name: 'CATÁLOGO', href: '/catalog', icon: ShoppingCart },
    { name: 'CONVERTIRSE EN CLIENTE DROZAINKA', href: '/cliente-drozainka', icon: UserIcon },
    { name: '¿QUIERES SER PROVEEDOR DROZAINKA?', href: '/proveedor-drozainka', icon: Briefcase },
    { name: 'BLOG', href: '/blog', icon: BookText },
    { name: 'TRABAJA CON NOSOTROS', href: '/trabaja-con-nosotros', icon: Briefcase },
  ];

  const getNavbarClasses = () => {
    const baseClasses = 'bg-white/95 backdrop-blur-xl border-b border-medical-gray-200/50';
    const shadowClass = isNavbarVisible ? 'shadow-medical' : 'shadow-none';
    
    if (isLightBackgroundPage || isScrolled) {
      return `${baseClasses} ${shadowClass}`;
    }
    return `${baseClasses} ${shadowClass}`;
  };

  const getNavItemClasses = (isActive: boolean) => {
    const baseClasses = 'text-medical-blue-900 hover:text-medical-blue-700 hover:bg-medical-blue-50';
    const activeClasses = 'text-medical-blue-700 bg-medical-blue-100';
    return isActive ? activeClasses : baseClasses;
  };

  const getActionButtonClasses = () => {
    return 'text-medical-blue-900 hover:text-medical-blue-700 hover:bg-medical-blue-50 hover:shadow-medical';
  };
  
  return (
    <>
      <motion.nav
        data-navbar
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${getNavbarClasses()} ${
          !isNavbarVisible ? 'pointer-events-none' : ''
        } ${isMobileMenuOpen ? 'lg:block hidden' : 'block'}`} 
        style={{ 
          transitionDuration: isMobile ? '200ms' : '600ms',
          willChange: 'transform',
          maxWidth: '100vw'
        }}
        initial={{ y: -100 }}
        animate={{ 
          y: isNavbarVisible ? 0 : -100,
          opacity: isNavbarVisible ? 1 : 0,
          filter: isNavbarVisible ? 'blur(0px)' : 'blur(4px)'
        }}
        transition={{
          y: { type: "spring", stiffness: 300, damping: 30, duration: 0.3 },
          opacity: { duration: 0.2, ease: "easeInOut" },
          filter: { duration: 0.2, ease: "easeInOut" }
        }}
      >
        {/* Banner de distribución nacional - Solo visible en home page */}
        {location.pathname === '/' && (
          <div className='bg-medical-blue-gradient'>
            {!(shouldHideSearchBar && isMobile) && (
              <motion.div
                className={`transition-all ${isScrolled ? 'text-white py-1 px-4' : 'text-white py-2 px-4'}`}
                style={{ transitionDuration: isMobile ? '200ms' : '500ms' }}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={getMobileOptimizedTransition({ duration: 0.3 })}
              >
              <div className="medical-container text-center">
                <motion.p 
                  className={`font-medium transition-all ${isScrolled ? 'text-xs' : 'text-sm'}`}
                  style={{ transitionDuration: isMobile ? '200ms' : '300ms' }}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={getMobileOptimizedTransition({ delay: 0.1 })}
                >
                  {isScrolled 
                    ? '🚚 Distribución NACIONAL | 📞 0800-DROZAINKA'
                    : "🚚 Distribución a Toda Venezuela | 📞 Atención comercial: 0424-1806018"
                  }
                </motion.p>
              </div>
            </motion.div>
            )}
          </div>
        )}

        <div className="medical-container">
          <div className="flex justify-between items-center h-14 lg:h-18">
            <div className="flex items-center flex-shrink-0">
              <Link to="/" className="-m-1.5 p-1.5">
                <span className="sr-only">Grupo Drozainka</span>
                <img
                  src={logoSrc}
                  alt="Grupo Drozainka Logo"
                  className="h-12 lg:h-18 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Desktop Navigation Menu */}
            <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center px-8">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link key={item.name} to={item.href}>
                    <motion.div
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${getNavItemClasses(isActive)}`}
                      whileHover={{ y: -2, scale: 1.05 }}
                    >
                      {item.name}
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center flex-shrink-0 space-x-2 lg:space-x-3">
              {/* Exchange Rate Display - Fusionado con Currency Toggle */}
              <div className="hidden lg:block">
                <ExchangeRateDisplay />
              </div>

              {/* Cart and User Actions */}
              <div className="flex items-center space-x-1 lg:space-x-2">
                <Link to="/cart" className="relative">
                  <motion.button
                    className={`relative p-2 lg:p-3 rounded-2xl transition-all duration-300 group ${getActionButtonClasses()}`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ShoppingCart className="h-5 w-5 lg:h-6 lg:w-6" />
                    {cartItemsCount > 0 && (
                      <span
                        className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] lg:text-xs font-bold rounded-full min-w-[18px] h-[18px] lg:min-w-[20px] lg:h-5 px-1 flex items-center justify-center shadow-lg z-50 border-2 border-white pointer-events-none"
                      >
                        {cartItemsCount > 99 ? '99+' : cartItemsCount}
                      </span>
                    )}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <div className="bg-medical-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">Ver Carrito</div>
                    </div>
                  </motion.button>
                </Link>

                {isAuthenticated && user ? (
                  <>
                    {/* Desktop: Menú desplegable tradicional */}
                    <div className="hidden lg:block relative">
                      <motion.button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className={`p-2 lg:p-3 rounded-2xl transition-all duration-300 group relative ${getActionButtonClasses()}`}
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <UserIcon className="h-5 w-5" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="bg-medical-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">Hola, {getUserDisplayName(user).split(' ')[0]}</div>
                        </div>
                      </motion.button>
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
                            <div className="p-4 border-b border-medical-gray-200/50">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-medical-blue-gradient rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">{getUserInitials(user)}</div>
                                <div className="min-w-0 flex-1">
                                  <div className="font-semibold text-medical-gray-900 text-base truncate">{getUserDisplayName(user)}</div>
                                  <div className="text-sm text-medical-gray-600 truncate">{user.email}</div>
                                  <div className="text-xs text-medical-blue-600 font-medium truncate">Cliente Comercial (Farmacia)</div>
                                </div>
                              </div>
                            </div>
                            <div className="p-2">
                              {user && (user.role === 'super_admin' || user.role === 'admin') && (
                                <Link to="/admin" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-medical-blue-50 transition-colors duration-200 group" onClick={() => setIsUserMenuOpen(false)}>
                                  <Shield className="h-4 w-4 text-medical-gray-500 group-hover:text-medical-blue-600 flex-shrink-0" />
                                  <span className="text-base text-medical-gray-700 group-hover:text-medical-gray-900">Admin</span>
                                </Link>
                              )}
                              <Link to="/profile" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-medical-blue-50 transition-colors duration-200 group" onClick={() => setIsUserMenuOpen(false)}>
                                <UserIcon className="h-4 w-4 text-medical-gray-500 group-hover:text-medical-blue-600 flex-shrink-0" />
                                <span className="text-base text-medical-gray-700 group-hover:text-medical-gray-900">Mi Perfil</span>
                              </Link>
                              <div className="border-t border-medical-gray-200/50 my-2"></div>
                              <motion.button
                                onClick={async () => {
                                  setIsLoggingOut(true);
                                  setTimeout(async () => {
                                    setIsUserMenuOpen(false);
                                    await logout();
                                    navigate('/');
                                    setIsLoggingOut(false);
                                  }, 500);
                                }}
                                className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-red-50 transition-colors duration-200 group"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isLoggingOut}
                              >
                                {isLoggingOut ? (
                                  <LoadingSpinner variant="button" size="sm" className="text-red-500" />
                                ) : (
                                  <LogOut className="h-4 w-4 text-red-500 flex-shrink-0" />
                                )}
                                <span className="text-base text-red-600 group-hover:text-red-700">
                                  {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
                                </span>
                              </motion.button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Mobile: Botón del avatar */}
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className={`lg:hidden p-2 rounded-2xl transition-all duration-300 relative ${getActionButtonClasses()}`}
                      aria-label="Abrir menú de usuario"
                    >
                      <UserIcon className="h-5 w-5 text-medical-blue-900" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </button>

                    {/* Mobile: Menú desplegable debajo del navbar */}
                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <>
                          {/* Backdrop - Cubre toda la página sin blur */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen bg-black/60 z-[55] lg:hidden"
                            style={{ 
                              margin: 0,
                              padding: 0
                            }}
                            onClick={() => setIsUserMenuOpen(false)}
                          />
                          
                          {/* Menú móvil - Posicionado debajo del navbar, ancho limitado */}
                          <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed top-[56px] right-4 w-[320px] max-w-[calc(100vw-2rem)] bg-white shadow-2xl z-[60] lg:hidden rounded-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Header con información del usuario y botón cerrar */}
                            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
                              <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-medical-blue-gradient rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl flex-shrink-0 shadow-md">
                                  {getUserInitials(user)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="font-bold text-gray-900 text-base sm:text-lg truncate">{getUserDisplayName(user)}</div>
                                  <div className="text-sm sm:text-base text-gray-600 truncate mt-0.5">{user.email}</div>
                                  <div className="text-xs sm:text-sm text-medical-blue-600 font-semibold truncate mt-1">Cliente Comercial (Farmacia)</div>
                                </div>
                              </div>
                              <button
                                onClick={() => setIsUserMenuOpen(false)}
                                className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors flex-shrink-0 shadow-sm min-w-[44px] min-h-[44px] flex items-center justify-center"
                                aria-label="Cerrar menú"
                              >
                                <X className="h-6 w-6" />
                              </button>
                            </div>

                            {/* Opciones del menú - Botones grandes y accesibles */}
                            <div className="p-4 sm:p-5 space-y-3">
                              {user && (user.role === 'super_admin' || user.role === 'admin') && (
                                <Link
                                  to="/admin"
                                  className="flex items-center space-x-4 p-4 sm:p-5 rounded-xl bg-white border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50 active:bg-blue-100 transition-all duration-200 group min-h-[64px] w-full shadow-sm hover:shadow-md"
                                  onClick={() => setIsUserMenuOpen(false)}
                                >
                                  <div className="p-2.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors flex-shrink-0">
                                    <Shield className="h-6 w-6 text-blue-600" />
                                  </div>
                                  <span className="text-base sm:text-lg font-semibold text-gray-800 group-hover:text-blue-700">Admin</span>
                                </Link>
                              )}
                              <Link
                                to="/profile"
                                className="flex items-center space-x-4 p-4 sm:p-5 rounded-xl bg-white border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50 active:bg-blue-100 transition-all duration-200 group min-h-[64px] w-full shadow-sm hover:shadow-md"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <div className="p-2.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors flex-shrink-0">
                                  <UserIcon className="h-6 w-6 text-blue-600" />
                                </div>
                                <span className="text-base sm:text-lg font-semibold text-gray-800 group-hover:text-blue-700">Mi Perfil</span>
                              </Link>
                              <div className="border-t-2 border-gray-200 my-4"></div>
                              <motion.button
                                onClick={async () => {
                                  setIsLoggingOut(true);
                                  setTimeout(async () => {
                                    setIsUserMenuOpen(false);
                                    await logout();
                                    navigate('/');
                                    setIsLoggingOut(false);
                                  }, 500);
                                }}
                                className="w-full flex items-center space-x-4 p-4 sm:p-5 rounded-xl bg-white border-2 border-red-100 hover:border-red-300 hover:bg-red-50 active:bg-red-100 transition-all duration-200 group min-h-[64px] shadow-sm hover:shadow-md"
                                whileTap={{ scale: 0.98 }}
                                disabled={isLoggingOut}
                              >
                                <div className="p-2.5 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors flex-shrink-0">
                                  {isLoggingOut ? (
                                    <LoadingSpinner variant="button" size="sm" className="text-red-600" />
                                  ) : (
                                    <LogOut className="h-6 w-6 text-red-600" />
                                  )}
                                </div>
                                <span className="text-base sm:text-lg font-semibold text-red-600 group-hover:text-red-700">
                                  {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
                                </span>
                              </motion.button>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link to="/auth">
                    <motion.button
                      className={`p-2 lg:p-3 rounded-2xl transition-all duration-300 group ${getActionButtonClasses()}`}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <UserIcon className="h-5 w-5" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-medical-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">Iniciar Sesión</div>
                      </div>
                    </motion.button>
                  </Link>
                )}
              </div>
              <motion.button
                onClick={() => setIsMobileMenuOpen(true)}
                className={`lg:hidden p-2 lg:p-3 rounded-2xl transition-all duration-300 ${getActionButtonClasses()}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Abrir menú"
              >
                <Menu className="h-6 w-6" />
              </motion.button>
            </div>
          </div>
          {!shouldHideSearchBar && (
            <div className="lg:hidden pb-4">
              <SimpleSearchInput
                placeholder="Buscar medicamentos..."
                className="w-full"
                showSuggestions={true}
                isScrolled={isScrolled || isLightBackgroundPage}
              />
            </div>
          )}
        </div>
      </motion.nav>



      {/* Enhanced Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div className="fixed inset-0 z-40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div className="fixed right-0 top-0 h-full w-[280px] max-w-[85vw] sm:w-80 sm:max-w-sm glass-card shadow-elegant border-l border-white/30" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
              <div className="flex flex-col h-full">
                {/* Header fijo - Compacto para móviles */}
                <div className="flex justify-between items-center p-4 sm:p-6 border-b border-medical-gray-200 flex-shrink-0">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className="rounded-xl overflow-hidden flex-shrink-0"><img src={logoSrc} alt="Grupo Drozainka Logo" className="h-7 sm:h-8 w-auto object-contain" /></div>
                    <div className="min-w-0">
                      <div className="text-base sm:text-lg font-serif font-bold text-medical-gray-900 truncate">Grupo Drozainka</div>
                      <div className="text-xs sm:text-sm text-medical-gray-600 truncate">Professional Care</div>
                    </div>
                  </div>
                  <motion.button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full text-medical-gray-600 hover:bg-medical-gray-100 transition-colors flex-shrink-0" aria-label="Cerrar menú" whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}>
                    <X className="h-5 w-5 sm:h-6 sm:w-6" />
                  </motion.button>
                </div>
                
                {/* Contenido scrolleable - Optimizado para móviles */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <div className="p-4 sm:p-6 space-y-1.5 sm:space-y-2">
                    {menuItems.map((item, index) => (
                      <motion.a key={item.name} href={item.href} className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-xl text-medical-gray-700 hover:text-medical-blue-700 hover:bg-medical-blue-50 transition-all duration-200 group" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="p-1.5 sm:p-2 bg-medical-blue-50 text-medical-blue-600 rounded-lg group-hover:bg-medical-blue-100 transition-colors duration-200 flex-shrink-0">
                          <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <span className="font-medium text-sm sm:text-base truncate">{item.name}</span>
                      </motion.a>
                    ))}
                  </div>
                </div>
                
                {/* Footer fijo - Compacto para móviles */}
                <div className="flex-shrink-0">
                  <div className="p-4 sm:p-6 border-t border-medical-gray-200 bg-medical-blue-50">
                    <div className="text-center">
                      <p className="text-xs sm:text-sm text-medical-gray-600 mb-2">¿Necesitas asesoría comercial?</p>
                      <motion.button className="btn-medical-primary w-full text-sm sm:text-base py-2.5 sm:py-3" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Contacto Comercial 24/7</motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLoggingOut && (
          <motion.div
            key="logout-overlay"
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-white/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="rounded-3xl border border-medical-gray-200 bg-white px-10 py-8 text-center shadow-elegant"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <LoadingSpinner
                variant="inline"
                size="lg"
                message="Cerrando sesión..."
                submessage="Estamos asegurando tus datos antes de salir"
                className="py-0"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
