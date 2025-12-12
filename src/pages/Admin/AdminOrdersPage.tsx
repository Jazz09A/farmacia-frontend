import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  RefreshCw,
  SortAsc,
  SortDesc,
  ChevronLeft,
  ChevronRight,
  XCircle,
  Calendar
} from 'lucide-react';
import { QuoteSummary, QuoteStatus } from '../../types/quotes';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAdminQuotesQuery } from '../../hooks/queries/useAdminQueries';
import { useAdminCurrency } from '../../contexts/AdminCurrencyContext';
import SmartPriceDisplay from '../../components/Admin/SmartPriceDisplay';
import AdminQuoteModal from '../../components/Admin/AdminQuoteModal';

const AdminOrdersPage: React.FC = () => {
  const { formatPrice } = useAdminCurrency();
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({ status: 'all', search: '', sortBy: 'created_at', sortOrder: 'desc', page_size: 10 });
  const [currentPage, setPage] = useState(1);
  const { data: quotesResp, isLoading: loading, status, error, refetch } = useAdminQuotesQuery({
    page: currentPage,
    page_size: filters.page_size,
    status: filters.status !== 'all' ? filters.status : undefined,
    search: filters.search,
    sort_by: filters.sortBy,
    sort_order: filters.sortOrder as 'asc' | 'desc'
  });
  const quotes = quotesResp?.quotes || [];
  const total = quotesResp?.total || 0;
  const pages = quotesResp?.pages || 0;

  // Función para traducir estados de cotizaciones
  const getQuoteStatusText = (status: QuoteStatus) => {
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
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1";
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'accepted':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'converted':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'expired':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };



  // Formatear fecha de forma compacta para móviles
  const formatDate = (dateString: string, compact: boolean = false) => {
    const date = new Date(dateString);
    if (compact) {
      // Formato compacto para móviles: "30 nov 2025, 7:16 PM"
      return new Intl.DateTimeFormat('es-VE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(date);
    }
    // Formato estándar para desktop
    return new Intl.DateTimeFormat('es-VE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const removeCOTPrefix = (quoteId: string) => {
    if (!quoteId) return quoteId;
    return quoteId.startsWith('COT-') ? quoteId.substring(4) : quoteId;
  };

  // Formatear precio con símbolo de dólar (solo $, sin texto adicional)
  const formatPriceLocal = (amount: number | string) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) return '$0.00';
    const formatted = numericAmount.toLocaleString('es-VE', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
    return `$${formatted}`;
  };

  const handleViewQuote = (quote: QuoteSummary) => {
    setSelectedQuoteId(quote.quote_id);
  };
  
  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPage(1); // Reset to first page on search
  };

  const handleStatusFilterChange = (status: string) => {
    setFilters(prev => ({ ...prev, status }));
    setPage(1); // Reset to first page on filter change
  };

  const handleSortChange = (sortBy: string) => {
    const newSortOrder = filters.sortBy === sortBy && filters.sortOrder === 'desc' ? 'asc' : 'desc';
    setFilters(prev => ({ ...prev, sortBy, sortOrder: newSortOrder }));
  };

  const handleRefresh = async () => {
    await refetch();
  };

  if (loading && quotes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Optimizado para móviles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
            Gestión de Cotizaciones
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-600">
            Administra todas las cotizaciones
            <span className="ml-1.5 font-semibold text-gray-700">({total})</span>
          </p>
        </div>
        <div className="flex flex-row gap-2 w-full sm:w-auto">
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center font-medium text-sm shadow-sm hover:shadow-md min-h-[44px]"
            aria-label="Actualizar cotizaciones"
          >
            <RefreshCw className={`w-4 h-4 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-red-800 text-sm">
              {error instanceof Error ? error.message : 'Error al cargar las cotizaciones'}
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search - Comentado por ahora */}
      {/* <div className="p-3 lg:p-4 bg-white rounded-lg shadow-sm">
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
            <option value="accepted">Aceptada</option>
            <option value="converted">Convertida</option>
            <option value="expired">Expirada</option>
            <option value="cancelled">Cancelada</option>
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
            <option value="total_gross_desc">Mayor valor</option>
            <option value="total_gross_asc">Menor valor</option>
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
      </div> */}

      {/* Quotes List/Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Cotizaciones</h3>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
              {quotes.length}
            </span>
          </div>
          <div className="text-xs text-gray-600 font-medium">
            Página <span className="font-bold text-gray-900">{currentPage}</span> de <span className="font-bold text-gray-900">{pages}</span>
          </div>
        </div>
        
        {quotes.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-2">No se encontraron cotizaciones</p>
            <p className="text-sm text-gray-500">Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          <>
            {/* Mobile View - Enhanced Cards with Professional UX/UI */}
            <div className="md:hidden">
              <div className="divide-y divide-gray-200">
                {quotes.map((quote) => (
                  <button
                    key={quote.quote_id}
                    onClick={() => handleViewQuote(quote)}
                    className="w-full text-left p-4 hover:bg-blue-50 active:bg-blue-100 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                  >
                    {/* Header: ID, Monto y Estado */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-bold text-gray-900 text-base leading-tight">
                            {removeCOTPrefix(quote.quote_id)}
                          </h3>
                          <div className={getStatusBadge(quote.status)}>
                            {getStatusIcon(quote.status)}
                            <span className="text-xs whitespace-nowrap">{getQuoteStatusText(quote.status)}</span>
                          </div>
                        </div>
                      </div>
                      {/* Monto destacado - Solo símbolo $ */}
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-gray-900 text-lg leading-tight">
                          {formatPriceLocal(quote.total_gross)}
                        </div>
                          </div>
                        </div>

                    {/* Información secundaria optimizada para móviles */}
                    <div className="space-y-2">
                        {quote.profit_plus_id && (
                        <div className="text-xs text-gray-600 flex items-center gap-1.5">
                          <span className="font-medium">ID:</span>
                          <span className="font-mono text-gray-700">{quote.profit_plus_id}</span>
                        </div>
                        )}
                      
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-600">
                        <span className="flex items-center gap-1.5 min-w-0">
                          <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                          <span className="truncate">{formatDate(quote.created_at, true)}</span>
                          </span>
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                          <span className="font-medium">{quote.items_count}</span>
                          </span>
                        </div>

                      {quote.email_sent_at && (
                        <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">Email enviado</span>
                        </div>
                      )}

                        {quote.expires_at && (
                        <div className="flex items-center gap-1.5 text-xs text-orange-700 bg-orange-50 px-2 py-1 rounded">
                          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">Expira: {formatDate(quote.expires_at, true)}</span>
                          </div>
                        )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop View - Enhanced Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-4 lg:px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSortChange('quote_id')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold">Cotización</span>
                        {filters.sortBy === 'quote_id' && (
                          filters.sortOrder === 'desc' ? <SortDesc className="w-3.5 h-3.5" /> : <SortAsc className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-4 lg:px-6 py-3 font-semibold">ID Sistema</th>
                    <th 
                      scope="col" 
                      className="px-4 lg:px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSortChange('created_at')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold">Fecha</span>
                        {filters.sortBy === 'created_at' && (
                          filters.sortOrder === 'desc' ? <SortDesc className="w-3.5 h-3.5" /> : <SortAsc className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-4 lg:px-6 py-3 font-semibold">Expira</th>
                    <th 
                      scope="col" 
                      className="px-4 lg:px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSortChange('total_gross')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold">Total</span>
                        {filters.sortBy === 'total_gross' && (
                          filters.sortOrder === 'desc' ? <SortDesc className="w-3.5 h-3.5" /> : <SortAsc className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-4 lg:px-6 py-3 font-semibold">Items</th>
                    <th 
                      scope="col" 
                      className="px-4 lg:px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSortChange('status')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold">Estado</span>
                        {filters.sortBy === 'status' && (
                          filters.sortOrder === 'desc' ? <SortDesc className="w-3.5 h-3.5" /> : <SortAsc className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {quotes.map((quote) => (
                    <tr 
                      key={quote.quote_id} 
                      onClick={() => handleViewQuote(quote)}
                      className="hover:bg-blue-50 cursor-pointer transition-colors duration-150 active:bg-blue-100"
                    >
                      <td className="px-4 lg:px-6 py-4">
                        <div className="font-semibold text-gray-900 text-base">
                          {removeCOTPrefix(quote.quote_id)}
                        </div>
                        {quote.email_sent_at && (
                          <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Email enviado
                          </div>
                        )}
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="text-xs text-gray-600 font-mono">{quote.profit_plus_id || '-'}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="text-sm text-gray-700">{formatDate(quote.created_at)}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="text-xs text-gray-600">
                          {quote.expires_at ? formatDate(quote.expires_at) : <span className="text-gray-400">-</span>}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="font-bold text-gray-900 text-base">
                          {formatPriceLocal(quote.total_gross)}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="text-sm font-medium text-gray-700">{quote.items_count}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className={getStatusBadge(quote.status)}>
                          {getStatusIcon(quote.status)}
                          <span>{getQuoteStatusText(quote.status)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination - Optimizada para móviles */}
        {pages > 1 && (
          <div className="px-3 sm:px-4 py-3 sm:py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1 text-center sm:text-left">
              Mostrando <span className="font-semibold text-gray-900">{((currentPage - 1) * filters.page_size) + 1}</span> a{' '}
              <span className="font-semibold text-gray-900">{Math.min(currentPage * filters.page_size, total)}</span> de{' '}
              <span className="font-semibold text-gray-900">{total}</span>
            </div>
            <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-center sm:justify-end">
              <button
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-150 shadow-sm hover:shadow-md flex items-center justify-center min-w-[44px]"
                aria-label="Página anterior"
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
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 min-w-[40px] ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 active:bg-gray-100 shadow-sm hover:shadow'
                      }`}
                      aria-label={`Ir a página ${pageNum}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <div className="sm:hidden px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg min-w-[80px] text-center">
                {currentPage} / {pages}
              </div>

              <button
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === pages}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-150 shadow-sm hover:shadow-md flex items-center justify-center min-w-[44px]"
                aria-label="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quote Modal */}
      {selectedQuoteId && (
        <AdminQuoteModal
          quoteId={selectedQuoteId}
          onClose={() => setSelectedQuoteId(null)}
        />
      )}
    </div>
  );
};

export default AdminOrdersPage;