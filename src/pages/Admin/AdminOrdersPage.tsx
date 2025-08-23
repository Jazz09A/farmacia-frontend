import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  RefreshCw,
  SortAsc,
  SortDesc,
  ChevronLeft,
  ChevronRight,
  Eye,
  CreditCard,
  Truck,
  XCircle,
  Calendar
} from 'lucide-react';
import { Order } from '../../types';
import OrderModal from '../../components/Admin/OrderModal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useOrders } from '../../hooks/useOrders';

const AdminOrdersPage: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  
  const {
    orders,
    loading,
    error,
    total,
    pages,
    currentPage,
    filters,
    refreshOrders,
    updateOrderStatus,
    deleteOrder,
    setFilters,
    setPage
  } = useOrders();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'processing':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
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

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1";
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'confirmed':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'processing':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'shipped':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'delivered':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'VES') => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: currency === 'VES' ? 'VES' : 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-VE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    await updateOrderStatus(orderId, newStatus);
    
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };
  
  const handleDeleteRequest = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    setOrderToDelete(order);
  };

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    await deleteOrder(orderToDelete.id);
    setOrderToDelete(null);
  };

  const handleSearchChange = (value: string) => {
    setFilters({ search: value });
  };

  const handleStatusFilterChange = (status: string) => {
    setFilters({ status });
  };

  const handleSortChange = (sortBy: string) => {
    const newSortOrder = filters.sortBy === sortBy && filters.sortOrder === 'desc' ? 'asc' : 'desc';
    setFilters({ sortBy, sortOrder: newSortOrder });
  };

  const handleRefresh = () => {
    refreshOrders();
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Pedidos</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
            Administra todos los pedidos de tu farmacia ({total} total)
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="px-3 lg:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 transition-colors flex items-center justify-center font-medium text-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
          <button className="px-3 lg:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors flex items-center justify-center font-medium text-sm">
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-red-800 text-sm">{error}</div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="p-3 lg:p-4 bg-white rounded-lg shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por ID, cliente..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmado</option>
            <option value="processing">Preparando</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregado</option>
            <option value="cancelled">Cancelado</option>
          </select>
          <select
            value={`${filters.sortBy}_${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('_');
              setFilters({ sortBy, sortOrder: sortOrder as 'asc' | 'desc' });
            }}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="created_at_desc">Más recientes</option>
            <option value="created_at_asc">Más antiguos</option>
            <option value="total_desc">Mayor valor</option>
            <option value="total_asc">Menor valor</option>
            <option value="status_asc">Estado A-Z</option>
          </select>
          <div className="sm:col-span-2 lg:col-span-1">
            <button 
              onClick={handleRefresh}
              disabled={loading}
              className="w-full px-3 lg:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 active:bg-gray-300 disabled:bg-gray-50 transition-colors flex items-center justify-center text-sm font-medium"
            >
              <Filter className="w-4 h-4 mr-2" />
              {loading ? 'Cargando...' : 'Aplicar'}
            </button>
          </div>
        </div>
      </div>

      {/* Orders List/Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-3 lg:p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h3 className="text-base lg:text-lg font-semibold">Pedidos ({orders.length})</h3>
          <div className="text-xs lg:text-sm text-gray-500">
            Página {currentPage} de {pages}
          </div>
        </div>
        
        {orders.length === 0 ? (
          <div className="p-8 lg:p-12 text-center text-gray-500">
            <Package className="w-8 h-8 lg:w-12 lg:h-12 mx-auto mb-3 lg:mb-4 text-gray-300" />
            <p className="text-base lg:text-lg font-medium mb-1 lg:mb-2">No se encontraron pedidos</p>
            <p className="text-sm lg:text-base">Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          <>
            {/* Mobile View - Enhanced Cards */}
            <div className="md:hidden">
              <div className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <div 
                    key={order.id} 
                    onClick={() => handleViewOrder(order)}
                    className="p-3 lg:p-4 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <div className="font-bold text-gray-900 text-sm">#{order.order_number || order.id.substring(0, 8)}</div>
                          <div className={getStatusBadge(order.status)}>
                            {getStatusIcon(order.status)}
                            <span className="capitalize text-xs">{order.status}</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 truncate">{order.shipping_address.recipient_name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-3 mt-1 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(order.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            {order.item_count} items
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className="font-bold text-gray-900 text-base lg:text-lg">
                          {formatCurrency(order.total, order.currency)}
                        </div>
                        <div className={getPaymentStatusBadge(order.payment_status)}>
                          {order.payment_status}
                        </div>
                      </div>
                    </div>
                    
                    {order.tracking_number && (
                      <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                        <Truck className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">Tracking: {order.tracking_number}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-500 min-w-0">
                        <CreditCard className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{order.payment_method}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewOrder(order);
                          }}
                          className="text-blue-600 hover:text-blue-800 active:text-blue-900 flex items-center text-sm font-medium p-2 rounded-md hover:bg-blue-50"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteRequest(e, order)} 
                          className="text-red-600 hover:text-red-800 active:text-red-900 flex items-center text-sm font-medium p-2 rounded-md hover:bg-red-50"
                          title="Eliminar pedido"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop View - Enhanced Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSortChange('order_number')}
                    >
                      <div className="flex items-center gap-1">
                        Pedido
                        {filters.sortBy === 'order_number' && (
                          filters.sortOrder === 'desc' ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3">Cliente</th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSortChange('created_at')}
                    >
                      <div className="flex items-center gap-1">
                        Fecha
                        {filters.sortBy === 'created_at' && (
                          filters.sortOrder === 'desc' ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSortChange('total')}
                    >
                      <div className="flex items-center gap-1">
                        Total
                        {filters.sortBy === 'total' && (
                          filters.sortOrder === 'desc' ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSortChange('status')}
                    >
                      <div className="flex items-center gap-1">
                        Estado
                        {filters.sortBy === 'status' && (
                          filters.sortOrder === 'desc' ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3">Pago</th>
                    <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((order) => (
                    <tr 
                      key={order.id} 
                      onClick={() => handleViewOrder(order)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-blue-600 hover:underline">
                          #{order.order_number || order.id.substring(0, 8)}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          {order.tracking_number && (
                            <>
                              <Truck className="w-3 h-3" />
                              {order.tracking_number}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{order.shipping_address.recipient_name}</div>
                        <div className="text-xs text-gray-500">{order.shipping_address.recipient_phone}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {order.item_count} {order.item_count === 1 ? 'item' : 'items'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>{formatDate(order.created_at)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {formatCurrency(order.total, order.currency)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.currency}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={getStatusBadge(order.status)}>
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={getPaymentStatusBadge(order.payment_status)}>
                          {order.payment_status}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <CreditCard className="w-3 h-3" />
                          {order.payment_method}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewOrder(order);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => handleDeleteRequest(e, order)} 
                            className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-100 transition-colors"
                            title="Eliminar pedido"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-3 lg:px-6 py-3 lg:py-4 border-t bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs lg:text-sm text-gray-700">
              Mostrando {((currentPage - 1) * filters.limit) + 1} a {Math.min(currentPage * filters.limit, total)} de {total} pedidos
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2 lg:px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 active:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-2 lg:px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 active:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <div className="sm:hidden text-xs text-gray-500">
                {currentPage} / {pages}
              </div>

              <button
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === pages}
                className="px-2 lg:px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 active:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setShowOrderModal(false)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <ConfirmationModal
          isOpen={!!orderToDelete}
          onClose={() => setOrderToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Confirmar Eliminación"
          message={
            <span>
              ¿Estás seguro de que quieres eliminar el pedido{' '}
              <strong>#{orderToDelete.order_number || orderToDelete.id.substring(0, 8)}</strong>? 
              <br />
              Esta acción no se puede deshacer.
            </span>
          }
          confirmText="Sí, eliminar"
          isDestructive={true}
        />
      )}
    </div>
  );
};

export default AdminOrdersPage;