import React, { useState, Suspense } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  ShoppingCart, 
  BookOpen, 
  Users, 
  Package, 
  Bell,
  Search,
  LogOut,
  Plus,
  Menu,
  X,
  ExternalLink,
  Zap,
  CreditCard,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import CurrencyToggle from '../../components/Admin/CurrencyToggle';
import { AdminCurrencyProvider } from '../../contexts/AdminCurrencyContext';
import logo from '../../public/logo/Logo.webp';
const AdminSidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 ${
      isActive ? 'bg-blue-100 text-blue-700 font-semibold border-r-4 border-blue-600' : 'font-medium'
    }`;

  return (
    <>
      {/* Mobile-first sidebar: fixed, with transition */}
      <aside className={`admin-sidebar fixed inset-y-0 left-0 z-40 w-72 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 lg:p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2 lg:space-x-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center flex-shrink-0">
              <img 
                src={logo} 
                alt="Logo Grupo Drozainka" 
                className="w-6 h-6 lg:w-8 lg:h-8 object-contain"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg lg:text-xl font-bold text-gray-800 truncate">GRUPO DROZAINKA</h2>
              <p className="text-xs lg:text-sm text-gray-600">Panel de Control</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 lg:p-4 space-y-1 lg:space-y-2 overflow-y-auto">
          <div className="mb-4">
            <p className="px-3 lg:px-4 pt-3 lg:pt-4 pb-1 lg:pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Principal
            </p>
            <NavLink to="/admin/dashboard" className={navLinkClass} onClick={onClose}>
              <Home className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
              <span className="truncate">Dashboard</span>
            </NavLink>
          </div>

          <div className="mb-4">
            <p className="px-3 lg:px-4 pb-1 lg:pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Gestión
            </p>
            <NavLink to="/admin/orders" className={navLinkClass} onClick={onClose}>
              <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
              <span className="truncate">Pedidos</span>
            </NavLink>
            <NavLink to="/admin/products" className={navLinkClass} onClick={onClose}>
              <Package className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
              <span className="truncate">Productos</span>
            </NavLink>
            <NavLink to="/admin/flash-offers" className={navLinkClass} onClick={onClose}>
              <Zap className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
              <span className="truncate">Ofertas Flash</span>
            </NavLink>
            <NavLink to="/admin/customers" className={navLinkClass} onClick={onClose}>
              <Users className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
              <span className="truncate">Clientes</span>
            </NavLink>
            <NavLink to="/admin/credit" className={navLinkClass} onClick={onClose}>
              <CreditCard className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
              <span className="truncate">Crédito</span>
            </NavLink>
            <NavLink to="/admin/payments" className={navLinkClass} onClick={onClose}>
              <DollarSign className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
              <span className="truncate">Pagos</span>
            </NavLink>
          </div>

          <div className="mb-4">
            <p className="px-3 lg:px-4 pb-1 lg:pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Contenido
            </p>
            <NavLink to="/admin/blog" className={navLinkClass} onClick={onClose}>
              <BookOpen className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
              <span className="truncate">Blog</span>
            </NavLink>
          </div>

        </nav>

        {/* Footer */}
        <div className="p-3 lg:p-4 border-t border-gray-200 space-y-1 lg:space-y-2">
          <button 
            onClick={() => { 
              window.open('/', '_blank'); 
              onClose(); 
            }}
            className="w-full flex items-center px-3 lg:px-4 py-2 lg:py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors text-sm lg:text-base"
          >
            <ExternalLink className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
            <span className="truncate">Ir al Sitio Web</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-3 lg:px-4 py-2 lg:py-3 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors text-sm lg:text-base"
          >
            <LogOut className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 flex-shrink-0" />
            <span className="truncate">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

const AdminHeader: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getUserDisplayName = () => {
    if (!user) return 'Usuario Admin';
    // Solo usuarios jurídicos permitidos
    return user.company_name || 'Usuario Admin';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-3 sm:px-4 lg:px-6 xl:px-8 py-3 lg:py-4 flex-shrink-0">
      <div className="flex justify-between items-center">
        {/* Left part: Menu button and Search */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-1 text-gray-600 hover:bg-gray-100 rounded-lg active:bg-gray-200 transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
          {/* <div className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar..."
                className="pl-9 pr-4 py-2 w-full max-w-xs text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div> */}
        </div>

        {/* Right part: Actions and User Menu */}
        <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
          <button
            onClick={() => navigate('/admin/blog/new')}
            className="hidden sm:flex items-center px-2 lg:px-3 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg transition-colors font-medium text-xs lg:text-sm"
          >
            <Plus className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
            <span className="hidden md:inline">Nuevo Artículo</span>
          </button>

          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 active:bg-gray-200">
            <Bell className="w-5 h-5 lg:w-6 lg:h-6" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
              3
            </span>
          </button>

          {/* Currency Toggle */}
          <CurrencyToggle />

          <div className="flex items-center space-x-2 lg:space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs lg:text-sm font-medium text-gray-900 truncate max-w-24 lg:max-w-32">{getUserDisplayName()}</p>
              <p className="text-xs text-gray-500">Administrador</p>
            </div>
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs lg:text-sm flex-shrink-0">
              {getUserInitials()}
            </div>
          </div>
        </div>
      </div>
      <div className="md:hidden mt-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar pedidos, productos..."
            className="pl-9 pr-4 py-2 w-full text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>
    </header>
  );
};


const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const location = useLocation();

  // Handle route changes with animation
  React.useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Handle escape key to close sidebar
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        setSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  return (
    <AdminCurrencyProvider>
      <div className="admin-layout bg-gray-50 flex h-screen overflow-hidden">
        {/* Static sidebar for desktop */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-72">
            {/* Sidebar component, swap this element with another sidebar if you like */}
            <AdminSidebar isOpen={true} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>

        {/* Mobile Sidebar Overlay - Mejorado para funcionamiento correcto en mobile */}
        <div className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}>
          {/* Backdrop */}
          <div 
            className={`fixed inset-0 bg-gray-600 transition-opacity duration-300 ${
              isSidebarOpen ? 'bg-opacity-75' : 'bg-opacity-0'
            }`}
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* Sidebar */}
          <div className={`fixed inset-y-0 left-0 flex flex-col w-72 max-w-xs bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
        
        <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
          <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isTransitioning ? 0 : 1, y: isTransitioning ? 20 : 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex-1 relative overflow-y-auto focus:outline-none p-3 sm:p-4 lg:p-6 xl:p-8"
          >
            <Suspense fallback={<div>Loading...</div>}>
              <Outlet />
            </Suspense>
          </motion.main>
        </div>
      </div>
    </AdminCurrencyProvider>
  );
};

export default AdminLayout; 