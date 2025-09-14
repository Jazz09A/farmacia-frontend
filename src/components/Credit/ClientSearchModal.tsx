import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Building, Mail, Phone, Calendar, CreditCard, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Client } from '../../types/credit';
import CreditService from '../../services/CreditService';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface ClientSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectClient: (client: Client) => void;
  className?: string;
}

export const ClientSearchModal: React.FC<ClientSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectClient,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Debounced search
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (query: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (query.trim().length >= 2) {
            searchClients(query, 1);
          } else {
            setClients([]);
            setError(null);
          }
        }, 300);
      };
    })(),
    []
  );

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setClients([]);
      setError(null);
      setSelectedClient(null);
      setPage(1);
    }
  }, [isOpen]);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const searchClients = async (query: string, pageNum: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await CreditService.searchClients(query, pageNum, 10);
      setClients(response.clients);
      setHasMore(response.clients.length === 10);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar clientes');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      searchClients(searchQuery, page + 1);
    }
  };

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
  };

  const handleConfirmSelection = () => {
    if (selectedClient) {
      onSelectClient(selectedClient);
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCreditStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'suspended': return 'text-yellow-600 bg-yellow-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCreditStatusText = (status?: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'suspended': return 'Suspendido';
      case 'inactive': return 'Inactivo';
      default: return 'Sin crédito';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Search className="w-6 h-6 text-blue-600" />
              Buscar Cliente
            </h3>
            <p className="text-gray-600 mt-1">
              Busca y selecciona un cliente para asignar crédito
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre de empresa, email o RIF..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              autoFocus
            />
          </div>
          {searchQuery.length > 0 && searchQuery.length < 2 && (
            <p className="text-sm text-gray-500 mt-2">
              Escribe al menos 2 caracteres para buscar
            </p>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {loading && clients.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="text-gray-600 mt-4">Buscando clientes...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-medium">{error}</p>
                <button
                  onClick={() => searchClients(searchQuery)}
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : clients.length === 0 && searchQuery.length >= 2 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No se encontraron clientes</p>
                <p className="text-gray-500 text-sm mt-1">
                  Intenta con un término de búsqueda diferente
                </p>
              </div>
            </div>
          ) : clients.length > 0 ? (
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                {clients.map((client) => (
                  <motion.div
                    key={client.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedClient?.id === client.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => handleSelectClient(client)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Building className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">
                              {client.company_name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {client.user_type === 'juridico' ? 'Empresa' : 'Persona Natural'}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{client.email}</span>
                          </div>
                          {client.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4" />
                              <span>{client.phone}</span>
                            </div>
                          )}
                          {client.rif && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <CreditCard className="w-4 h-4" />
                              <span>{client.rif}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>Miembro desde {formatDate(client.created_at)}</span>
                          </div>
                        </div>

                        {client.credit_info && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">Estado de Crédito:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCreditStatusColor(client.credit_info.credit_status)}`}>
                                {getCreditStatusText(client.credit_info.credit_status)}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                              <div>
                                <span className="text-gray-600">Disponible:</span>
                                <span className="font-medium ml-1">${client.credit_info.available_credit.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Límite:</span>
                                <span className="font-medium ml-1">${client.credit_info.credit_limit.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="ml-4">
                        {selectedClient?.id === client.id ? (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {hasMore && (
                  <div className="text-center pt-4">
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Cargando...' : 'Cargar más'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Busca un cliente</p>
                <p className="text-gray-500 text-sm mt-1">
                  Escribe el nombre de la empresa, email o RIF
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedClient ? (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Cliente seleccionado: <strong>{selectedClient.company_name}</strong>
                </span>
              ) : (
                'Selecciona un cliente para continuar'
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSelection}
                disabled={!selectedClient}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Seleccionar Cliente
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
