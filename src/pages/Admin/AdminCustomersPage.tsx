import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Building,
  User,
  DollarSign,
  UserCheck,
  UserX,
  Download,
  Upload,
} from 'lucide-react';
import { motion } from 'framer-motion';
import ConfirmationModal from '../../components/common/ConfirmationModal';

// Mock data para clientes (extender el mockData existente)
interface Customer {
  id: string;
  user_type: 'natural' | 'juridico';
  email: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  last_login: string;
  total_orders: number;
  total_spent: number;
  // Para usuarios naturales
  first_name?: string;
  last_name?: string;
  phone?: string;
  birth_date?: string;
  address?: string;
  // Para usuarios jurídicos
  company_name?: string;
  rif?: string;
  company_phone?: string;
  company_address?: string;
  contact_person?: string;
}

const mockCustomers: Customer[] = [
  {
    id: '1',
    user_type: 'juridico',
    email: 'admin@farmaciasalud.com',
    status: 'active',
    created_at: '2024-01-15',
    last_login: '2024-03-10',
    total_orders: 45,
    total_spent: 125000,
    company_name: 'Farmacia Salud Total',
    rif: 'J-40123456-7',
    company_phone: '+58-212-1234567',
    company_address: 'Av. Libertador, Caracas',
    contact_person: 'María González'
  },
  {
    id: '2',
    user_type: 'natural',
    email: 'carlos.martinez@gmail.com',
    status: 'active',
    created_at: '2024-02-01',
    last_login: '2024-03-09',
    total_orders: 12,
    total_spent: 35000,
    first_name: 'Carlos',
    last_name: 'Martínez',
    phone: '+58-414-1234567',
    birth_date: '1985-08-15',
    address: 'Calle 123, Valencia'
  },
  {
    id: '3',
    user_type: 'juridico',
    email: 'info@farmavida.com',
    status: 'pending',
    created_at: '2024-03-01',
    last_login: '2024-03-08',
    total_orders: 3,
    total_spent: 15000,
    company_name: 'Farmacia Vida Nueva',
    rif: 'J-30987654-3',
    company_phone: '+58-251-9876543',
    company_address: 'Centro Comercial Plaza, Maracay',
    contact_person: 'Ana Rodríguez'
  },
  {
    id: '4',
    user_type: 'natural',
    email: 'lucia.fernandez@hotmail.com',
    status: 'inactive',
    created_at: '2023-11-20',
    last_login: '2024-01-15',
    total_orders: 8,
    total_spent: 22000,
    first_name: 'Lucía',
    last_name: 'Fernández',
    phone: '+58-426-7890123',
    birth_date: '1990-12-03',
    address: 'Urbanización El Rosal, Caracas'
  }
];

const AdminCustomersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const itemsPerPage = 10;

  // Filtrar clientes
  const filteredCustomers = useMemo(() => {
    return mockCustomers.filter(customer => {
      const matchesSearch = 
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.first_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.last_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.company_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.rif?.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
      const matchesType = typeFilter === 'all' || customer.user_type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [searchTerm, statusFilter, typeFilter]);

  // Paginación
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Activo', class: 'bg-green-100 text-green-800' },
      inactive: { label: 'Inactivo', class: 'bg-gray-100 text-gray-800' },
      pending: { label: 'Pendiente', class: 'bg-yellow-100 text-yellow-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const getCustomerDisplayName = (customer: Customer) => {
    if (customer.user_type === 'natural') {
      return `${customer.first_name} ${customer.last_name}`;
    }
    return customer.company_name || 'Sin nombre';
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === paginatedCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(paginatedCustomers.map(c => c.id));
    }
  };

  const handleDeleteRequest = (e: React.MouseEvent, customer: Customer) => {
    e.stopPropagation();
    setCustomerToDelete(customer);
  };

  const handleConfirmDelete = () => {
    if (!customerToDelete) return;
    // Lógica de eliminación
    console.log(`Cliente ${customerToDelete.id} eliminado`);
    setCustomerToDelete(null);
  };

  // Estadísticas
  const stats = {
    total: mockCustomers.length,
    active: mockCustomers.filter(c => c.status === 'active').length,
    pending: mockCustomers.filter(c => c.status === 'pending').length,
    totalRevenue: mockCustomers.reduce((sum, c) => sum + c.total_spent, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="w-8 h-8 mr-3 text-blue-600" />
            Gestión de Clientes
          </h1>
          <p className="mt-2 text-gray-600">
            Administra y supervisa todos los clientes registrados en tu plataforma.
          </p>
        </div>
        <div className="w-full sm:w-auto mt-4 sm:mt-0">
           {/* Mobile Buttons */}
           <div className="sm:hidden">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center px-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <Filter className="w-4 h-4 mr-1" />
                Filtros
              </button>
              <button className="flex items-center justify-center px-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                <Upload className="w-4 h-4 mr-1" />
                Importar
              </button>
              <button className="flex items-center justify-center px-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                <Download className="w-4 h-4 mr-1" />
                Exportar
              </button>
            </div>
            <button 
              className="mt-2 w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Cliente
            </button>
          </div>
          {/* Desktop Buttons */}
          <div className="hidden sm:flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Cliente
          </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <UserX className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email, RIF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
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
                  <option value="pending">Pendientes</option>
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
                  <option value="natural">Personas Naturales</option>
                  <option value="juridico">Personas Jurídicas</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setTypeFilter('all');
                    setSearchTerm('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Limpiar Filtros
                </button>
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
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <span>Elementos por página:</span>
          <select className="border border-gray-300 rounded px-2 py-1 text-sm">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      {/* Customers List/Table */}
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
                key={customer.id} 
                className="p-4"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${customer.user_type === 'natural' ? 'bg-blue-100' : 'bg-green-100'}`}>
                    {customer.user_type === 'natural' ? <User className="w-6 h-6 text-blue-600" /> : <Building className="w-6 h-6 text-green-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 truncate">{getCustomerDisplayName(customer)}</p>
                    <p className="text-sm text-gray-500">{customer.email}</p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(customer.status)}
                  </div>
                </div>
                 <div className="flex justify-between items-end mt-4">
                    <div className="text-sm text-gray-600">
                      <p>Gastado:</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(customer.total_spent)}</p>
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
                <th scope="col" className="px-6 py-3">Tipo</th>
                <th scope="col" className="px-6 py-3">Estado</th>
                <th scope="col" className="px-6 py-3">Total Gastado</th>
                <th scope="col" className="px-6 py-3">Registro</th>
                <th scope="col" className="px-6 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustomers.map(customer => (
                <tr 
                  key={customer.id}
                  className="bg-white border-b hover:bg-gray-50"
                >
                  <td className="w-4 p-4">
                    <div className="flex items-center">
                    <input
                        id={`checkbox-table-search-${customer.id}`} 
                      type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={() => handleSelectCustomer(customer.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <label htmlFor={`checkbox-table-search-${customer.id}`} className="sr-only">checkbox</label>
                    </div>
                  </td>
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap flex items-center space-x-3">
                    <div className={`p-3 rounded-full ${customer.user_type === 'natural' ? 'bg-blue-100' : 'bg-green-100'}`}>
                      {customer.user_type === 'natural' ? <User className="w-6 h-6 text-blue-600" /> : <Building className="w-6 h-6 text-green-600" />}
                    </div>
                    <div>
                      <div className="text-base font-semibold">{getCustomerDisplayName(customer)}</div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                    </div>
                  </th>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${customer.user_type === 'natural' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      {customer.user_type === 'juridico' ? 'Jurídico' : 'Natural'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(customer.status)}
                  </td>
                  <td className="px-6 py-4 font-semibold">{formatCurrency(customer.total_spent)}</td>
                  <td className="px-6 py-4">{formatDate(customer.created_at)}</td>
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

      {customerToDelete && (
        <ConfirmationModal
          isOpen={!!customerToDelete}
          title="Confirmar Eliminación"
          message={`¿Estás seguro de que deseas eliminar al cliente "${getCustomerDisplayName(customerToDelete)}"? Esta acción no se puede deshacer.`}
          onConfirm={handleConfirmDelete}
          onClose={() => setCustomerToDelete(null)}
          confirmText="Eliminar"
          cancelText="Cancelar"
        />
      )}
    </div>
  );
};

export default AdminCustomersPage; 