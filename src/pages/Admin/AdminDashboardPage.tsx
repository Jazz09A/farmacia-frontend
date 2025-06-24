import React, { useState } from 'react';
import { 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Package, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  BarChart3
} from 'lucide-react';
import { mockOrders, orderStatuses, mockUsers } from '../../data/mockData';
import { Order } from '../../types';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminDashboardPage: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');
  const navigate = useNavigate();

  // Estadísticas calculadas
  const totalOrders = mockOrders.length;
  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.total, 0);
  const totalCustomers = mockUsers.length;
  const pendingOrders = mockOrders.filter(order => order.status === 'pending').length;
  const processingOrders = mockOrders.filter(order => order.status === 'processing').length;
  const shippedOrders = mockOrders.filter(order => order.status === 'shipped').length;
  const deliveredOrders = mockOrders.filter(order => order.status === 'delivered').length;

  // Órdenes recientes (últimas 5)
  const recentOrders = mockOrders
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'shipped':
        return <Package className="w-4 h-4 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    const statusObj = orderStatuses.find(s => s.id === status);
    return statusObj?.color || 'gray';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 0
    }).format(amount);
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
    icon: any;
    change?: string;
    changeType?: 'up' | 'down';
  }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${
              changeType === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {changeType === 'up' ? (
                <ArrowUpRight className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 mr-1" />
              )}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-blue-100 rounded-full">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  );

  const QuickActions: React.FC = () => {
    const actions = [
      {
        title: 'Nuevo Artículo',
        description: 'Crear una nueva entrada de blog',
        icon: Plus,
        color: 'bg-blue-500 hover:bg-blue-600',
        action: () => navigate('/admin/blog/new')
      },
      {
        title: 'Ver Reportes',
        description: 'Analizar métricas de ventas',
        icon: BarChart3,
        color: 'bg-green-500 hover:bg-green-600',
        action: () => navigate('/admin/analytics')
      },
      {
        title: 'Gestionar Pedidos',
        description: 'Revisar y procesar pedidos',
        icon: ShoppingCart,
        color: 'bg-orange-500 hover:bg-orange-600',
        action: () => navigate('/admin/orders')
      }
    ];

    return (
      <div className="space-y-3">
        {actions.map((action, index) => (
          <motion.button
            key={action.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`w-full flex items-center p-4 ${action.color} text-white rounded-lg shadow-md transition-all duration-300 hover:scale-105 text-left`}
            onClick={action.action}
          >
            <action.icon className="w-5 h-5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-sm">{action.title}</h4>
              <p className="text-xs opacity-90">{action.description}</p>
            </div>
          </motion.button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Bienvenido al panel de administración. Aquí tienes un resumen de tu farmacia.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
            <option value="quarter">Último trimestre</option>
            <option value="year">Último año</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total de Pedidos"
          value={totalOrders}
          icon={ShoppingCart}
          change="+12%"
          changeType="up"
        />
        <StatCard
          title="Ingresos Totales"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          change="+8%"
          changeType="up"
        />
        <StatCard
          title="Clientes Registrados"
          value={totalCustomers}
          icon={Users}
          change="+5%"
          changeType="up"
        />
        <StatCard
          title="Tasa de Conversión"
          value="3.2%"
          icon={TrendingUp}
          change="-2%"
          changeType="down"
        />
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status Cards */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Estado de Pedidos</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{pendingOrders}</div>
                  <div className="text-sm text-gray-600">Pendientes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{processingOrders}</div>
                  <div className="text-sm text-gray-600">Procesando</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{shippedOrders}</div>
                  <div className="text-sm text-gray-600">Enviados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{deliveredOrders}</div>
                  <div className="text-sm text-gray-600">Entregados</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h3>
          </div>
                      <div className="p-6 space-y-3">
             <QuickActions />
            </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Pedidos Recientes</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Ver todos
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((order) => {
                const customer = mockUsers.find(user => user.id === order.userId);
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.id}</div>
                      <div className="text-sm text-gray-500">
                        {order.items.length} productos
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {customer?.name || 'Cliente Desconocido'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {customer?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(order.status)}
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full
                          ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${order.status === 'processing' ? 'bg-blue-100 text-blue-800' : ''}
                          ${order.status === 'shipped' ? 'bg-purple-100 text-purple-800' : ''}
                          ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : ''}
                          ${order.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                        `}>
                          {orderStatuses.find(s => s.id === order.status)?.name || order.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.createdAt.toLocaleDateString('es-ES')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;