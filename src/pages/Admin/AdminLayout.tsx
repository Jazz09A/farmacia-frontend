import React from 'react';
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
  Activity
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const AdminSidebar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 ${
      isActive ? 'bg-blue-100 text-blue-700 font-semibold border-r-4 border-blue-600' : ''
    }`;

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col h-full">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">FarmaAdmin</h2>
            <p className="text-sm text-gray-600">Panel de Control</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Principal
          </p>
          <NavLink to="/admin/dashboard" className={navLinkClass}>
            <Home className="w-5 h-5 mr-3" />
            Dashboard
          </NavLink>
        </div>

        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Gestión
          </p>
          <NavLink to="/admin/orders" className={navLinkClass}>
            <ShoppingCart className="w-5 h-5 mr-3" />
            Pedidos
          </NavLink>
          <NavLink to="/admin/products" className={navLinkClass}>
            <Package className="w-5 h-5 mr-3" />
            Productos
          </NavLink>
          <NavLink to="/admin/customers" className={navLinkClass}>
            <Users className="w-5 h-5 mr-3" />
            Clientes
          </NavLink>
        </div>

        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Contenido
          </p>
          <NavLink to="/admin/blog" className={navLinkClass}>
            <BookOpen className="w-5 h-5 mr-3" />
            Blog
          </NavLink>
        </div>

        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Reportes
          </p>
          <NavLink to="/admin/analytics" className={navLinkClass}>
            <BarChart3 className="w-5 h-5 mr-3" />
            Analíticas
          </NavLink>
        </div>

        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Sistema
          </p>
          <NavLink to="/admin/settings" className={navLinkClass}>
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
  );
};

const AdminHeader: React.FC = () => {
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
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex-shrink-0">
      <div className="flex justify-between items-center">
        {/* Search & Quick Actions */}
        <div className="flex items-center space-x-4 flex-1">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar pedidos, productos, clientes..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Quick Action Buttons */}
          <button
            onClick={() => navigate('/admin/blog/new')}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Artículo
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100">
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
              <p className="text-xs text-gray-500">Administrador</p>
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {getUserInitials()}
            </div>
          </div>

          {/* Return to Store */}
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-gray-600 hover:text-blue-600 border border-gray-300 hover:border-blue-300 rounded-lg transition-colors font-medium"
          >
            Ver Tienda
          </button>
        </div>
      </div>
    </header>
  );
};

const AdminLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 