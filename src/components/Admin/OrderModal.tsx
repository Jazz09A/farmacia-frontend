import React from 'react';
import { Order, User } from '../../types';
import { 
  XCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

const orderStatuses = [

  { id: 'pending', name: 'Pendiente' },
  { id: 'processing', name: 'En Proceso' },
  { id: 'shipped', name: 'Enviado' },
  { id: 'delivered', name: 'Entregado' },
  { id: 'cancelled', name: 'Cancelado' }
];

interface OrderModalProps {
  order: Order | null;
  users: User[];
  onClose: () => void;
  onUpdateStatus: (orderId: string, newStatus: string) => void;
}

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

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 0
    }).format(amount);
};

const OrderModal: React.FC<OrderModalProps> = ({ order, users, onClose, onUpdateStatus }) => {
  if (!order) return null;

  const customer = users.find(user => user.id === order.userId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg max-w-md md:max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate pr-2">
              Pedido #{order.id.split('-')[0]}...
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Customer Info & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Información del Cliente</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                  <span className="text-gray-600 truncate">{customer?.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">{customer?.phone}</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-gray-600">
                    <div>{order.shippingAddress.street}</div>
                    <div>{order.shippingAddress.city}, {order.shippingAddress.state}</div>
                    <div>{order.shippingAddress.country}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Estado del Pedido</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  {getStatusIcon(order.status)}
                  <span className="ml-2 font-medium">
                    {orderStatuses.find(s => s.id === order.status)?.name}
                  </span>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Actualizar Estado:</label>
                  <select 
                    className="px-3 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-500"
                    value={order.status}
                    onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                  >
                    {orderStatuses.map(status => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </div>
                {order.trackingNumber && (
                  <div>
                    <span className="text-gray-600">Tracking: </span>
                    <span className="font-medium">{order.trackingNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Productos</h3>
            {/* Mobile View */}
            <div className="md:hidden space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg flex items-center space-x-3">
                  <img 
                    src={item.product.image} 
                    alt={item.product.name}
                    className="w-16 h-16 rounded-md object-cover"
                  />
                  <div className="flex-1 text-sm">
                    <div className="font-medium text-gray-900">{item.product.name}</div>
                    <div className="text-gray-500">{item.product.brand}</div>
                    <div className="mt-1">
                      {item.quantity} x {formatCurrency(item.product.price_ves)}
                    </div>
                  </div>
                  <div className="font-medium text-gray-900 text-sm">
                    {formatCurrency(item.product.price_ves * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block bg-gray-50 rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Producto</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-600">Cantidad</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Precio Unit.</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <img 
                            src={item.product.image} 
                            alt={item.product.name}
                            className="w-12 h-12 rounded-lg object-cover mr-4"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{item.product.name}</div>
                            <div className="text-gray-500">{item.product.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {formatCurrency(item.product.price_ves)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        {formatCurrency(item.product.price_ves * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3">Resumen del Pedido</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Envío:</span>
                <span>{formatCurrency(order.shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Impuestos:</span>
                <span>{formatCurrency(order.taxes)}</span>
              </div>
              <div className="border-t border-gray-200 my-2"></div>
              <div className="flex justify-between font-bold text-base">
                <span>Total:</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
              <div className="text-gray-600 pt-2">
                Método de pago: <span className="font-medium text-gray-900">{order.paymentMethod}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderModal; 