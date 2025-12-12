import React, { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Building,
  UserCheck,
  UserX,
  Download,
  Upload,
  Loader2,
  Mail,
  Phone
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SourceSystemCustomer } from '../../types';
import { adminService } from '../../services/AdminService';

const ConfirmationModal = lazy(() => import('../../components/common/ConfirmationModal'));



const AdminCustomersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [customerToDelete, setCustomerToDelete] = useState<SourceSystemCustomer | null>(null);
  const [customers, setCustomers] = useState<SourceSystemCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [onlyWithEmail, setOnlyWithEmail] = useState(true);
  const [creatingUsers, setCreatingUsers] = useState(false);
  const [createSummary, setCreateSummary] = useState<null | { users_created: number; users_failed: number; emails_sent: number; emails_failed: number; success_rate: number }>(null);

  const itemsPerPage = 20;

  // Cargar clientes al montar el componente y cuando cambian los filtros
  useEffect(() => {
    fetchCustomers();
  }, [currentPage, includeInactive, onlyWithEmail]);

  // Auto-cerrar notificación de resultado después de 5 segundos
  useEffect(() => {
    if (createSummary) {
      const timer = setTimeout(() => {
        setCreateSummary(null);
      }, 5000); // 5 segundos

      return () => clearTimeout(timer);
    }
  }, [createSummary]);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.fetchSourceCustomers({
        page: currentPage,
        limit: itemsPerPage,
        include_inactive: includeInactive,
        only_with_email: onlyWithEmail,
        search: searchTerm || undefined
      });
      
      setCustomers(response.customers);
      setTotalCustomers(response.total);
      
      if (response.customers.length === 0) {
        setError('No se encontraron clientes con los filtros aplicados');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar clientes del sistema legacy');
      console.error('Error fetching source customers:', err);
      setCustomers([]);
      setTotalCustomers(0);
    } finally {
      setLoading(false);
    }
  };

  // Los clientes ya vienen filtrados del backend, solo aplicamos filtros locales
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && !customer.inactive) ||
        (statusFilter === 'inactive' && customer.inactive);

      const matchesType = typeFilter === 'all' || 
        (typeFilter === 'juridico' && customer.is_juridico) ||
        (typeFilter === 'natural' && !customer.is_juridico);

      return matchesStatus && matchesType;
    });
  }, [customers, statusFilter, typeFilter]);

  // Paginación manejada por el backend
  const totalPages = Math.ceil(totalCustomers / itemsPerPage);
  const paginatedCustomers = filteredCustomers; // Ya vienen paginados del backend

  const getStatusBadge = (customer: SourceSystemCustomer) => {
    if (!customer.inactive) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          Activo
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
          Inactivo
        </span>
      );
    }
  };

  const getTypeBadge = (customer: SourceSystemCustomer) => {
    if (customer.is_juridico) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          Jurídico
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
          Natural
        </span>
      );
    }
  };

  const getEmailBadge = (customer: SourceSystemCustomer) => {
    if (customer.email || customer.alternate_email) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          <Mail className="w-3 h-3 mr-1" />
          Con email
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
          Sin email
        </span>
      );
    }
  };

  const getCustomerDisplayName = (customer: SourceSystemCustomer) => {
    return customer.customer_name || customer.customer_code || 'Sin nombre';
  };

  const handleSearch = () => {
    setCurrentPage(1); // Reset a la página 1 cuando se busca
    fetchCustomers();
  };

  const handleSelectCustomer = (customerCode: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerCode) 
        ? prev.filter(code => code !== customerCode)
        : [...prev, customerCode]
    );
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === paginatedCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(paginatedCustomers.map(c => c.customer_code));
    }
  };

  const handleDeleteRequest = (e: React.MouseEvent, customer: SourceSystemCustomer) => {
    e.stopPropagation();
    setCustomerToDelete(customer);
  };

  const handleConfirmDelete = () => {
    if (!customerToDelete) return;
    // Lógica de eliminación
    setCustomerToDelete(null);
  };

  // Crear usuarios y enviar correos desde clientes del sistema legacy
  const handleCreateUsers = async (useAlternateEmails: boolean) => {
    if (selectedCustomers.length === 0 || creatingUsers) return;
    setCreatingUsers(true);
    try {
      const res = await adminService.createUsersFromSourceCustomers({
        customer_codes: selectedCustomers,
        use_alternate_emails: useAlternateEmails,
      });
      const s = res.summary;
      setCreateSummary({
        users_created: s.users_created,
        users_failed: s.users_failed,
        emails_sent: s.emails_sent,
        emails_failed: s.emails_failed,
        success_rate: s.success_rate,
      });
      // refrescar lista por si hay cambios
      await fetchCustomers();
    } catch (e) {
      console.error('Error creando usuarios / enviando emails', e);
      setCreateSummary(null);
    } finally {
      setCreatingUsers(false);
    }
  };

  // Estadísticas
  const stats = {
    total: totalCustomers,
    active: customers.filter(c => !c.inactive).length,
    with_email: customers.filter(c => c.email || c.alternate_email).length,
    juridico: customers.filter(c => c.is_juridico).length
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header - Optimized */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
            <span className="truncate">Gestión de Clientes</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-600">
            Administra todos los clientes registrados
          </p>
        </div>
        <div className="w-full sm:w-auto">
           {/* Mobile Buttons */}
           <div className="sm:hidden">
            <div className="grid grid-cols-3 gap-2 mb-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center px-2 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm font-medium"
              >
                <Filter className="w-4 h-4 mr-1" />
                <span className="truncate">Filtros</span>
              </button>
              <button className="flex items-center justify-center px-2 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm font-medium">
                <Upload className="w-4 h-4 mr-1" />
                <span className="truncate">Importar</span>
              </button>
              <button className="flex items-center justify-center px-2 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm font-medium">
                <Download className="w-4 h-4 mr-1" />
                <span className="truncate">Exportar</span>
              </button>
            </div>
            <button 
              className="w-full flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg transition-colors font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Cliente
            </button>
          </div>
          {/* Desktop Buttons */}
          <div className="hidden sm:flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 lg:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors font-medium"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </button>
            {selectedCustomers.length > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCreateUsers(true)}
                  disabled={creatingUsers}
                  className="px-3 lg:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  title="Crear usuarios y enviar correo (usar emails alternos si existen)"
                >
                  {creatingUsers ? 'Procesando...' : 'Crear usuarios + correos'}
                </button>
                <button
                  onClick={() => handleCreateUsers(false)}
                  disabled={creatingUsers}
                  className="px-3 lg:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  title="Crear usuarios y enviar correo (solo email principal)"
                >
                  {creatingUsers ? 'Procesando...' : 'Solo email principal'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards - Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Activos</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
              <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Con Email</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 mt-1">{stats.with_email}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Jurídicos</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600 mt-1">{stats.juridico}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
              <Building className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters - Simplified */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-3 sm:p-4 lg:p-6">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email, RIF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  className="pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 w-full text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                  aria-label="Buscar"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Email Filter Toggle Button */}
            <div className="flex items-center">
              <button
                onClick={() => {
                  setOnlyWithEmail(!onlyWithEmail);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg border-2 font-medium transition-colors min-h-[44px] ${
                  onlyWithEmail
                    ? 'bg-blue-50 border-blue-500 text-blue-700 hover:bg-blue-100'
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
                title={onlyWithEmail ? 'Mostrando solo clientes con email' : 'Mostrando todos los clientes'}
              >
                <Mail className={`w-4 h-4 flex-shrink-0 ${onlyWithEmail ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className="text-sm whitespace-nowrap hidden sm:inline">
                  {onlyWithEmail ? 'Solo con email' : 'Todos'}
                </span>
                <span className="text-sm sm:hidden">
                  {onlyWithEmail ? 'Con email' : 'Todos'}
                </span>
              </button>
            </div>
          </div>

          {/* Filters Row */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Cliente</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="juridico">Personas Jurídicas</option>
                  <option value="natural">Personas Naturales</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={onlyWithEmail}
                    onChange={(e) => setOnlyWithEmail(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Solo con email</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={includeInactive}
                    onChange={(e) => setIncludeInactive(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Incluir inactivos</span>
                </label>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Results Info - Simplified */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-sm text-gray-600">
        <div className="flex items-center gap-2 flex-wrap">
          <p>
            Mostrando <span className="font-semibold text-gray-900">{paginatedCustomers.length}</span> de{' '}
            <span className="font-semibold text-gray-900">{totalCustomers}</span> clientes
          </p>
          {selectedCustomers.length > 0 && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              {selectedCustomers.length} seleccionados
            </span>
          )}
        </div>
        {createSummary && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2 rounded-lg text-xs sm:text-sm">
            <span className="font-semibold">Resultado:</span>
            {' '}Usuarios: {createSummary.users_created} creados, {createSummary.users_failed} fallidos · 
            {' '}Correos: {createSummary.emails_sent} enviados · Éxito: {createSummary.success_rate}%
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm p-12">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-gray-500">Cargando clientes...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-white rounded-lg shadow-sm p-12">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserX className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar clientes</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <button
                onClick={fetchCustomers}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customers List/Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm">
        <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">
            Clientes <span className="text-blue-600">({totalCustomers})</span>
          </h3>
          {selectedCustomers.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-600 font-medium">
                {selectedCustomers.length} seleccionados
              </span>
              <button 
                className="p-2 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                title="Eliminar seleccionados"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        
        {/* Mobile View - Simplified Cards with Checkbox */}
        <div className="md:hidden">
          <div className="divide-y divide-gray-200">
            {paginatedCustomers.map((customer) => (
              <div 
                key={customer.customer_code} 
                className="p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Checkbox para selección */}
                  <div className="flex items-center pt-1 flex-shrink-0">
                    <input
                      id={`checkbox-mobile-${customer.customer_code}`}
                      type="checkbox"
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      checked={selectedCustomers.includes(customer.customer_code)}
                      onChange={() => handleSelectCustomer(customer.customer_code)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <label htmlFor={`checkbox-mobile-${customer.customer_code}`} className="sr-only">
                      Seleccionar {getCustomerDisplayName(customer)}
                    </label>
                  </div>
                  
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${!customer.inactive ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Building className={`w-5 h-5 ${!customer.inactive ? 'text-green-600' : 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-base truncate mb-1">
                        {getCustomerDisplayName(customer)}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        {customer.email || customer.alternate_email ? (
                          <span className="text-sm text-gray-600 truncate flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                            <span className="truncate">{customer.email || customer.alternate_email}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Sin email</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(customer)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop View - Simplified Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" className="p-4 w-14">
                  <div className="flex items-center">
                    <input
                      id="checkbox-all-search" 
                      type="checkbox"
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      checked={selectedCustomers.length === paginatedCustomers.length && paginatedCustomers.length > 0}
                      onChange={handleSelectAll}
                    />
                    <label htmlFor="checkbox-all-search" className="sr-only">Seleccionar todos</label>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 font-semibold">Cliente</th>
                <th scope="col" className="px-6 py-4 font-semibold">Email</th>
                <th scope="col" className="px-6 py-4 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedCustomers.map(customer => (
                <tr 
                  key={customer.customer_code}
                  className="bg-white hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <td className="p-4">
                    <div className="flex items-center">
                      <input
                        id={`checkbox-table-search-${customer.customer_code}`} 
                        type="checkbox"
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        checked={selectedCustomers.includes(customer.customer_code)}
                        onChange={() => handleSelectCustomer(customer.customer_code)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <label htmlFor={`checkbox-table-search-${customer.customer_code}`} className="sr-only">
                        Seleccionar {getCustomerDisplayName(customer)}
                      </label>
                    </div>
                  </td>
                  <th scope="row" className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${!customer.inactive ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <Building className={`w-5 h-5 ${!customer.inactive ? 'text-green-600' : 'text-gray-600'}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-base font-semibold text-gray-900 truncate max-w-md">
                          {getCustomerDisplayName(customer)}
                        </div>
                      </div>
                    </div>
                  </th>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 truncate max-w-xs">
                      {customer.email || customer.alternate_email || (
                        <span className="text-gray-400 italic">Sin email</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(customer)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRequest(e, customer);
                        }}
                        className="p-2 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Eliminar Cliente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination - Optimized */}
        {totalPages > 1 && (
          <div className="px-3 sm:px-4 py-3 sm:py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-xs sm:text-sm text-gray-600">
              Página <span className="font-semibold text-gray-900">{currentPage}</span> de{' '}
              <span className="font-semibold text-gray-900">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 sm:px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-150 shadow-sm hover:shadow-md min-h-[44px] min-w-[100px]"
                aria-label="Página anterior"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 sm:px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-150 shadow-sm hover:shadow-md min-h-[44px] min-w-[100px]"
                aria-label="Página siguiente"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
        </div>
      )}


      {customerToDelete && (
        <Suspense fallback={<div>Cargando...</div>}>
          <ConfirmationModal
            isOpen={!!customerToDelete}
            title="Confirmar Eliminación"
            message={`¿Estás seguro de que deseas eliminar al cliente "${getCustomerDisplayName(customerToDelete)}"? Esta acción no se puede deshacer.`}
            onConfirm={handleConfirmDelete}
            onClose={() => setCustomerToDelete(null)}
            confirmText="Eliminar"
            cancelText="Cancelar"
          />
        </Suspense>
      )}
    </div>
  );
};

export default AdminCustomersPage; 