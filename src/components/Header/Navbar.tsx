import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, User as UserIcon, Menu, X, Stethoscope, Phone, LogOut, HelpCircle, Briefcase, Tag, BookText, Shield } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Updated import
import { useNavbar } from '../../contexts/NavbarContext';
import type { User } from '../../types/auth';
import { SearchBar } from './SearchBar';
import { CurrencyToggle } from './CurrencyToggle';
import logoSrc from '../../public/logo/Logo.webp';

interface NavbarProps {
  isScrolled: boolean;
  cartItemsCount: number;
  currency: 'VES' | 'REF';
  onCurrencyToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isScrolled,
  cartItemsCount,
  currency,
  onCurrencyToggle,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { isNavbarVisible } = useNavbar();

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

  const lightBackgroundPages = ['/catalog', '/cart', '/checkout', '/auth', '/profile', '/blog'];
  const isLightBackgroundPage = lightBackgroundPages.includes(location.pathname) || 
                                location.pathname.startsWith('/product') ||
                                location.pathname.startsWith('/tracking') ||
                                location.pathname.startsWith('/blog');

  const hideSearchBarPages = ['/auth', '/catalog','/cart'];
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
    if (isMobileMenuOpen || isDesktopMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen, isDesktopMenuOpen]);


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
    { name: 'Inicio', href: '/', icon: Stethoscope },
    { name: '¿Por qué nosotros?', href: '/porque-nosotros', icon: HelpCircle },
    { name: 'Catálogo', href: '/catalog', icon: ShoppingCart },
    { name: 'Cliente Drozainka', href: '/cliente-drozainka', icon: UserIcon },
    { name: 'Proveedor Drozainka', href: '/proveedor-drozainka', icon: Briefcase },
    { name: 'Nuestras marcas', href: '/marcas', icon: Tag },
    { name: 'Blog', href: '/blog', icon: BookText },
    { name: 'Contáctanos', href: '/contacto', icon: Phone },
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
                    : '🚚 Distribución Nacional para Farmacias | 📞 Atención comercial 24/7: 0800-DROZAINKA'
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
              <div className="hidden lg:flex items-center mr-4">
                <motion.button
                  onClick={() => setIsDesktopMenuOpen(true)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${getNavItemClasses(false)}`}
                  whileHover={{ y: -2, scale: 1.05 }}
                >
                  <Menu className="h-5 w-5" />
                  <span>Menú</span>
                </motion.button>
              </div>
              <Link to="/" className="-m-1.5 p-1.5">
                <span className="sr-only">Grupo Drozainka</span>
                <img
                  src={logoSrc}
                  alt="Grupo Drozainka Logo"
                  className="h-12 lg:h-16 w-auto object-contain"
                />
              </Link>
            </div>

            {!shouldHideSearchBar && (
              <div className="hidden lg:flex flex-1 justify-center px-8">
                <div className="w-full max-w-lg">
                  <SearchBar isScrolled={isScrolled || isLightBackgroundPage} />
                </div>
              </div>
            )}

            <div className="flex items-center flex-shrink-0 space-x-2 lg:space-x-3">
              <div className="hidden sm:block">
                <CurrencyToggle
                  currency={currency}
                  onToggle={onCurrencyToggle}
                  isScrolled={isScrolled || isLightBackgroundPage}
                />
              </div>

              <div className="flex items-center space-x-1 lg:space-x-2">
                <Link to="/cart">
                  <motion.button
                    className={`relative p-2 lg:p-3 rounded-2xl transition-all duration-300 group ${getActionButtonClasses()}`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <AnimatePresence>
                      {cartItemsCount > 0 && (
                        <motion.span
                          className="absolute -top-1 -right-1 bg-medical-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        >
                          {cartItemsCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-medical-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">Ver Carrito</div>
                    </div>
                  </motion.button>
                </Link>

                {isAuthenticated && user ? (
                  <div className="relative">
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
                              <div className="w-12 h-12 bg-medical-blue-gradient rounded-full flex items-center justify-center text-white font-bold text-lg">{getUserInitials(user)}</div>
                              <div>
                                <div className="font-semibold text-medical-gray-900">{getUserDisplayName(user)}</div>
                                <div className="text-sm text-medical-gray-600">{user.email}</div>
                                <div className="text-xs text-medical-blue-600 font-medium">Cliente Comercial (Farmacia)</div>
                              </div>
                            </div>
                          </div>
                          <div className="p-2">
                            {user && (user.role === 'super_admin' || user.role === 'admin') && (
                              <Link to="/admin" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-medical-blue-50 transition-colors duration-200 group" onClick={() => setIsUserMenuOpen(false)}>
                                <Shield className="h-4 w-4 text-medical-gray-500 group-hover:text-medical-blue-600" />
                                <span className="text-medical-gray-700 group-hover:text-medical-gray-900">Admin</span>
                              </Link>
                            )}
                            <Link to="/profile" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-medical-blue-50 transition-colors duration-200 group" onClick={() => setIsUserMenuOpen(false)}>
                              <UserIcon className="h-4 w-4 text-medical-gray-500 group-hover:text-medical-blue-600" />
                              <span className="text-medical-gray-700 group-hover:text-medical-gray-900">Mi Perfil</span>
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
                                }, 500); // Delay for visual feedback
                              }}
                              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-red-50 transition-colors duration-200 group"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              disabled={isLoggingOut}
                            >
                              {isLoggingOut ? (
                                <LoadingSpinner variant="button" size="sm" className="text-red-500" />
                              ) : (
                                <LogOut className="h-4 w-4 text-red-500" />
                              )}
                              <span className="text-red-600 group-hover:text-red-700">
                                {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
                              </span>
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
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
              <SearchBar isScrolled={isScrolled || isLightBackgroundPage} />
            </div>
          )}
        </div>
      </motion.nav>

      {/* Desktop Aside Menu */}
      <AnimatePresence>
        {isDesktopMenuOpen && (
          <motion.div className="fixed inset-0 z-50 hidden lg:block" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDesktopMenuOpen(false)} />
            <motion.div className="fixed left-0 top-0 h-full w-80 max-w-sm glass-card shadow-elegant border-r border-white/30" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
              <div className="flex flex-col h-full">
                {/* Header fijo */}
                <div className="flex justify-between items-center p-6 border-b border-medical-gray-200 flex-shrink-0">
                  <div className="text-lg font-serif font-bold text-medical-gray-900">Menú</div>
                  <motion.button onClick={() => setIsDesktopMenuOpen(false)} className="p-2 rounded-full text-medical-gray-600 hover:bg-medical-gray-100 transition-colors" aria-label="Cerrar menú" whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}>
                    <X className="h-6 w-6" />
                  </motion.button>
                </div>
                
                {/* Contenido scrolleable */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <div className="p-6 space-y-2">
                    {menuItems.map((item, index) => (
                      <Link to={item.href} key={item.name} onClick={() => setIsDesktopMenuOpen(false)}>
                        <motion.div className="flex items-center space-x-3 p-4 rounded-xl text-medical-gray-700 hover:text-medical-blue-700 hover:bg-medical-blue-50 transition-all duration-200 group" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                          <div className="p-2 bg-medical-blue-50 text-medical-blue-600 rounded-lg group-hover:bg-medical-blue-100 transition-colors duration-200">
                            <item.icon className="h-4 w-4" />
                          </div>
                          <span className="font-medium">{item.name}</span>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div className="fixed inset-0 z-40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div className="fixed right-0 top-0 h-full w-80 max-w-sm glass-card shadow-elegant border-l border-white/30" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
              <div className="flex flex-col h-full">
                {/* Header fijo */}
                <div className="flex justify-between items-center p-6 border-b border-medical-gray-200 flex-shrink-0">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-xl overflow-hidden"><img src={logoSrc} alt="Grupo Drozainka Logo" className="h-8 w-auto object-contain" /></div>
                    <div>
                      <div className="text-lg font-serif font-bold text-medical-gray-900">Grupo Drozainka</div>
                      <div className="text-sm text-medical-gray-600">Professional Care</div>
                    </div>
                  </div>
                  <motion.button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full text-medical-gray-600 hover:bg-medical-gray-100 transition-colors" aria-label="Cerrar menú" whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}>
                    <X className="h-6 w-6" />
                  </motion.button>
                </div>
                
                {/* Contenido scrolleable */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <div className="p-6 space-y-2">
                    {menuItems.map((item, index) => (
                      <motion.a key={item.name} href={item.href} className="flex items-center space-x-3 p-4 rounded-xl text-medical-gray-700 hover:text-medical-blue-700 hover:bg-medical-blue-50 transition-all duration-200 group" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="p-2 bg-medical-blue-50 text-medical-blue-600 rounded-lg group-hover:bg-medical-blue-100 transition-colors duration-200">
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{item.name}</span>
                      </motion.a>
                    ))}
                  </div>
                </div>
                
                {/* Footer fijo */}
                <div className="flex-shrink-0">
                  <div className="p-6 border-t border-medical-gray-200">
                    <CurrencyToggle currency={currency} onToggle={onCurrencyToggle} isScrolled={true} />
                  </div>
                  <div className="p-6 border-t border-medical-gray-200 bg-medical-blue-50">
                    <div className="text-center">
                      <p className="text-sm text-medical-gray-600 mb-2">¿Necesitas asesoría comercial?</p>
                      <motion.button className="btn-medical-primary w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Contacto Comercial 24/7</motion.button>
                    </div>
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
