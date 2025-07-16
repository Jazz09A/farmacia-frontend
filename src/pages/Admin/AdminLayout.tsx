import React, { useState, Fragment } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Home, 
  ShoppingCart, 
  BookOpen, 
  Users, 
  Package, 
  BarChart3,
  Settings,
  Bell,
  Search,
  LogOut,
  Plus,
  Activity,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Transition } from '@headlessui/react';

const AdminSidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 ${
      isActive ? 'bg-blue-100 text-blue-700 font-semibold border-r-4 border-blue-600' : 'font-medium'
    }`;

  return (
    <>
      {/* Mobile-first sidebar: fixed, with transition */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col h-full transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">FarmaAdmin</h2>
              <p className="text-sm text-gray-600">Panel de Control</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="mb-4">
            <p className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Principal
            </p>
            <NavLink to="/admin/dashboard" className={navLinkClass} onClick={onClose}>
              <Home className="w-5 h-5 mr-3" />
              Dashboard
            </NavLink>
          </div>

          <div className="mb-4">
            <p className="px-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Gestión
            </p>
            <NavLink to="/admin/orders" className={navLinkClass} onClick={onClose}>
              <ShoppingCart className="w-5 h-5 mr-3" />
              Pedidos
            </NavLink>
            <NavLink to="/admin/products" className={navLinkClass} onClick={onClose}>
              <Package className="w-5 h-5 mr-3" />
              Productos
            </NavLink>
            <NavLink to="/admin/customers" className={navLinkClass} onClick={onClose}>
              <Users className="w-5 h-5 mr-3" />
              Clientes
            </NavLink>
          </div>

          <div className="mb-4">
            <p className="px-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Contenido
            </p>
            <NavLink to="/admin/blog" className={navLinkClass} onClick={onClose}>
              <BookOpen className="w-5 h-5 mr-3" />
              Blog
            </NavLink>
          </div>

          <div className="mb-4">
            <p className="px-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Reportes
            </p>
            <NavLink to="/admin/analytics" className={navLinkClass} onClick={onClose}>
              <BarChart3 className="w-5 h-5 mr-3" />
              Analíticas
            </NavLink>
          </div>

          <div className="mb-4">
            <p className="px-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Sistema
            </p>
            <NavLink to="/admin/settings" className={navLinkClass} onClick={onClose}>
              <Settings className="w-5 h-5 mr-3" />
              Configuración
            </NavLink>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Cerrar Sesión
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
    if (user.user_type === 'natural') {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.company_name;
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 flex-shrink-0">
      <div className="flex justify-between items-center">
        {/* Left part: Menu button and Search */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar..."
                className="pl-10 pr-4 py-2 w-full max-w-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Right part: Actions and User Menu */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={() => navigate('/admin/blog/new')}
            className="hidden sm:flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden md:inline">Nuevo Artículo</span>
          </button>

          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100">
            <Bell className="w-6 h-6" />
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              3
            </span>
          </button>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900 truncate">{getUserDisplayName()}</p>
              <p className="text-xs text-gray-500">Administrador</p>
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {getUserInitials()}
            </div>
          </div>
        </div>
      </div>
      <div className="md:hidden mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar pedidos, productos..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </header>
  );
};


const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      <Transition.Root show={isSidebarOpen} as={Fragment}>
        <div className="lg:hidden">
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div 
              className="fixed inset-0 bg-gray-600 bg-opacity-75" 
              onClick={() => setSidebarOpen(false)} 
            />
          </Transition.Child>
        </div>
      </Transition.Root>
      
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 