import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Calendar, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { useGlobalCurrency } from '../../contexts/GlobalCurrencyContext';
import { useNavbar } from '../../contexts/NavbarContext';
import type { DEMOAInvoiceDetails } from '../../types/invoices';

interface InvoiceDetailsModalProps {
  invoice: DEMOAInvoiceDetails;
  onClose: () => void;
}

const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({ invoice, onClose }) => {
  const { formatPrice } = useGlobalCurrency();
  const { hideNavbar, showNavbar } = useNavbar();
  
  // Hide navbar when modal opens and show it when modal closes
  useEffect(() => {
    hideNavbar();
    return () => {
      showNavbar();
    };
  }, [hideNavbar, showNavbar]);
  
  if (!invoice) return null;

  // Formatear precio en Bolívares
  const formatInvoicePrice = (amount: string) => {
    const numAmount = parseFloat(amount);
    return formatPrice(numAmount, 'VES');
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5";
    if (status === 'paid') {
      return `${baseClasses} bg-emerald-100 text-emerald-800`;
    }
    return `${baseClasses} bg-yellow-100 text-yellow-800`;
  };

  const getOrderStatusBadge = (orderStatus: string) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full";
    switch (orderStatus) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'processing':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'requires_attention':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusText = (status: string) => {
    return status === 'paid' ? 'Pagada' : 'Pendiente';
  };

  const getOrderStatusText = (orderStatus: string) => {
    switch (orderStatus) {
      case 'active':
        return 'Activa';
      case 'processing':
        return 'En Proceso';
      case 'requires_attention':
        return 'Requiere Atención';
      default:
        return orderStatus;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: -50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold">Factura {invoice.invoice_number}</h3>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
                <X size={24} />
              </button>
            </div>
            
            {/* Información de la Factura */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-700">Fechas</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Emisión:</span>
                    <span className="ml-2 font-medium">
                      {new Date(invoice.emission_date).toLocaleDateString('es-VE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  {invoice.due_date && (
                    <div>
                      <span className="text-gray-600">Vencimiento:</span>
                      <span className={`ml-2 font-medium ${invoice.status === 'pending' ? 'text-red-600' : 'text-gray-800'}`}>
                        {new Date(invoice.due_date).toLocaleDateString('es-VE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-gray-700">Montos</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Total:</span>
                    <span className="ml-2 font-bold text-lg">
                      {formatInvoicePrice(invoice.total_amount)}
                    </span>
                  </div>
                  {invoice.status === 'pending' && parseFloat(invoice.balance) > 0 && (
                    <div>
                      <span className="text-gray-600">Saldo pendiente:</span>
                      <span className="ml-2 font-semibold text-red-600">
                        {formatInvoicePrice(invoice.balance)}
                      </span>
                    </div>
                  )}
                  {invoice.status === 'paid' && parseFloat(invoice.amount_paid) > 0 && (
                    <div>
                      <span className="text-gray-600">Monto pagado:</span>
                      <span className="ml-2 font-semibold text-green-600">
                        {formatInvoicePrice(invoice.amount_paid)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Estados */}
            <div className="flex gap-3 mb-6">
              <span className={getStatusBadge(invoice.status)}>
                {invoice.status === 'paid' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
                {getStatusText(invoice.status)}
              </span>
              <span className={getOrderStatusBadge(invoice.order_status)}>
                {getOrderStatusText(invoice.order_status)}
              </span>
            </div>

            {/* Items de la Factura */}
            {invoice.items && invoice.items.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-4">Productos</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Producto</th>
                        <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold">Cantidad</th>
                        <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">Precio Unit.</th>
                        <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">Descuento</th>
                        <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">Impuestos</th>
                        <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item) => (
                        <tr key={item.line_number} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2">
                            <div>
                              <div className="font-medium text-sm">{item.product_name}</div>
                              <div className="text-xs text-gray-500">Código: {item.product_barcode || '—'}</div>
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                            {parseFloat(item.quantity).toLocaleString('es-VE')}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right text-sm">
                            {formatInvoicePrice(item.unit_price)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right text-sm">
                            {parseFloat(item.discount_amount) > 0 ? (
                              <span className="text-red-600">-{formatInvoicePrice(item.discount_amount)}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right text-sm">
                            {parseFloat(item.tax_amount) > 0 ? (
                              formatInvoicePrice(item.tax_amount)
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">
                            {formatInvoicePrice(item.line_total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-100 font-bold">
                        <td colSpan={5} className="border border-gray-300 px-4 py-2 text-right">
                          Total Factura:
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {formatInvoicePrice(invoice.total_amount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Botón de Cerrar */}
            <div className="flex justify-end mt-6 pt-4 border-t">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-medical-blue-600 text-white rounded-lg hover:bg-medical-blue-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InvoiceDetailsModal;

