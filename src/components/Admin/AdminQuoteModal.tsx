import React from 'react';
import { QuoteStatus } from '../../types/quotes';
import { useAdminQuoteDetailQuery } from '../../hooks/queries/useAdminQueries';
import LoadingSpinner from '../common/LoadingSpinner';
import { 
  XCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  MapPin,
  Mail,
  Calendar,
  Package,
  DollarSign,
  Receipt,
  X,
  Truck,
  Tag,
  Percent
} from 'lucide-react';

interface AdminQuoteModalProps {
  quoteId: string | null;
  onClose: () => void;
}

const getStatusIcon = (status: QuoteStatus) => {
  switch (status) {
    case 'pending':
      return <Clock className="w-4 h-4 text-yellow-500" />;
    case 'accepted':
      return <CheckCircle className="w-4 h-4 text-blue-500" />;
    case 'converted':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'expired':
      return <AlertCircle className="w-4 h-4 text-gray-500" />;
    case 'cancelled':
      return <XCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-500" />;
  }
};

const getStatusBadge = (status: QuoteStatus) => {
  const baseClasses = "px-3 py-1.5 text-xs font-semibold rounded-full flex items-center gap-2";
  switch (status) {
    case 'pending':
      return `${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-200`;
    case 'accepted':
      return `${baseClasses} bg-blue-100 text-blue-800 border border-blue-200`;
    case 'converted':
      return `${baseClasses} bg-green-100 text-green-800 border border-green-200`;
    case 'expired':
      return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-300`;
    case 'cancelled':
      return `${baseClasses} bg-red-100 text-red-800 border border-red-200`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

const getStatusText = (status: QuoteStatus) => {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'accepted':
      return 'Aceptada';
    case 'converted':
      return 'Convertida';
    case 'expired':
      return 'Expirada';
    case 'cancelled':
      return 'Cancelada';
    default:
      return status;
  }
};

const formatCurrency = (value: string, currency: string) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return `${currency} ${value}`;
  }
  try {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: currency === 'US$' ? 'USD' : (currency || 'USD'),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  } catch {
    return `${currency} ${numericValue.toFixed(2)}`;
  }
};

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('es-VE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));
};

const removeCOTPrefix = (quoteId: string) => {
  if (!quoteId) return quoteId;
  return quoteId.startsWith('COT-') ? quoteId.substring(4) : quoteId;
};

const AdminQuoteModal: React.FC<AdminQuoteModalProps> = ({ quoteId, onClose }) => {
  const { data: quote, isLoading: loading, error } = useAdminQuoteDetailQuery(quoteId || '', !!quoteId);

  if (!quoteId) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-xs sm:max-w-md lg:max-w-6xl max-h-[95vh] overflow-y-auto">
          <div className="p-8 text-center">
            <LoadingSpinner />
            <p className="text-gray-600 mt-4">Cargando cotización...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <h2 className="text-lg font-bold text-gray-900">Error</h2>
          </div>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'No se pudo cargar la cotización'}
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-xs sm:max-w-md lg:max-w-6xl max-h-[95vh] overflow-y-auto my-4 shadow-2xl">
        {/* Header */}
        <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 sticky top-0 z-10">
          <div className="flex justify-between items-start gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">
                Cotización #{removeCOTPrefix(quote.quote_id)}
              </h2>
              {quote.profit_plus_id && (
                <p className="text-xs sm:text-sm text-gray-600 mt-1">ID Sistema: {quote.profit_plus_id}</p>
              )}
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 active:text-gray-800 flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Status badge */}
          <div className="mb-3">
            <div className={`${getStatusBadge(quote.status)} inline-flex`}>
              {getStatusIcon(quote.status)}
              <span>{getStatusText(quote.status)}</span>
            </div>
          </div>

          {/* Quick info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="truncate">Creada: {formatDate(quote.created_at)}</span>
            </div>
            {quote.expires_at && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="truncate">Expira: {formatDate(quote.expires_at)}</span>
              </div>
            )}
            {quote.email_sent_at && (
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="truncate">Email enviado</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
          {/* Items Section */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Package className="w-5 h-5 text-gray-600" />
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">Productos ({quote.items.length})</h3>
            </div>
            <div className="space-y-2">
              {quote.items.map((item) => (
                <div key={item.line_number} className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-semibold">
                          {item.line_number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.product_name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Código: {item.product_code}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4 text-xs sm:text-sm">
                      <div className="text-gray-600">
                        <span className="text-gray-500">Cantidad: </span>
                        <span className="font-medium">{Number(item.quantity).toLocaleString('es-VE')}</span>
                      </div>
                      <div className="text-gray-600">
                        <span className="text-gray-500">Precio unit: </span>
                        <span className="font-medium">{formatCurrency(item.unit_price, quote.currency)}</span>
                      </div>
                      {Number(item.discount_amount) > 0 && (
                        <div className="text-red-600">
                          <span className="text-red-500">Descuento: </span>
                          <span className="font-medium">-{formatCurrency(item.discount_amount, quote.currency)}</span>
                        </div>
                      )}
                      <div className="text-gray-900 font-semibold">
                        {formatCurrency(item.line_total, quote.currency)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Receipt className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">Resumen de Totales</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-900">{formatCurrency(quote.totals.total_net, quote.currency)}</span>
              </div>
              {Number(quote.totals.total_discount) > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Descuento:
                  </span>
                  <span className="font-medium text-red-600">-{formatCurrency(quote.totals.total_discount, quote.currency)}</span>
                </div>
              )}
              {Number(quote.totals.total_tax) > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    Impuestos:
                  </span>
                  <span className="font-medium text-gray-900">{formatCurrency(quote.totals.total_tax, quote.currency)}</span>
                </div>
              )}
              <div className="border-t border-blue-200 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-lg sm:text-xl font-bold text-blue-600">
                    {formatCurrency(quote.totals.total_gross, quote.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Payment Terms */}
            {quote.payment_terms && (
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-gray-600" />
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-900">Términos de Pago</h4>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">{quote.payment_terms}</p>
              </div>
            )}

            {/* Delivery Info */}
            {quote.delivery && (
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-4 h-4 text-gray-600" />
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-900">Entrega</h4>
                </div>
                <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                  <p className="capitalize">Modo: {quote.delivery.mode === 'pickup' ? 'Recoger' : 'Envío'}</p>
                  {quote.delivery.address && (
                    <div className="flex items-start gap-1">
                      <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <div>
                        {quote.delivery.address.label && <p className="font-medium">{quote.delivery.address.label}</p>}
                        {quote.delivery.address.line1 && <p>{quote.delivery.address.line1}</p>}
                        {quote.delivery.address.line2 && <p>{quote.delivery.address.line2}</p>}
                        {quote.delivery.address.city && <p>{quote.delivery.address.city}</p>}
                      </div>
                    </div>
                  )}
                  {quote.delivery.notes && (
                    <p className="text-gray-500 italic mt-2">{quote.delivery.notes}</p>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {quote.notes && (
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 sm:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-900">Notas</h4>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 whitespace-pre-wrap">{quote.notes}</p>
              </div>
            )}
          </div>

          {/* History */}
          {quote.history && quote.history.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-gray-600" />
                <h3 className="text-sm sm:text-base font-semibold text-gray-900">Historial</h3>
              </div>
              <div className="space-y-2">
                {quote.history.map((entry, index) => (
                  <div key={index} className="bg-white rounded-lg p-2 sm:p-3 border border-gray-200">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900">{entry.event}</p>
                        {entry.detail && (
                          <p className="text-xs text-gray-500 mt-0.5">{entry.detail}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">{formatDate(entry.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 lg:p-6 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminQuoteModal;

