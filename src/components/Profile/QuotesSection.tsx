import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  Filter,
  RefreshCw,
  Search,
} from 'lucide-react';
import type { QuoteStatus, QuoteSummary } from '../../types/quotes';
import { useQuoteListQuery, useQuoteStatusesQuery } from '../../hooks/queries/useQuoteQueries';
import type { QuoteListParams } from '../../services/api/quotes';
import { QuoteServiceError } from '../../services/api/quotes';
import QuoteDetailModal from './QuoteDetailModal';

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

const formatDate = (isoString: string) => {
  try {
    return new Intl.DateTimeFormat('es-VE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
};

const toIsoDate = (value: string, endOfDay = false) => {
  if (!value) return undefined;
  const suffix = endOfDay ? 'T23:59:59.000Z' : 'T00:00:00.000Z';
  return `${value}${suffix}`;
};

const QuotesSection: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<'all' | QuoteStatus>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 10;

  const listParams = useMemo<QuoteListParams>(() => {
    const params: QuoteListParams = {
      page,
      page_size: pageSize,
    };

    if (statusFilter !== 'all') {
      params.status = statusFilter;
    }

    const fromIso = toIsoDate(fromDate);
    const toIso = toIsoDate(toDate, true);

    if (fromIso) {
      params.from_date = fromIso;
    }

    if (toIso) {
      params.to_date = toIso;
    }

    return params;
  }, [page, pageSize, statusFilter, fromDate, toDate]);

  const statusesQuery = useQuoteStatusesQuery(true);
  const quotesQuery = useQuoteListQuery(listParams, true);

  const defaultStatuses = useMemo(
    () =>
      [
        { code: 'pending' as QuoteStatus, label: 'Pendiente', description: 'Cotización activa con saldo > 0 y no anulada.' },
        { code: 'accepted' as QuoteStatus, label: 'Aceptada', description: 'La cotización fue confirmada manualmente por el cliente.' },
        { code: 'converted' as QuoteStatus, label: 'Convertida a pedido', description: 'Cotización convertida a orden en Profit Plus.' },
        { code: 'expired' as QuoteStatus, label: 'Vencida', description: 'Fecha de vencimiento menor a hoy y saldo > 0.' },
        { code: 'cancelled' as QuoteStatus, label: 'Anulada', description: 'Registro con anulado = 1 en Profit Plus.' },
      ],
    []
  );

  const statusList = useMemo(() => {
    if (Array.isArray(statusesQuery.data) && statusesQuery.data.length > 0) {
      return statusesQuery.data;
    }
    return defaultStatuses;
  }, [defaultStatuses, statusesQuery.data]);

  const statusMap = useMemo(() => {
    const map = new Map<QuoteStatus, { label: string; description: string }>();
    statusList.forEach(status => {
      map.set(status.code, {
        label: status.label,
        description: status.description,
      });
    });
    return map;
  }, [statusList]);

  const statusFetchError = statusesQuery.error
    ? statusesQuery.error instanceof QuoteServiceError
      ? statusesQuery.error.message
      : statusesQuery.error instanceof Error
      ? statusesQuery.error.message
      : 'No se pudieron cargar los estados de cotización.'
    : null;

  const handleResetFilters = () => {
    setStatusFilter('all');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as 'all' | QuoteStatus;
    setStatusFilter(value);
    setPage(1);
  };

  const handleDateChange = (setter: (value: string) => void) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setter(event.target.value);
    setPage(1);
  };

  const handleViewDetail = (quote: QuoteSummary) => {
    setSelectedQuoteId(quote.quote_id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedQuoteId(null);
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header con botón de actualizar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-medical-gray-900">Mis Cotizaciones</h2>
          <p className="text-medical-gray-600 mt-2">
            Consulta el historial de cotizaciones generadas en Profit Plus, su estado actual y fecha de vencimiento.
          </p>
        </div>
        <button
          onClick={() => quotesQuery.refetch()}
          disabled={quotesQuery.isFetching}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-medical-primary text-white font-semibold shadow-lg hover:bg-medical-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed self-start sm:self-auto"
        >
          <RefreshCw className={`h-5 w-5 ${quotesQuery.isFetching ? 'animate-spin' : ''}`} />
          {quotesQuery.isFetching ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-medical-primary" />
              <select
                value={statusFilter}
                onChange={handleStatusChange}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-medical-primary focus:ring-2 focus:ring-medical-primary/20"
              >
                <option value="all">Todos los estados</option>
                {statusList.map(status => (
                  <option key={status.code} value={status.code}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-medical-primary" />
              <input
                type="date"
                value={fromDate}
                onChange={handleDateChange(setFromDate)}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-medical-primary focus:ring-2 focus:ring-medical-primary/20"
              />
              <span className="text-sm text-medical-gray-400">a</span>
              <input
                type="date"
                value={toDate}
                onChange={handleDateChange(setToDate)}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-medical-primary focus:ring-2 focus:ring-medical-primary/20"
              />
            </div>

            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 text-sm text-medical-primary font-semibold hover:underline"
            >
              <RefreshCw className="h-4 w-4" />
              Limpiar filtros
            </button>
          </div>

          <div className="flex flex-col gap-2 text-sm text-medical-gray-500">
            <div className="flex items-center gap-3">
              <Search className="h-4 w-4" />
              {statusFilter !== 'all' && statusMap.has(statusFilter) ? (
                <p>{statusMap.get(statusFilter)?.description}</p>
              ) : (
                <p>Filtra por estado o rango de fechas para refinar tu historial.</p>
              )}
            </div>
            {statusFetchError && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{statusFetchError}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de cotizaciones */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-medical-blue-50 text-medical-gray-600 text-sm uppercase tracking-wide">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Cotización</th>
                <th className="px-6 py-4 text-left font-semibold">Estado</th>
                <th className="px-6 py-4 text-left font-semibold">Creada</th>
                <th className="px-6 py-4 text-left font-semibold">Vence</th>
                <th className="px-6 py-4 text-left font-semibold">Total</th>
                <th className="px-6 py-4 text-left font-semibold">Correo</th>
                <th className="px-6 py-4 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-sm">
              {quotesQuery.isLoading && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-medical-gray-500">
                    Cargando cotizaciones...
                  </td>
                </tr>
              )}

              {quotesQuery.isError && (
                <tr>
                  <td colSpan={7} className="px-6 py-10">
                    <div className="flex flex-col items-center gap-3 text-red-600">
                      <AlertCircle className="h-6 w-6" />
                      <p>
                        {quotesQuery.error instanceof QuoteServiceError
                          ? quotesQuery.error.message
                          : 'No pudimos cargar tus cotizaciones. Intenta nuevamente.'}
                      </p>
                      <button
                        onClick={() => quotesQuery.refetch()}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition-all"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Reintentar
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {!quotesQuery.isLoading && !quotesQuery.isError && quotesQuery.data?.results?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10">
                    <div className="flex flex-col items-center gap-3 text-medical-gray-500">
                      <FileText className="h-6 w-6" />
                      <p>No encontramos cotizaciones con los filtros seleccionados.</p>
                      <button
                        onClick={handleResetFilters}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-medical-primary/10 text-medical-primary hover:bg-medical-primary/20 transition-all"
                      >
                        Restablecer vista
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {quotesQuery.data?.results?.map(quote => {
                const expiresDate = new Date(quote.expires_at);
                const now = Date.now();
                const isExpired = expiresDate.getTime() < now;
                const isExpiringSoon = !isExpired && expiresDate.getTime() - now < 72 * 60 * 60 * 1000;

                return (
                  <tr key={quote.quote_id} className="hover:bg-medical-blue-50/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-medical-gray-900">{quote.quote_id}</span>
                        <span className="text-xs text-medical-gray-500">
                          Profit Plus: {quote.profit_plus_id || 'Pendiente'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[quote.status]}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {statusMap.get(quote.status)?.label || quote.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-medical-gray-700">{formatDate(quote.created_at)}</td>
                    <td className="px-6 py-4 text-medical-gray-700">
                      <div className="flex flex-col items-start gap-1">
                        <span>{formatDate(quote.expires_at)}</span>
                        {isExpired && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                            Vencida
                          </span>
                        )}
                        {!isExpired && isExpiringSoon && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                            Vence pronto
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-medical-gray-900 font-semibold">
                      {formatCurrency(quote.total_gross, quote.currency)}
                    </td>
                    <td className="px-6 py-4 text-medical-gray-700 text-sm">
                      {quote.email_sent_at ? formatDate(quote.email_sent_at) : 'Pendiente'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleViewDetail(quote)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-medical-primary text-medical-primary hover:bg-medical-blue-50 transition-all"
                      >
                        Ver detalle
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {quotesQuery.data?.pagination && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 border-t border-gray-200">
            <div className="text-sm text-medical-gray-500">
              Página {quotesQuery.data.pagination.page} de {quotesQuery.data.pagination.total_pages} ·{' '}
              {quotesQuery.data.pagination.total_items} cotizaciones
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1 || quotesQuery.isFetching}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-medical-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:border-medical-primary hover:text-medical-primary transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>
              <button
                onClick={() =>
                  setPage(prev =>
                    quotesQuery.data?.pagination
                      ? Math.min(quotesQuery.data.pagination.total_pages, prev + 1)
                      : prev + 1
                  )
                }
                disabled={
                  !quotesQuery.data?.pagination ||
                  page >= quotesQuery.data.pagination.total_pages ||
                  quotesQuery.isFetching
                }
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-medical-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:border-medical-primary hover:text-medical-primary transition-all"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      <QuoteDetailModal
        quoteId={selectedQuoteId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default QuotesSection;

