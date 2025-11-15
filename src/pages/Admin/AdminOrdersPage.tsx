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



  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-VE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const removeCOTPrefix = (quoteId: string) => {
    if (!quoteId) return quoteId;
    return quoteId.startsWith('COT-') ? quoteId.substring(4) : quoteId;
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Cotizaciones</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
            Administra todas las cotizaciones de tu farmacia ({total} total)
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
          {/* Botón de exportar - Comentado por ahora */}
          {/* <button className="px-3 lg:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors flex items-center justify-center font-medium text-sm">
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Exportar</span>
          </button> */}
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
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-3 lg:p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h3 className="text-base lg:text-lg font-semibold">Cotizaciones ({quotes.length})</h3>
          <div className="text-xs lg:text-sm text-gray-500">
            Página {currentPage} de {pages}
          </div>
        </div>
        
        {quotes.length === 0 ? (
          <div className="p-8 lg:p-12 text-center text-gray-500">
            <FileText className="w-8 h-8 lg:w-12 lg:h-12 mx-auto mb-3 lg:mb-4 text-gray-300" />
            <p className="text-base lg:text-lg font-medium mb-1 lg:mb-2">No se encontraron cotizaciones</p>
            <p className="text-sm lg:text-base">Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          <>
            {/* Mobile View - Enhanced Cards */}
            <div className="md:hidden">
              <div className="divide-y divide-gray-200">
                {quotes.map((quote) => (
                  <button
                    key={quote.quote_id}
                    onClick={() => handleViewQuote(quote)}
                    className="w-full text-left p-3 lg:p-4 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <div className="font-semibold text-gray-900 text-base">{removeCOTPrefix(quote.quote_id)}</div>
                          <div className={getStatusBadge(quote.status)}>
                            {getStatusIcon(quote.status)}
                            <span className="text-xs">{getQuoteStatusText(quote.status)}</span>
                          </div>
                        </div>
                        {quote.profit_plus_id && (
                          <div className="text-xs text-gray-500 mb-1">ID Sistema: {quote.profit_plus_id}</div>
                        )}
                        {quote.email_sent_at && (
                          <div className="text-xs text-gray-400 mb-1">Email enviado</div>
                        )}
                        <div className="text-xs text-gray-500 flex items-center gap-3 mt-1 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(quote.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {quote.items_count} {quote.items_count === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                        {quote.expires_at && (
                          <div className="text-xs text-gray-400 mt-1">
                            Expira: {formatDate(quote.expires_at)}
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className="font-bold text-gray-900 text-base lg:text-lg">
                          {quote.currency} {Number(quote.total_gross).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        {quote.email_sent_at && (
                          <div className="text-xs text-gray-500 mt-1">Email enviado</div>
                        )}
                      </div>
                    </div>
                  </button>
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
                      onClick={() => handleSortChange('quote_id')}
                    >
                      <div className="flex items-center gap-1">
                        Cotización
                        {filters.sortBy === 'quote_id' && (
                          filters.sortOrder === 'desc' ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3">ID Sistema</th>
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
                    <th scope="col" className="px-6 py-3">Expira</th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSortChange('total_gross')}
                    >
                      <div className="flex items-center gap-1">
                        Total
                        {filters.sortBy === 'total_gross' && (
                          filters.sortOrder === 'desc' ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3">Items</th>
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
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {quotes.map((quote) => (
                    <tr 
                      key={quote.quote_id} 
                      onClick={() => handleViewQuote(quote)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 text-base">
                          {removeCOTPrefix(quote.quote_id)}
                        </div>
                        {quote.email_sent_at && (
                          <div className="text-xs text-gray-400 mt-0.5">Email enviado</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-500">{quote.profit_plus_id || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div>{formatDate(quote.created_at)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs">{quote.expires_at ? formatDate(quote.expires_at) : '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {quote.currency} {Number(quote.total_gross).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">{quote.items_count}</div>
                      </td>
                      <td className="px-6 py-4">
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

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-3 lg:px-6 py-3 lg:py-4 border-t bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs lg:text-sm text-gray-700">
              Mostrando {((currentPage - 1) * filters.page_size) + 1} a {Math.min(currentPage * filters.page_size, total)} de {total} cotizaciones
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