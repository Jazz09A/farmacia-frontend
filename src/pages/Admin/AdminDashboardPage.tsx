import React, { useState } from 'react';
import { 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  DollarSign, 
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  BarChart3,
  MoreVertical
} from 'lucide-react';
// import { mockOrders, orderStatuses, mockUsers } from '../../data/mockData';
import { Order, User } from '../../types';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import OrderModal from '../../components/Admin/OrderModal';

const AdminDashboardPage: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const navigate = useNavigate();

  // Mock data calculations
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalCustomers = 0;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const processingOrders = orders.filter(order => order.status === 'processing').length;
  const shippedOrders = orders.filter(order => order.status === 'shipped').length;
  const deliveredOrders = orders.filter(order => order.status === 'delivered').length;

  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    return 'gray';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    const updatedOrders = orders.map(o => 
      o.id === orderId ? { ...o, status: newStatus } : o
    );
    setOrders(updatedOrders);
    
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
    
    console.log(`Order ${orderId} status updated to ${newStatus}`);
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    change, 
    changeType 
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    change?: string;
    changeType?: 'up' | 'down';
  }) => (
    <motion.div 
      className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${
              changeType === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {changeType === 'up' ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
              <span>{change} vs. semana pasada</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-blue-100 rounded-full">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </motion.div>
  );

  const QuickActions: React.FC = () => {
    const actions = [
      { title: 'Nuevo Producto', icon: Plus, action: () => navigate('/admin/products/new') },
      { title: 'Ver Reportes', icon: BarChart3, action: () => navigate('/admin/analytics') },
      { title: 'Gestionar Pedidos', icon: ShoppingCart, action: () => navigate('/admin/orders') },
    ];

    return (
      <div className="space-y-3">
        {actions.map((action) => (
          <button
            key={action.title}
            className="w-full flex items-center p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
            onClick={action.action}
          >
            <action.icon className="w-5 h-5 mr-3 text-gray-500" />
            <span className="font-medium text-sm">{action.title}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-600">Resumen del rendimiento de tu farmacia.</p>
        </div>
        <div>
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Últimos 7 días</option>
            <option value="month">Últimos 30 días</option>
            <option value="year">Último año</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Ingresos Totales" value={formatCurrency(totalRevenue)} icon={DollarSign} change="+8.2%" changeType="up" />
        <StatCard title="Total de Pedidos" value={totalOrders} icon={ShoppingCart} change="+12.5%" changeType="up" />
        <StatCard title="Nuevos Clientes" value={totalCustomers} icon={Users} change="+5" changeType="up" />
        <StatCard title="Tasa de Conversión" value="2.14%" icon={TrendingUp} change="-0.5%" changeType="down" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Pedidos Recientes</h3>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              Ver todos
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Cliente</th>
                  <th scope="col" className="px-6 py-3 hidden md:table-cell">Fecha</th>
                  <th scope="col" className="px-6 py-3">Total</th>
                  <th scope="col" className="px-6 py-3">Estado</th>
                  <th scope="col" className="px-6 py-3"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrders.map((order: Order) => {
                  // const customer = null;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{'N/A'}</div>
                        <div className="text-xs text-gray-500">{'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        {new Date(order.createdAt).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{formatCurrency(order.total)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-${getStatusColor(order.status)}-100 text-${getStatusColor(order.status)}-800`}>
                          <span className={`w-2 h-2 mr-2 bg-${getStatusColor(order.status)}-500 rounded-full`}></span>
                            {'Desconocido'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button onClick={() => handleViewOrderDetails(order)} className="text-gray-400 hover:text-blue-600">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions & Status */}
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h3>
            </div>
            <div className="p-6">
              <QuickActions />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Resumen de Estado</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Pendientes</span>
                <span className="text-sm font-bold text-yellow-600">{pendingOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Procesando</span>
                <span className="text-sm font-bold text-blue-600">{processingOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Enviados</span>
                <span className="text-sm font-bold text-purple-600">{shippedOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Entregados</span>
                <span className="text-sm font-bold text-green-600">{deliveredOrders}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showOrderModal && (
        <OrderModal
          order={selectedOrder}
          users={[]}
          onClose={() => setShowOrderModal(false)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
};

export default AdminDashboardPage;