import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  RefreshCw,
} from 'lucide-react';
import type { QuoteStatus, QuoteSummary, QuoteListResponse } from '../../types/quotes';
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

const QuoteRowSkeleton = ({ count }: { count: number }) => (
  <>
    {[...Array(count)].map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="py-4 pl-6 pr-3"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
        <td className="px-3 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
        <td className="px-3 py-4"><div className="h-6 bg-gray-200 rounded-full w-28"></div></td>
        <td className="px-3 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
        <td className="py-4 pl-3 pr-6"><div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div></td>
      </tr>
    ))}
  </>
);

const QuoteRowEmpty = () => (
  <tr>
    <td colSpan={5} className="text-center py-12 px-6">
      <FileText className="mx-auto h-12 w-12 text-gray-300" />
      <h3 className="mt-4 text-lg font-semibold text-gray-800">No se encontraron cotizaciones</h3>
      <p className="mt-2 text-sm text-gray-500">
        Cuando se generen nuevas cotizaciones, aparecerán aquí.
      </p>
    </td>
  </tr>
);

const QuoteCardSkeleton = ({ count }: { count: number }) => (
  <>
    {[...Array(count)].map((_, i) => (
      <div key={i} className="rounded-2xl bg-white shadow-soft border border-gray-100 p-4 animate-pulse">
        <div className="flex justify-between items-start mb-3">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="h-5 bg-gray-200 rounded-full w-1/4"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-1/4 ml-auto"></div>
        </div>
      </div>
    ))}
  </>
);

const QuoteCardEmpty = () => (
  <div className="text-center py-12 px-6 bg-white rounded-2xl shadow-soft border border-gray-100">
    <FileText className="mx-auto h-12 w-12 text-gray-300" />
    <h3 className="mt-4 text-lg font-semibold text-gray-800">No se encontraron cotizaciones</h3>
    <p className="mt-2 text-sm text-gray-500">
      Cuando se generen nuevas cotizaciones, aparecerán aquí.
    </p>
  </div>
);

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
  
  // Type guard para asegurar que los datos tienen la estructura correcta
  const quotesData = quotesQuery.data as QuoteListResponse | undefined;

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
            Consulta el historial de cotizaciones generadas, su estado actual y fecha de vencimiento.
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
      {/*
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
      */}

      {/* Contenedor de la tabla - VISTA DESKTOP */}
      <div className="hidden lg:block overflow-x-auto rounded-2xl bg-white shadow-soft border border-gray-100">
        <table className="w-full min-w-[800px] divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
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
          <tbody className="divide-y divide-gray-200 bg-white">
            {quotesQuery.isLoading && (
              <QuoteRowSkeleton count={5} />
            )}
            {!quotesQuery.isLoading && quotesData && quotesData.results.length === 0 && (
              <QuoteRowEmpty />
            )}
            {quotesData?.results.map((quote: QuoteSummary) => {
              const expiresDate = new Date(quote.expires_at);
              const now = Date.now();
              const isExpired = expiresDate.getTime() < now;
              const isExpiringSoon = !isExpired && expiresDate.getTime() - now < 72 * 60 * 60 * 1000;

              return (
                <tr
                  key={quote.quote_id}
                  onClick={() => handleViewDetail(quote)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                >
                  <td className="whitespace-nowrap py-4 pl-6 pr-3 text-gray-900 font-medium">
                    #{quote.quote_id}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        statusStyles[quote.status]
                      }`}
                    >
                      {statusMap.get(quote.status)?.label || quote.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-gray-500">{formatDate(quote.created_at)}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-gray-500">
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
                  <td className="whitespace-nowrap px-3 py-4 text-gray-900 font-semibold">
                    {formatCurrency(quote.total_gross, quote.currency)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-gray-500 text-sm">
                    {quote.email_sent_at ? formatDate(quote.email_sent_at) : 'Pendiente'}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right font-medium">
                    <span className="flex items-center justify-end gap-2 text-medical-primary hover:text-medical-primary-dark">
                      Ver Detalles <ArrowRight className="h-3 w-3" />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Contenedor de tarjetas - VISTA MÓVIL */}
      <div className="block lg:hidden space-y-4">
        {quotesQuery.isLoading && (
          <QuoteCardSkeleton count={3} />
        )}
        {!quotesQuery.isLoading && quotesData && quotesData.results.length === 0 && (
          <QuoteCardEmpty />
        )}
        {quotesData?.results.map((quote: QuoteSummary) => (
          <div
            key={quote.quote_id}
            onClick={() => handleViewDetail(quote)}
            className="rounded-2xl bg-white shadow-soft border border-gray-100 p-4 active:border-medical-primary transition-all duration-200 cursor-pointer"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold text-gray-800">Cotización #{quote.quote_id}</span>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                  statusStyles[quote.status]
                }`}
              >
                {statusMap.get(quote.status)?.label || quote.status}
              </span>
            </div>
            <div className="text-sm text-gray-500 space-y-1">
              <p>
                <span className="font-medium text-gray-600">Fecha de creación:</span> {formatDate(quote.created_at)}
              </p>
              <p>
                <span className="font-medium text-gray-600">Vencimiento:</span> {formatDate(quote.expires_at)}
              </p>
              <p>
                <span className="font-medium text-gray-600">Total:</span>{' '}
                {formatCurrency(quote.total_gross, quote.currency)}
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 text-right">
              <span className="flex items-center justify-end gap-2 text-sm font-semibold text-medical-primary">
                Ver Detalles <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      {quotesData?.pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 border-t border-gray-200">
            <div className="text-sm text-medical-gray-500">
              Página {quotesData.pagination.page} de {quotesData.pagination.total_pages} ·{' '}
              {quotesData.pagination.total_items} cotizaciones
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
                    quotesData?.pagination
                      ? Math.min(quotesData.pagination.total_pages, prev + 1)
                      : prev + 1
                  )
                }
                disabled={
                  !quotesData?.pagination ||
                  page >= quotesData.pagination.total_pages ||
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

