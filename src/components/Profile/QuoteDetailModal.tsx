import React, { useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  BadgeInfo,
  Calendar,
  CheckCircle,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Receipt,
  X,
} from 'lucide-react';
import { useQuoteDetailQuery } from '../../hooks/queries/useQuoteQueries';
import { QuoteServiceError } from '../../services/api/quotes';
import type { QuoteStatus } from '../../types/quotes';
import { useNavbar } from '../../contexts/NavbarContext';

interface QuoteDetailModalProps {
  quoteId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusStyles: Record<QuoteStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 border border-amber-200',
  accepted: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  converted: 'bg-blue-100 text-blue-700 border border-blue-200',
  expired: 'bg-gray-200 text-gray-700 border border-gray-300',
  cancelled: 'bg-red-100 text-red-700 border border-red-200',
};

const formatCurrency = (value: string, currency: string) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return `${currency} ${value}`;
  }
  try {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: ['VES', 'USD'].includes(currency) ? currency : 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  } catch {
    return `${currency} ${numericValue.toFixed(2)}`;
  }
};

const formatDateTime = (isoString: string) => {
  try {
    return new Intl.DateTimeFormat('es-VE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
};

const translateEvent = (event: string): string => {
  const translations: Record<string, string> = {
    'created': 'Creada',
    'updated': 'Actualizada',
    'sent': 'Enviada',
    'accepted': 'Aceptada',
    'converted': 'Convertida',
    'expired': 'Vencida',
    'cancelled': 'Anulada',
  };
  
  return translations[event.toLowerCase()] || event;
};

const QuoteDetailModal: React.FC<QuoteDetailModalProps> = ({ quoteId, isOpen, onClose }) => {
  const detailQuery = useQuoteDetailQuery(quoteId || '', Boolean(quoteId && isOpen));
  const { hideNavbar, showNavbar } = useNavbar();

  // Ocultar/mostrar navbar cuando el modal se abre/cierra
  useEffect(() => {
    if (isOpen) {
      hideNavbar();
    } else {
      showNavbar();
    }
    
    // Cleanup: asegurar que el navbar se muestre cuando el componente se desmonte
    return () => {
      showNavbar();
    };
  }, [isOpen, hideNavbar, showNavbar]);

  const statusLabel = useMemo(() => {
    if (!detailQuery.data) return null;
    const status = detailQuery.data.status;
    const labelMap: Record<QuoteStatus, string> = {
      pending: 'Pendiente',
      accepted: 'Aceptada',
      converted: 'Convertida a pedido',
      expired: 'Vencida',
      cancelled: 'Anulada',
    };
    return labelMap[status] || status;
  }, [detailQuery.data]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full h-full sm:h-auto sm:max-h-[98vh] sm:max-w-7xl flex flex-col overflow-hidden">
              {/* Header - Sticky */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0 bg-white sticky top-0 z-10">
                <h2 className="text-xl sm:text-2xl font-bold text-medical-gray-900">Detalle de Cotización</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Cerrar modal"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-6 sm:space-y-8">
                {detailQuery.isLoading && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 text-medical-primary animate-spin mb-4" />
                    <p className="text-medical-gray-600 font-semibold">Cargando detalle de la cotización...</p>
                  </div>
                )}

                {detailQuery.isError && (
                  <div className="bg-white rounded-3xl shadow-soft border border-red-200 p-8 text-center">
                    <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-red-600 mb-3">No encontramos esta cotización</h3>
                    <p className="text-medical-gray-600 mb-6">
                      {detailQuery.error instanceof QuoteServiceError
                        ? detailQuery.error.message
                        : 'Es posible que la cotización haya sido eliminada, pertenezca a otro usuario o haya caducado en Profit Plus.'}
                    </p>
                    <button
                      onClick={onClose}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-medical-primary text-white font-semibold hover:bg-medical-primary-dark transition-all"
                    >
                      Cerrar
                    </button>
                  </div>
                )}

                {detailQuery.data && !detailQuery.isLoading && !detailQuery.isError && (
                  <>
                    <header className="bg-medical-blue-50/40 rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm text-medical-gray-500">Cotización</p>
                          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-medical-gray-900 break-words">{detailQuery.data.quote_id?.trim()}</h1>
                          <p className="text-xs sm:text-sm text-medical-gray-500 mt-1">
                            ID Profit Plus: <span className="font-semibold text-medical-gray-700">{detailQuery.data.profit_plus_id?.trim() || 'No asignado'}</span>
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
                          <span className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${statusStyles[detailQuery.data.status]}`}>
                            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-current" />
                            {statusLabel}
                          </span>
                          <div className="rounded-xl sm:rounded-2xl border border-medical-primary/30 bg-medical-blue-50/40 px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2 text-xs sm:text-sm text-medical-gray-700">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-medical-primary flex-shrink-0" />
                            <span className="whitespace-nowrap">Vence el {formatDateTime(detailQuery.data.expires_at)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-xl sm:rounded-2xl border border-gray-100 bg-medical-blue-50/40 p-4 sm:p-6">
                          <p className="text-xs sm:text-sm text-medical-gray-500 uppercase tracking-wide mb-2">Total neto</p>
                          <p className="text-xl sm:text-2xl font-semibold text-medical-gray-900 break-words">
                            {formatCurrency(detailQuery.data.totals.total_net, detailQuery.data.currency)}
                          </p>
                        </div>
                        <div className="rounded-xl sm:rounded-2xl border border-gray-100 bg-medical-green-50/40 p-4 sm:p-6">
                          <p className="text-xs sm:text-sm text-medical-gray-500 uppercase tracking-wide mb-2">Impuestos</p>
                          <p className="text-xl sm:text-2xl font-semibold text-medical-gray-900 break-words">
                            {formatCurrency(detailQuery.data.totals.total_tax, detailQuery.data.currency)}
                          </p>
                        </div>
                        <div className="rounded-xl sm:rounded-2xl border border-gray-100 bg-medical-blue-50/40 p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
                          <p className="text-xs sm:text-sm text-medical-gray-500 uppercase tracking-wide mb-2">Total cotizado</p>
                          <p className="text-xl sm:text-2xl font-semibold text-medical-gray-900 break-words">
                            {formatCurrency(detailQuery.data.totals.total_gross, detailQuery.data.currency)}
                          </p>
                          <p className="text-xs text-medical-gray-500 mt-1">Descuento total: {formatCurrency(detailQuery.data.totals.total_discount, detailQuery.data.currency)}</p>
                        </div>
                      </div>
                    </header>

                    <section className="grid gap-6 sm:gap-8 lg:grid-cols-3">
                      <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-soft border border-gray-100 p-4 sm:p-6 lg:p-8">
                          <header className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                            <Receipt className="h-4 w-4 sm:h-5 sm:w-5 text-medical-primary flex-shrink-0" />
                            <div className="min-w-0">
                              <h2 className="text-lg sm:text-xl font-semibold text-medical-gray-900">Renglones de la cotización</h2>
                              <p className="text-xs sm:text-sm text-medical-gray-500">Detalle de cada artículo enviado a Profit Plus.</p>
                            </div>
                          </header>
                          
                          {/* Vista de tabla - Desktop */}
                          <div className="hidden lg:block overflow-x-auto -mx-4 sm:mx-0">
                            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                              <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                                <thead className="bg-medical-blue-50 text-medical-gray-600">
                                  <tr>
                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold whitespace-nowrap">#</th>
                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold min-w-[150px]">Producto</th>
                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold whitespace-nowrap">Cantidad</th>
                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold whitespace-nowrap">Precio unit.</th>
                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold whitespace-nowrap">Descuento</th>
                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold whitespace-nowrap">Impuesto</th>
                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold whitespace-nowrap">Total</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                  {detailQuery.data.items.map(item => (
                                    <tr key={item.line_number} className="hover:bg-medical-blue-50/40 transition-colors">
                                      <td className="px-2 sm:px-4 py-3 sm:py-4 font-semibold text-medical-gray-700">{item.line_number}</td>
                                      <td className="px-2 sm:px-4 py-3 sm:py-4">
                                        <div className="flex flex-col min-w-0">
                                          <span className="font-medium text-medical-gray-900 break-words">{item.product_name?.trim()}</span>
                                          <span className="text-xs text-medical-gray-500 break-all">{item.product_code?.trim()}</span>
                                        </div>
                                      </td>
                                      <td className="px-2 sm:px-4 py-3 sm:py-4 text-right text-medical-gray-700 whitespace-nowrap">{item.quantity}</td>
                                      <td className="px-2 sm:px-4 py-3 sm:py-4 text-right text-medical-gray-900 whitespace-nowrap">
                                        {formatCurrency(item.unit_price, detailQuery.data.currency)}
                                      </td>
                                      <td className="px-2 sm:px-4 py-3 sm:py-4 text-right text-medical-gray-700 whitespace-nowrap">
                                        {formatCurrency(item.discount_amount, detailQuery.data.currency)}
                                      </td>
                                      <td className="px-2 sm:px-4 py-3 sm:py-4 text-right text-medical-gray-700 whitespace-nowrap">
                                        {formatCurrency(item.tax_amount, detailQuery.data.currency)}
                                      </td>
                                      <td className="px-2 sm:px-4 py-3 sm:py-4 text-right font-semibold text-medical-gray-900 whitespace-nowrap">
                                        {formatCurrency(item.line_total, detailQuery.data.currency)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Vista de tarjetas - Mobile/Tablet */}
                          <div className="block lg:hidden space-y-4">
                            {detailQuery.data.items.map(item => (
                              <div key={item.line_number} className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="font-semibold text-medical-gray-700 text-sm">#{item.line_number}</span>
                                    </div>
                                    <h3 className="font-semibold text-medical-gray-900 text-sm break-words">{item.product_name?.trim()}</h3>
                                    <p className="text-xs text-medical-gray-500 break-all mt-1">{item.product_code?.trim()}</p>
                                  </div>
                                  <div className="text-right ml-4">
                                    <p className="font-bold text-medical-gray-900 text-base">
                                      {formatCurrency(item.line_total, detailQuery.data.currency)}
                                    </p>
                                    <p className="text-xs text-medical-gray-500 mt-1">Total</p>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                                  <div>
                                    <p className="text-xs text-medical-gray-500 mb-1">Cantidad</p>
                                    <p className="font-medium text-medical-gray-900 text-sm">{item.quantity}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-medical-gray-500 mb-1">Precio unit.</p>
                                    <p className="font-medium text-medical-gray-900 text-sm">
                                      {formatCurrency(item.unit_price, detailQuery.data.currency)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-medical-gray-500 mb-1">Descuento</p>
                                    <p className="font-medium text-medical-gray-700 text-sm">
                                      {formatCurrency(item.discount_amount, detailQuery.data.currency)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-medical-gray-500 mb-1">Impuesto</p>
                                    <p className="font-medium text-medical-gray-700 text-sm">
                                      {formatCurrency(item.tax_amount, detailQuery.data.currency)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <aside className="space-y-6 sm:space-y-8">
                        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-soft border border-gray-100 p-4 sm:p-6">
                          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-medical-primary flex-shrink-0" />
                            <div className="min-w-0">
                              <h3 className="text-base sm:text-lg font-semibold text-medical-gray-900">Comunicación</h3>
                              <p className="text-xs sm:text-sm text-medical-gray-500">Estado del correo enviado al cliente.</p>
                            </div>
                          </div>
                          <div className="rounded-xl sm:rounded-2xl border border-medical-blue-100 bg-medical-blue-50/40 p-3 sm:p-4">
                            {detailQuery.data.email_sent_at ? (
                              <div className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-medical-gray-700">
                                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 sm:mt-1 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="font-semibold text-medical-gray-900">Correo enviado</p>
                                  <p className="break-words">{formatDateTime(detailQuery.data.email_sent_at)}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-medical-gray-700">
                                <BadgeInfo className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 mt-0.5 sm:mt-1 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="font-semibold text-medical-gray-900">Correo pendiente de envío</p>
                                  <p className="break-words">Si no recibes el correo en las próximas horas, contáctanos para reenviarlo.</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-soft border border-gray-100 p-4 sm:p-6">
                          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-medical-primary flex-shrink-0" />
                            <div className="min-w-0">
                              <h3 className="text-base sm:text-lg font-semibold text-medical-gray-900">Entrega</h3>
                              <p className="text-xs sm:text-sm text-medical-gray-500">Datos asociados a la entrega estimada.</p>
                            </div>
                          </div>
                          <div className="space-y-2 text-xs sm:text-sm text-medical-gray-700">
                            <p><span className="font-semibold text-medical-gray-900">Modo:</span> {detailQuery.data.delivery?.mode === 'pickup' ? 'Retiro en tienda' : 'Entrega a domicilio'}</p>
                            {detailQuery.data.delivery?.address && (
                              <div className="mt-3 text-xs sm:text-sm text-medical-gray-700">
                                <p className="font-semibold text-medical-gray-900">Dirección</p>
                                <p className="mt-1 break-words">
                                  {detailQuery.data.delivery.address.line1}
                                  {detailQuery.data.delivery.address.city ? `, ${detailQuery.data.delivery.address.city}` : ''}
                                  {detailQuery.data.delivery.address.state ? ` (${detailQuery.data.delivery.address.state})` : ''}
                                </p>
                                {detailQuery.data.delivery.address.zip && (
                                  <p className="text-xs text-medical-gray-500 mt-1">Código postal: {detailQuery.data.delivery.address.zip}</p>
                                )}
                              </div>
                            )}
                            {detailQuery.data.notes && (
                              <div className="mt-3 text-xs sm:text-sm text-medical-gray-700">
                                <p className="font-semibold text-medical-gray-900">Notas del cliente</p>
                                <p className="mt-1 break-words">{detailQuery.data.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-soft border border-gray-100 p-4 sm:p-6">
                          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-medical-primary flex-shrink-0" />
                            <div className="min-w-0">
                              <h3 className="text-base sm:text-lg font-semibold text-medical-gray-900">Historial</h3>
                              <p className="text-xs sm:text-sm text-medical-gray-500">Eventos registrados para esta cotización.</p>
                            </div>
                          </div>
                          <div className="space-y-3 sm:space-y-4">
                            {detailQuery.data.history.map((item, idx) => (
                              <div key={`${item.timestamp}-${idx}`} className="relative pl-5 sm:pl-6">
                                <span className="absolute left-0 top-1 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-medical-primary"></span>
                                <p className="text-xs text-medical-gray-500 uppercase tracking-wide">{formatDateTime(item.timestamp)}</p>
                                <p className="text-xs sm:text-sm font-semibold text-medical-gray-900 mt-1">{translateEvent(item.event)}</p>
                                {item.detail && (
                                  <p className="text-xs sm:text-sm text-medical-gray-600 break-words">{item.detail}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </aside>
                    </section>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuoteDetailModal;

