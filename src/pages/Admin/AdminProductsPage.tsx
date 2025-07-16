import React, { useState, useMemo, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  ShoppingCart,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { mockProducts } from '../../data/mockData';
import { ProductWithStats } from '../../types';
import ProductModal from '../../components/Admin/ProductModal';
import ConfirmationModal from '../../components/common/ConfirmationModal';

// Extender mockProducts con estadísticas
const mockProductsWithStats: ProductWithStats[] = mockProducts.map((product, index) => ({
  ...product,
  views: Math.floor(Math.random() * 1000) + 50,
  sales: Math.floor(Math.random() * 100) + 10,
  revenue: (Math.floor(Math.random() * 100) + 10) * product.priceVES,
  stock_status: product.inStock 
    ? (Math.random() > 0.7 ? 'low_stock' : 'in_stock')
    : 'out_of_stock',
  last_updated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
}));

const AdminProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithStats | null>(null);
  const [productToDelete, setProductToDelete] = useState<ProductWithStats | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  useEffect(() => {
    const body = document.body;
    if (showProductModal) {
      body.style.overflow = 'hidden';
    } else {
      body.style.overflow = 'auto';
    }
    return () => {
      body.style.overflow = 'auto';
    };
  }, [showProductModal]);

  const itemsPerPage = 12;

  // Obtener categorías únicas
  const categories = Array.from(new Set(mockProductsWithStats.map(p => p.category)));

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    return mockProductsWithStats.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && product.inStock) ||
        (statusFilter === 'inactive' && !product.inStock);

      const matchesStock = stockFilter === 'all' || product.stock_status === stockFilter;

      return matchesSearch && matchesCategory && matchesStatus && matchesStock;
    });
  }, [searchTerm, categoryFilter, statusFilter, stockFilter]);

  // Paginación
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
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

  const getStockStatusBadge = (status: string) => {
    const statusConfig = {
      in_stock: { label: 'En Stock', class: 'bg-green-100 text-green-800', icon: CheckCircle },
      low_stock: { label: 'Stock Bajo', class: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      out_of_stock: { label: 'Agotado', class: 'bg-red-100 text-red-800', icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.out_of_stock;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.class} whitespace-nowrap`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === paginatedProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(paginatedProducts.map(p => p.id));
    }
  };

  const handleViewProduct = (product: ProductWithStats) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleEditProduct = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    navigate(`/admin/products/edit/${productId}`);
  };

  const handleDeleteRequest = (e: React.MouseEvent, product: ProductWithStats) => {
    e.stopPropagation();
    setProductToDelete(product);
  };

  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    // Lógica para eliminar el producto
    console.log(`Producto ${productToDelete.id} eliminado.`);
    setProductToDelete(null);
  };


  // Estadísticas
  const stats = {
    total: mockProductsWithStats.length,
    inStock: mockProductsWithStats.filter(p => p.stock_status === 'in_stock').length,
    lowStock: mockProductsWithStats.filter(p => p.stock_status === 'low_stock').length,
    outOfStock: mockProductsWithStats.filter(p => p.stock_status === 'out_of_stock').length,
    totalRevenue: mockProductsWithStats.reduce((sum, p) => sum + p.revenue, 0),
    totalSales: mockProductsWithStats.reduce((sum, p) => sum + p.sales, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Package className="w-8 h-8 mr-3 text-blue-600" />
            Gestión de Productos
          </h1>
          <p className="mt-2 text-gray-600">
            Administra tu inventario, precios y disponibilidad de productos.
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
              onClick={() => navigate('/admin/products/create')}
              className="mt-2 w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Producto
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
            <button 
              onClick={() => navigate('/admin/products/create')}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Producto
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Productos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Stock</p>
              <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Agotados</p>
              <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ventas Totales</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalSales}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 xl:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

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
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los niveles</option>
              <option value="in_stock">En Stock</option>
              <option value="low_stock">Stock Bajo</option>
              <option value="out_of_stock">Agotado</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setCategoryFilter('all');
                setStatusFilter('all');
                setStockFilter('all');
                setSearchTerm('');
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </motion.div>
      )}

      {/* Products List/Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Productos ({filteredProducts.length})</h3>
          {selectedProducts.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">{selectedProducts.length} seleccionados</span>
              <button className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile View - Cards */}
        <div className="md:hidden">
          <div className="divide-y divide-gray-200">
            {paginatedProducts.map((product) => (
              <div 
                key={product.id} 
                className="p-4 active:bg-gray-100"
                onClick={() => handleViewProduct(product)}
              >
                <div className="flex items-start space-x-4">
                  <img 
                    src={product.images?.[0] || product.image || 'https://placehold.co/400x400/png'} 
                    alt={product.name} 
                    className="w-20 h-20 rounded-lg object-cover border flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.brand}</p>
                    <p className="font-semibold text-base text-gray-900 mt-2">{formatCurrency(product.priceVES)}</p>
                    <div className="mt-2">
                      {getStockStatusBadge(product.stock_status)}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end items-center mt-3 pt-3 border-t border-gray-100 space-x-2">
                  <button
                    onClick={(e) => handleEditProduct(e, product.id)}
                    className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 p-2 -m-2"
                    title="Editar Producto"
                  >
                    <Edit className="w-4 h-4 mr-1"/>
                    Editar
                  </button>
                  <button
                    onClick={(e) => handleDeleteRequest(e, product)}
                    className="flex items-center text-sm font-medium text-red-600 hover:text-red-800 p-2 -m-2"
                    title="Eliminar Producto"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Eliminar
                  </button>
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
                      checked={selectedProducts.length === paginatedProducts.length && paginatedProducts.length > 0}
                      onChange={handleSelectAll}
                    />
                    <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
                  </div>
                </th>
                <th scope="col" className="px-6 py-3">Producto</th>
                <th scope="col" className="px-6 py-3">Categoría</th>
                <th scope="col" className="px-6 py-3">Precio</th>
                <th scope="col" className="px-6 py-3">Stock</th>
                <th scope="col" className="px-6 py-3">Ventas</th>
                <th scope="col" className="px-6 py-3">Última Actualización</th>
                <th scope="col" className="px-6 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map(product => (
                <tr 
                  key={product.id} 
                  className="bg-white border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewProduct(product)}
                >
                  <td className="w-4 p-4">
                    <div className="flex items-center">
                      <input 
                        id={`checkbox-table-search-${product.id}`} 
                        type="checkbox" 
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <label htmlFor={`checkbox-table-search-${product.id}`} className="sr-only">checkbox</label>
                    </div>
                  </td>
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap flex items-center space-x-3">
                    <img 
                      src={product.images?.[0] || product.image || 'https://placehold.co/400x400/png'} 
                      alt={product.name} 
                      className="w-12 h-12 rounded-lg object-cover border" 
                    />
                    <div>
                      <div className="text-base font-semibold">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.brand}</div>
                    </div>
                  </th>
                  <td className="px-6 py-4">{product.category}</td>
                  <td className="px-6 py-4 font-semibold">{formatCurrency(product.priceVES)}</td>
                  <td className="px-6 py-4">
                    {getStockStatusBadge(product.stock_status)}
                  </td>
                  <td className="px-6 py-4">{product.sales}</td>
                  <td className="px-6 py-4">{formatDate(product.last_updated)}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                       <button 
                        onClick={(e) => handleEditProduct(e, product.id)} 
                        className="p-2 text-gray-500 rounded-full hover:bg-blue-100 hover:text-blue-600"
                        title="Editar Producto"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => handleDeleteRequest(e, product)}
                        className="p-2 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-600"
                        title="Eliminar Producto"
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

      {showProductModal && selectedProduct && (
        <ProductModal 
          product={selectedProduct}
          onClose={() => setShowProductModal(false)}
        />
      )}

      {productToDelete && (
        <ConfirmationModal
          isOpen={!!productToDelete}
          title="Confirmar Eliminación"
          message={`¿Estás seguro de que deseas eliminar el producto "${productToDelete.name}"? Esta acción no se puede deshacer.`}
          onConfirm={handleConfirmDelete}
          onClose={() => setProductToDelete(null)}
          confirmText="Eliminar"
          cancelText="Cancelar"
        />
      )}
    </div>
  );
};

export default AdminProductsPage; 