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
} from 'lucide-react';
import { Order } from '../../types';
import OrderModal from '../../components/Admin/OrderModal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import adminService from '../../services/AdminService';

const AdminOrdersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.tracking_number && order.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        return <Trash2 className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    await adminService.updateOrderStatus(orderId, newStatus);
    const updatedOrders = orders.map(o => 
      o.id === orderId ? { ...o, status: newStatus } : o
    );
    setOrders(updatedOrders);
    
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
    
    console.log(`Order ${orderId} status updated to ${newStatus}`);
    // We will close the modal after updating status for better UX
    // setShowOrderModal(false); 
  };
  
  const handleDeleteRequest = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation(); // Evita que se abra el modal de detalles
    setOrderToDelete(order);
  };

  const handleConfirmDelete = () => {
    if (!orderToDelete) return;

    setOrders(prevOrders => prevOrders.filter(o => o.id !== orderToDelete.id));
    console.log(`Pedido ${orderToDelete.id} eliminado.`);
    setOrderToDelete(null); // Cierra el modal de confirmación
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Pedidos</h1>
          <p className="mt-2 text-gray-600">
            Administra todos los pedidos de tu farmacia.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por ID, cliente, tracking..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="processing">Preparando</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregado</option>
            <option value="cancelled">Cancelado</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
            <Filter className="w-4 h-4 mr-2" />
            Filtrar
          </button>
        </div>
      </div>

      {/* Orders List/Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Pedidos ({filteredOrders.length})</h3>
        </div>
        
        {/* Mobile View - List */}
        <div className="md:hidden">
          <div className="divide-y divide-gray-200">
            {filteredOrders.map((order) => {
              return (
                <div 
                  key={order.id} 
                  onClick={() => handleViewOrder(order)}
                  className="p-4 hover:bg-gray-50 active:bg-gray-100 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">#{order.id.substring(0, 8)}...</div>
                      <div className="text-sm text-gray-600">{order.shipping_address.recipient_name}</div>
                      <div className="text-sm text-gray-500 mt-1">{new Date(order.created_at).toLocaleDateString('es-VE')}</div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="font-bold text-gray-900">{formatCurrency(order.total)}</div>
                      <div className="flex items-center justify-end mt-1 text-sm">
                        {getStatusIcon(order.status)}
                        <span className="ml-1.5">{order.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-3 pt-3 border-t">
                     <button 
                        onClick={(e) => handleDeleteRequest(e, order)} 
                        className="text-red-600 hover:text-red-800 flex items-center text-sm font-medium p-2 -m-2"
                        title="Eliminar pedido"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Eliminar
                      </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Pedido</th>
                <th scope="col" className="px-6 py-3">Cliente</th>
                <th scope="col" className="px-6 py-3">Fecha</th>
                <th scope="col" className="px-6 py-3">Total</th>
                <th scope="col" className="px-6 py-3">Estado</th>
                <th scope="col" className="px-6 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredOrders.map((order) => {
                return (
                  <tr 
                    key={order.id} 
                    onClick={() => handleViewOrder(order)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-blue-600 hover:underline">#{order.id.substring(0, 8)}...</div>
                      <div className="text-xs text-gray-500">{order.tracking_number}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{order.shipping_address.recipient_name}</div>
                      <div className="text-xs text-gray-500">{order.shipping_address.recipient_phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(order.created_at).toLocaleDateString('es-VE')}
                    </td>
                    <td className="px-6 py-4 font-medium">{formatCurrency(order.total)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getStatusIcon(order.status)}
                        <span className="ml-2">{order.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={(e) => handleDeleteRequest(e, order)} 
                        className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-100"
                        title="Eliminar pedido"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showOrderModal && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setShowOrderModal(false)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {orderToDelete && (
        <ConfirmationModal
          isOpen={!!orderToDelete}
          onClose={() => setOrderToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Confirmar Eliminación"
          message={
            <span>
              ¿Estás seguro de que quieres eliminar el pedido <strong>#{orderToDelete.id.substring(0, 8)}...</strong>? 
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