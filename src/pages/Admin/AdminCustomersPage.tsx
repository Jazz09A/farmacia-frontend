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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
            <span className="truncate">Gestión de Clientes</span>
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
            Administra y supervisa todos los clientes registrados en tu plataforma.
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <div className="bg-white rounded-lg shadow-md p-3 lg:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">Total Clientes</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-2 lg:p-3 bg-blue-100 rounded-full flex-shrink-0">
              <Users className="w-4 h-4 lg:w-6 lg:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-3 lg:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">Clientes Activos</p>
              <p className="text-lg lg:text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="p-2 lg:p-3 bg-green-100 rounded-full flex-shrink-0">
              <UserCheck className="w-4 h-4 lg:w-6 lg:h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-3 lg:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">Con Email</p>
              <p className="text-lg lg:text-2xl font-bold text-blue-600">{stats.with_email}</p>
            </div>
            <div className="p-2 lg:p-3 bg-blue-100 rounded-full flex-shrink-0">
              <Mail className="w-4 h-4 lg:w-6 lg:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-3 lg:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">Jurídicos</p>
              <p className="text-lg lg:text-2xl font-bold text-purple-600">{stats.juridico}</p>
            </div>
            <div className="p-2 lg:p-3 bg-purple-100 rounded-full flex-shrink-0">
              <Building className="w-4 h-4 lg:w-6 lg:h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-3 lg:p-6">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 mb-3 lg:mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email, RIF, código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  className="pl-9 pr-4 py-2 w-full text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800"
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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                  onlyWithEmail
                    ? 'bg-blue-50 border-blue-500 text-blue-700 hover:bg-blue-100'
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
                title={onlyWithEmail ? 'Mostrando solo clientes con email. Click para incluir sin email' : 'Mostrando todos los clientes. Click para solo con email'}
              >
                <Mail className={`w-4 h-4 ${onlyWithEmail ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className="text-sm whitespace-nowrap">
                  {onlyWithEmail ? 'Solo con email' : 'Todos'}
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

      {/* Results Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-600">
        <p>
          Mostrando {paginatedCustomers.length} de {filteredCustomers.length} clientes
          {selectedCustomers.length > 0 && (
            <span className="ml-2 text-blue-600 font-medium">
              ({selectedCustomers.length} seleccionados)
            </span>
          )}
        </p>
        {createSummary && (
          <div className="mt-2 sm:mt-0 bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2 rounded-lg">
            <span className="font-semibold">Resultado:</span>
            {' '}Usuarios creados {createSummary.users_created}, fallidos {createSummary.users_failed} · Correos enviados {createSummary.emails_sent}, fallidos {createSummary.emails_failed} · Éxito {createSummary.success_rate}%
          </div>
        )}
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <span>Elementos por página:</span>
          <select className="border border-gray-300 rounded px-2 py-1 text-sm">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
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
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Clientes ({filteredCustomers.length})</h3>
          {selectedCustomers.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">{selectedCustomers.length} seleccionados</span>
              <button className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        
        {/* Mobile View - Cards */}
        <div className="md:hidden">
          <div className="divide-y divide-gray-200">
            {paginatedCustomers.map((customer) => (
              <div 
                key={customer.customer_code} 
                className="p-4"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${!customer.inactive ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Building className={`w-6 h-6 ${!customer.inactive ? 'text-green-600' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 truncate">{getCustomerDisplayName(customer)}</p>
                    <p className="text-sm text-gray-500">{customer.email || customer.alternate_email || 'Sin email'}</p>
                    <p className="text-xs text-gray-400">Código: {customer.customer_code} • RIF: {customer.rif || 'N/A'}</p>
                  </div>
                  <div className="text-right space-y-1">
                    {getStatusBadge(customer)}
                    {getTypeBadge(customer)}
                  </div>
                </div>
                 <div className="flex justify-between items-end mt-4">
                    <div className="text-sm text-gray-600">
                      {customer.phones && <p className="flex items-center gap-1"><Phone className="w-3 h-3" />{customer.phones}</p>}
                      {getEmailBadge(customer)}
                    </div>
                    <div className="flex items-center space-x-2">
                       <button 
                        onClick={(e) => handleDeleteRequest(e, customer)}
                        className="p-2 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-600"
                        title="Eliminar Cliente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="p-4">
                  <div className="flex items-center">
                  <input
                      id="checkbox-all-search" 
                    type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    checked={selectedCustomers.length === paginatedCustomers.length && paginatedCustomers.length > 0}
                    onChange={handleSelectAll}
                  />
                    <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
                  </div>
                </th>
                <th scope="col" className="px-6 py-3">Cliente</th>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3">Teléfono</th>
                <th scope="col" className="px-6 py-3">RIF</th>
                <th scope="col" className="px-6 py-3">Tipo</th>
                <th scope="col" className="px-6 py-3">Estado</th>
                <th scope="col" className="px-6 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustomers.map(customer => (
                <tr 
                  key={customer.customer_code}
                  className="bg-white border-b hover:bg-gray-50"
                >
                  <td className="w-4 p-4">
                    <div className="flex items-center">
                    <input
                        id={`checkbox-table-search-${customer.customer_code}`} 
                      type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      checked={selectedCustomers.includes(customer.customer_code)}
                      onChange={() => handleSelectCustomer(customer.customer_code)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <label htmlFor={`checkbox-table-search-${customer.customer_code}`} className="sr-only">checkbox</label>
                    </div>
                  </td>
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap flex items-center space-x-3">
                    <div className={`p-3 rounded-full ${!customer.inactive ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Building className={`w-6 h-6 ${!customer.inactive ? 'text-green-600' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <div className="text-base font-semibold">{getCustomerDisplayName(customer)}</div>
                      <div className="text-xs text-gray-400">Código: {customer.customer_code}</div>
                    </div>
                  </th>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {customer.email || customer.alternate_email || 'Sin email'}
                    </div>
                    {customer.alternate_email && customer.email && (
                      <div className="text-xs text-gray-500">Alt: {customer.alternate_email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {customer.phones || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-gray-900">
                      {customer.rif || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getTypeBadge(customer)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(customer)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={(e) => handleDeleteRequest(e, customer)}
                        className="p-2 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-600"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            <span className="text-sm text-gray-700">
              Página <span className="font-semibold">{currentPage}</span> de <span className="font-semibold">{totalPages}</span>
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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