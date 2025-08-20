import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  TrendingUp,
  Package,
  BarChart3,
  Calendar,
  ShoppingBag,
  DollarSign,
  Clock,
  MapPin,
  CreditCard,
  Star,
  Building,
  Phone,
  Mail,
  Globe,
  FileText,
  Users,
  Heart,
  Loader2
} from 'lucide-react';
import { CustomerStats } from '../../types';
import { adminService } from '../../services/AdminService';

interface CustomerStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
}

type TabType = 'general' | 'products' | 'orders' | 'trends' | 'info';

const CustomerStatsModal: React.FC<CustomerStatsModalProps> = ({
  isOpen,
  onClose,
  customerId
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && customerId) {
      fetchCustomerStats();
    }
  }, [isOpen, customerId]);

  const fetchCustomerStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getCustomerStats(customerId);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
      console.error('Error fetching customer stats:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const tabs = [
    { id: 'general' as TabType, name: 'General', icon: TrendingUp },
    { id: 'products' as TabType, name: 'Productos', icon: Package },
    { id: 'orders' as TabType, name: 'Pedidos', icon: ShoppingBag },
    { id: 'trends' as TabType, name: 'Tendencias', icon: BarChart3 },
    { id: 'info' as TabType, name: 'Información', icon: User },
  ];

  const renderGeneralTab = () => {
    if (!stats) return null;
    
    const { general_stats } = stats;
    
    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Pedidos</p>
                <p className="text-2xl font-bold text-blue-900">{general_stats.total_orders}</p>
              </div>
              <ShoppingBag className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Gastado</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(general_stats.total_spent)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Valor Promedio</p>
                <p className="text-2xl font-bold text-purple-900">{formatCurrency(general_stats.average_order_value)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Días como Cliente</p>
                <p className="text-2xl font-bold text-orange-900">{general_stats.days_as_customer}</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600">Frecuencia (días)</p>
                <p className="text-2xl font-bold text-indigo-900">{general_stats.order_frequency_days}</p>
              </div>
              <Clock className="w-8 h-8 text-indigo-500" />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Zona Preferida</p>
                <p className="text-lg font-bold text-gray-900 truncate">{general_stats.most_used_shipping_zone || 'N/A'}</p>
              </div>
              <MapPin className="w-8 h-8 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Timeline del Cliente
          </h4>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-green-800">Primer Pedido</p>
                <p className="text-sm text-green-600">{formatDate(general_stats.first_order_date)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="font-medium text-blue-800">Último Pedido</p>
                <p className="text-sm text-blue-600">{formatDate(general_stats.last_order_date)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-purple-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div>
                <p className="font-medium text-purple-800">Método de Pago Preferido</p>
                <p className="text-sm text-purple-600">{general_stats.preferred_payment_method || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProductsTab = () => {
    if (!stats) return null;
    
    return (
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Productos Más Comprados
          </h4>
          <div className="space-y-4">
            {stats.top_purchased_products.map((product, index) => (
              <div key={product.product_id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">{index + 1}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{product.product_name}</p>
                  <p className="text-sm text-gray-500">{product.product_brand}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{product.total_quantity} unidades</p>
                  <p className="text-sm text-gray-500">{product.times_purchased} compras</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(product.total_spent)}</p>
                  <p className="text-xs text-gray-500">{formatDate(product.last_purchase_date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderOrdersTab = () => {
    if (!stats) return null;
    
    return (
      <div className="space-y-6">
        {/* Order Status Distribution */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Distribución de Estados
          </h4>
          <div className="space-y-3">
            {stats.order_status_distribution.map((status) => (
              <div key={status.status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-gray-900 capitalize">{status.status}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{status.count} pedidos</span>
                  <span className="text-sm font-medium text-gray-900">{status.percentage.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Estadísticas Mensuales
          </h4>
          <div className="space-y-3">
            {stats.monthly_stats.map((month) => (
              <div key={month.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{month.month}</p>
                  <p className="text-sm text-gray-500">{month.order_count} pedidos</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(month.total_spent)}</p>
                  <p className="text-sm text-gray-500">{month.total_items} productos</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTrendsTab = () => {
    if (!stats) return null;
    
    return (
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Heart className="w-5 h-5 mr-2" />
            Categorías Favoritas
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.favorite_categories.map((category, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-purple-900">Categoría {index + 1}</p>
                    <p className="text-sm text-purple-600">Datos disponibles</p>
                  </div>
                  <Star className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Tendencias de Compra
          </h4>
          <div className="p-8 text-center text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Análisis de tendencias disponible</p>
          </div>
        </div>
      </div>
    );
  };

  const renderInfoTab = () => {
    if (!stats) return null;
    
    const { user_info } = stats;
    
    return (
      <div className="space-y-6">
        {/* Company Info */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Información de la Empresa
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Nombre de la Empresa</label>
                <p className="text-gray-900">{user_info.company_name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">RIF</label>
                <p className="text-gray-900">{user_info.rif || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Registro Mercantil</label>
                <p className="text-gray-900">{user_info.registro_mercantil || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Código SICM</label>
                <p className="text-gray-900">{user_info.codigo_sicm || 'N/A'}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {user_info.email}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Teléfono</label>
                <p className="text-gray-900 flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {user_info.phone || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Página Web</label>
                <p className="text-gray-900 flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  {user_info.pagina_web || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Redes Sociales</label>
                <p className="text-gray-900">{user_info.redes_sociales || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Representative */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Representante Legal
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Nombre</label>
              <p className="text-gray-900">{user_info.representante_legal_nombre || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Cédula</label>
              <p className="text-gray-900">{user_info.representante_legal_cedula || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Phone className="w-5 h-5 mr-2" />
            Información de Contacto
          </h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h5 className="font-medium text-gray-800 mb-2">Dueño</h5>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">Tel: {user_info.dueno_telefono || 'N/A'}</p>
                  <p className="text-gray-600">Email: {user_info.dueno_email || 'N/A'}</p>
                  <p className="text-gray-600">Cumpleaños: {user_info.dueno_cumpleanos || 'N/A'}</p>
                </div>
              </div>
              <div>
                <h5 className="font-medium text-gray-800 mb-2">Encargado de Compras</h5>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">Tel: {user_info.encargado_compra_telefono || 'N/A'}</p>
                  <p className="text-gray-600">Email: {user_info.encargado_compra_email || 'N/A'}</p>
                  <p className="text-gray-600">Cumpleaños: {user_info.encargado_compra_cumpleanos || 'N/A'}</p>
                </div>
              </div>
              <div>
                <h5 className="font-medium text-gray-800 mb-2">Encargado de Cobranza</h5>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">Tel: {user_info.encargado_cobranza_telefono || 'N/A'}</p>
                  <p className="text-gray-600">Email: {user_info.encargado_cobranza_email || 'N/A'}</p>
                  <p className="text-gray-600">Cumpleaños: {user_info.encargado_cobranza_cumpleanos || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* References */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Referencias
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Referencia Comercial</label>
              <p className="text-gray-900">{user_info.referencia_comercial_proveedor || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Referencia Bancaria</label>
              <p className="text-gray-900">{user_info.referencia_bancaria || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralTab();
      case 'products':
        return renderProductsTab();
      case 'orders':
        return renderOrdersTab();
      case 'trends':
        return renderTrendsTab();
      case 'info':
        return renderInfoTab();
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-4 bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Estadísticas del Cliente
                </h2>
                <p className="text-sm text-gray-500">
                  {stats ? stats.user_info.company_name || stats.user_info.email : 'Cargando...'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-0 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                  <p className="text-gray-500">Cargando estadísticas...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar datos</h3>
                  <p className="text-gray-500 mb-4">{error}</p>
                  <button
                    onClick={fetchCustomerStats}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            ) : (
              renderTabContent()
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CustomerStatsModal;
