import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  DollarSign, 
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  MoreVertical,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import OrderModal from '../../components/Admin/OrderModal';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import { RecentOrder, adminService } from '../../services/AdminService';
import { Order } from '../../types';
import DashboardSkeleton from '../../components/Skeleton/DashboardSkeleton';
import OrderModalSkeleton from '../../components/Skeleton/OrderModalSkeleton';

const AdminDashboardPage: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState(7);
  const [selectedOrder, setSelectedOrder] = useState<RecentOrder | null>(null);
  const [fullOrderDetails, setFullOrderDetails] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
  const navigate = useNavigate();

  // 🎯 Hook para datos del dashboard con API real
  const { data, loading, error, refreshData, updateOrderStatus } = useAdminDashboard(selectedTimeRange);

  // 🔄 Actualizar datos cuando cambie el rango de tiempo
  useEffect(() => {
    if (selectedTimeRange !== 7) { // Solo si cambió del valor inicial
      refreshData(selectedTimeRange);
    }
  }, [selectedTimeRange]); // Hook maneja la carga inicial

  // 📊 Extraer datos del API o valores por defecto
  const stats = data?.stats || {
    total_revenue: 0,
    total_orders: 0,
    new_customers: 0,
    conversion_rate: 0
  };

  const orderStatusSummary = data?.order_status_summary || {
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  };

  const recentOrders = data?.recent_orders || [];

  // 🎨 Función para obtener colores de estado
  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'yellow',
      processing: 'blue',
      shipped: 'purple',
      delivered: 'green',
      cancelled: 'red'
    };
    return colors[status as keyof typeof colors] || 'gray';
  };

  // 💰 Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // 👁️ Ver detalles de orden con carga completa
  const handleViewOrderDetails = async (order: RecentOrder) => {
    setSelectedOrder(order);
    setLoadingOrderDetails(true);
    
    try {
      // 🌐 Obtener detalles completos de la orden
      const fullOrder = await adminService.getOrderDetails(order.id);
      setFullOrderDetails(fullOrder);
      setShowOrderModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      
      // 🔄 Fallback: crear orden básica con datos disponibles
      const fallbackOrder: Order = {
        id: order.id,
        order_number: order.id,
        status: order.status,
        subtotal: order.total,
        shipping_cost: 0,
        taxes: 0,
        total: order.total,
        currency: 'VES',
        payment_method: 'No especificado',
        payment_status: 'pending',
        payment_reference: 'No especificado',
        tracking_number: undefined,
        estimated_delivery: undefined,
        delivered_at: undefined,
        customer_notes: undefined,
        created_at: order.date,
        updated_at: order.date,
        items: [],
        shipping_address: {
          street: 'Información no disponible',
          city: 'No disponible',
          state: 'No disponible',
          postal_code: '0000',
          country: 'Venezuela',
          recipient_name: 'No disponible',
          recipient_phone: 'No disponible',
          delivery_instructions: undefined
        },
        item_count: 0,
        payment_capture_url: ''
      };
      
      setFullOrderDetails(fallbackOrder);
      setShowOrderModal(true);
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  // 🔄 Manejar actualización de estado
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      
      // Actualizar orden seleccionada si corresponde
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      
      // Actualizar detalles completos si existen
      if (fullOrderDetails && fullOrderDetails.id === orderId) {
        setFullOrderDetails({ ...fullOrderDetails, status: newStatus });
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  // 🔄 Función para refrescar datos manualmente
  const handleRefresh = async () => {
    await refreshData(selectedTimeRange);
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

  // 🔄 Mostrar skeleton mientras cargan los datos iniciales
  if (loading && !data) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            {loading && (
              <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
            )}
          </div>
          <p className="mt-1 text-gray-600">Resumen del rendimiento de tu farmacia.</p>
          
          {/* Error Message */}
          {error && (
            <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          
          {/* Time Range Selector */}
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(Number(e.target.value))}
            disabled={loading}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value={7}>Últimos 7 días</option>
            <option value={30}>Últimos 30 días</option>
            <option value={365}>Último año</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Ingresos Totales" 
          value={formatCurrency(stats.total_revenue)} 
          icon={DollarSign} 
          change="+8.2%" 
          changeType="up" 
        />
        <StatCard 
          title="Total de Pedidos" 
          value={stats.total_orders} 
          icon={ShoppingCart} 
          change="+12.5%" 
          changeType="up" 
        />
        <StatCard 
          title="Nuevos Clientes" 
          value={stats.new_customers} 
          icon={Users} 
          change="+5" 
          changeType="up" 
        />
        <StatCard 
          title="Tasa de Conversión" 
          value={`${stats.conversion_rate.toFixed(2)}%`} 
          icon={TrendingUp} 
          change="-0.5%" 
          changeType="down" 
        />
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
                {recentOrders.length > 0 ? (
                  recentOrders.map((order: RecentOrder) => {
                    const statusColor = getStatusColor(order.status);
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {order.customer_name || 'Cliente desconocido'}
                          </div>
                          <div className="text-xs text-gray-500">#{order.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          {new Date(order.date).toLocaleDateString('es-VE', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-${statusColor}-100 text-${statusColor}-800`}>
                            <span className={`w-2 h-2 mr-2 bg-${statusColor}-500 rounded-full`}></span>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button 
                            onClick={() => handleViewOrderDetails(order)} 
                            disabled={loadingOrderDetails}
                            className="text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loadingOrderDetails && selectedOrder?.id === order.id ? (
                              <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                              <MoreVertical className="w-5 h-5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <ShoppingCart className="w-12 h-12 text-gray-300 mb-4" />
                        <h3 className="text-sm font-medium text-gray-900 mb-1">No hay órdenes recientes</h3>
                        <p className="text-sm text-gray-500">
                          {loading ? 'Cargando datos...' : 'Las órdenes aparecerán aquí cuando los clientes realicen compras.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
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
                <span className="text-sm font-bold text-yellow-600">{orderStatusSummary.pending}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Confirmados</span>
                <span className="text-sm font-bold text-green-600">{orderStatusSummary.confirmed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Procesando</span>
                <span className="text-sm font-bold text-blue-600">{orderStatusSummary.processing}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Enviados</span>
                <span className="text-sm font-bold text-purple-600">{orderStatusSummary.shipped}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Entregados</span>
                <span className="text-sm font-bold text-green-600">{orderStatusSummary.delivered}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Cancelados</span>
                <span className="text-sm font-bold text-red-600">{orderStatusSummary.cancelled}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Order Modal o Loading Skeleton */}
      {showOrderModal && (
        loadingOrderDetails ? (
          <OrderModalSkeleton 
            onClose={() => {
              setShowOrderModal(false);
              setLoadingOrderDetails(false);
              setSelectedOrder(null);
            }}
          />
        ) : fullOrderDetails ? (
          <OrderModal
            order={fullOrderDetails}
            onClose={() => {
              setShowOrderModal(false);
              setFullOrderDetails(null);
              setSelectedOrder(null);
            }}
            onUpdateStatus={handleUpdateStatus}
          />
        ) : null
      )}
    </div>
  );
};

export default AdminDashboardPage;