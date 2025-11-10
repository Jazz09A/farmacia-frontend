import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  BadgeInfo,
  Calendar,
  CheckCircle,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Receipt,
} from 'lucide-react';
import { useQuoteDetailQuery } from '../hooks/queries/useQuoteQueries';
import { QuoteServiceError } from '../services/api/quotes';
import type { QuoteStatus } from '../types/quotes';

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

const QuoteDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ quoteId: string }>();
  const quoteId = params.quoteId || '';
  const detailQuery = useQuoteDetailQuery(quoteId, Boolean(quoteId));

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

  if (detailQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-medical-gray-50">
        <div className="bg-white shadow-soft rounded-3xl px-10 py-12 flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-medical-primary animate-spin" />
          <p className="text-medical-gray-600 font-semibold">Cargando detalle de la cotización...</p>
        </div>
      </div>
    );
  }

  if (detailQuery.isError) {
    const errorMessage =
      detailQuery.error instanceof QuoteServiceError
        ? detailQuery.error.message
        : 'Es posible que la cotización haya sido eliminada, pertenezca a otro usuario o haya caducado en Profit Plus.';
    return (
      <div className="min-h-screen bg-medical-gray-50 pt-32 pb-16">
        <div className="medical-container max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-soft border border-red-200 p-8 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-600 mb-3">No encontramos esta cotización</h1>
            <p className="text-medical-gray-600 mb-6">
              {errorMessage}
            </p>
            <button
              onClick={() => navigate('/profile', { state: { defaultTab: 'cotizaciones' } })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-medical-primary text-white font-semibold hover:bg-medical-primary-dark transition-all"
            >
              Volver al historial
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!detailQuery.data) {
    return (
      <div className="min-h-screen bg-medical-gray-50 pt-32 pb-16">
        <div className="medical-container max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-soft border border-red-200 p-8 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-600 mb-3">No encontramos esta cotización</h1>
            <p className="text-medical-gray-600 mb-6">
              No se pudo cargar la información de la cotización.
            </p>
            <button
              onClick={() => navigate('/profile', { state: { defaultTab: 'cotizaciones' } })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-medical-primary text-white font-semibold hover:bg-medical-primary-dark transition-all"
            >
              Volver al historial
            </button>
          </div>
        </div>
      </div>
    );
  }

  const quote = detailQuery.data;

  return (
    <div className="min-h-screen bg-medical-gray-50 pt-28 pb-16">
      <div className="medical-container space-y-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-medical-gray-600 hover:text-medical-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>

        <header className="bg-white rounded-3xl shadow-soft border border-gray-100 p-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-sm text-medical-gray-500">Cotización</p>
              <h1 className="text-3xl font-bold text-medical-gray-900">{quote.quote_id}</h1>
              <p className="text-sm text-medical-gray-500 mt-1">
                ID Profit Plus: <span className="font-semibold text-medical-gray-700">{quote.profit_plus_id || 'No asignado'}</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${statusStyles[quote.status]}`}>
                <span className="h-2 w-2 rounded-full bg-current" />
                {statusLabel}
              </span>
              <div className="rounded-2xl border border-medical-primary/30 bg-medical-blue-50/40 px-4 py-2 flex items-center gap-2 text-sm text-medical-gray-700">
                <Calendar className="h-4 w-4 text-medical-primary" />
                Vence el {formatDateTime(quote.expires_at)}
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-medical-blue-50/40 p-6">
              <p className="text-sm text-medical-gray-500 uppercase tracking-wide mb-2">Total neto</p>
              <p className="text-2xl font-semibold text-medical-gray-900">
                {formatCurrency(quote.totals.total_net, quote.currency)}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-medical-green-50/40 p-6">
              <p className="text-sm text-medical-gray-500 uppercase tracking-wide mb-2">Impuestos</p>
              <p className="text-2xl font-semibold text-medical-gray-900">
                {formatCurrency(quote.totals.total_tax, quote.currency)}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-medical-blue-50/40 p-6">
              <p className="text-sm text-medical-gray-500 uppercase tracking-wide mb-2">Total cotizado</p>
              <p className="text-2xl font-semibold text-medical-gray-900">
                {formatCurrency(quote.totals.total_gross, quote.currency)}
              </p>
              <p className="text-xs text-medical-gray-500 mt-1">Descuento total: {formatCurrency(quote.totals.total_discount, quote.currency)}</p>
            </div>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-8">
              <header className="flex items-center gap-3 mb-6">
                <Receipt className="h-5 w-5 text-medical-primary" />
                <div>
                  <h2 className="text-xl font-semibold text-medical-gray-900">Renglones de la cotización</h2>
                  <p className="text-sm text-medical-gray-500">Detalle de cada artículo enviado a Profit Plus.</p>
                </div>
              </header>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-medical-blue-50 text-medical-gray-600">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">#</th>
                      <th className="px-4 py-3 text-left font-semibold">Producto</th>
                      <th className="px-4 py-3 text-right font-semibold">Cantidad</th>
                      <th className="px-4 py-3 text-right font-semibold">Precio unitario</th>
                      <th className="px-4 py-3 text-right font-semibold">Descuento</th>
                      <th className="px-4 py-3 text-right font-semibold">Impuesto</th>
                      <th className="px-4 py-3 text-right font-semibold">Total línea</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {quote.items.map(item => (
                      <tr key={item.line_number} className="hover:bg-medical-blue-50/40 transition-colors">
                        <td className="px-4 py-4 font-semibold text-medical-gray-700">{item.line_number}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-medical-gray-900">{item.product_name}</span>
                            <span className="text-xs text-medical-gray-500">{item.product_code}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right text-medical-gray-700">{item.quantity}</td>
                        <td className="px-4 py-4 text-right text-medical-gray-900">
                          {formatCurrency(item.unit_price, quote.currency)}
                        </td>
                        <td className="px-4 py-4 text-right text-medical-gray-700">
                          {formatCurrency(item.discount_amount, quote.currency)}
                        </td>
                        <td className="px-4 py-4 text-right text-medical-gray-700">
                          {formatCurrency(item.tax_amount, quote.currency)}
                        </td>
                        <td className="px-4 py-4 text-right font-semibold text-medical-gray-900">
                          {formatCurrency(item.line_total, quote.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <aside className="space-y-8">
            <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="h-5 w-5 text-medical-primary" />
                <div>
                  <h3 className="text-lg font-semibold text-medical-gray-900">Comunicación</h3>
                  <p className="text-sm text-medical-gray-500">Estado del correo enviado al cliente.</p>
                </div>
              </div>
              <div className="rounded-2xl border border-medical-blue-100 bg-medical-blue-50/40 p-4">
                {quote.email_sent_at ? (
                  <div className="flex items-start gap-3 text-sm text-medical-gray-700">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <p className="font-semibold text-medical-gray-900">Correo enviado</p>
                      <p>{formatDateTime(quote.email_sent_at)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 text-sm text-medical-gray-700">
                    <BadgeInfo className="h-5 w-5 text-amber-500 mt-1" />
                    <div>
                      <p className="font-semibold text-medical-gray-900">Correo pendiente de envío</p>
                      <p>Si no recibes el correo en las próximas horas, contáctanos para reenviarlo.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-5 w-5 text-medical-primary" />
                <div>
                  <h3 className="text-lg font-semibold text-medical-gray-900">Entrega</h3>
                  <p className="text-sm text-medical-gray-500">Datos asociados a la entrega estimada.</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-medical-gray-700">
                <p><span className="font-semibold text-medical-gray-900">Modo:</span> {quote.delivery?.mode === 'pickup' ? 'Retiro en tienda' : 'Entrega a domicilio'}</p>
                {quote.delivery?.address && (
                  <div className="mt-3 text-sm text-medical-gray-700">
                    <p className="font-semibold text-medical-gray-900">Dirección</p>
                    <p className="mt-1">
                      {quote.delivery.address.line1}
                      {quote.delivery.address.city ? `, ${quote.delivery.address.city}` : ''}
                      {quote.delivery.address.state ? ` (${quote.delivery.address.state})` : ''}
                    </p>
                    {quote.delivery.address.zip && (
                      <p className="text-xs text-medical-gray-500 mt-1">Código postal: {quote.delivery.address.zip}</p>
                    )}
                  </div>
                )}
                {quote.notes && (
                  <div className="mt-3 text-sm text-medical-gray-700">
                    <p className="font-semibold text-medical-gray-900">Notas del cliente</p>
                    <p className="mt-1">{quote.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-5 w-5 text-medical-primary" />
                <div>
                  <h3 className="text-lg font-semibold text-medical-gray-900">Historial</h3>
                  <p className="text-sm text-medical-gray-500">Eventos registrados para esta cotización.</p>
                </div>
              </div>
              <div className="space-y-4">
                {quote.history.map(item => (
                  <div key={item.timestamp} className="relative pl-6">
                    <span className="absolute left-0 top-1 h-2 w-2 rounded-full bg-medical-primary"></span>
                    <p className="text-xs text-medical-gray-500 uppercase tracking-wide">{formatDateTime(item.timestamp)}</p>
                    <p className="text-sm font-semibold text-medical-gray-900 mt-1">{item.event}</p>
                    {item.detail && (
                      <p className="text-sm text-medical-gray-600">{item.detail}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
};

export default QuoteDetailPage;

