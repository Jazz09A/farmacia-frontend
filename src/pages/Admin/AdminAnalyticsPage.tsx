import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Download,
  Filter,
  Eye,
  Clock,
  Target,
  Zap,
  Globe,
  Smartphone,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdminCurrency } from '../../contexts/AdminCurrencyContext';
import SmartPriceDisplay from '../../components/Admin/SmartPriceDisplay';

interface AnalyticsData {
  period: string;
  revenue: number;
  orders: number;
  customers: number;
  products_sold: number;
  conversion_rate: number;
  avg_order_value: number;
}

const mockAnalyticsData: AnalyticsData[] = [
      { period: '2024-01', revenue: 150000, orders: 245, customers: 89, products_sold: 567, conversion_rate: 3.2, avg_order_value: 612 },
      { period: '2024-02', revenue: 180000, orders: 298, customers: 112, products_sold: 698, conversion_rate: 3.8, avg_order_value: 604 },
      { period: '2024-03', revenue: 220000, orders: 356, customers: 145, products_sold: 823, conversion_rate: 4.1, avg_order_value: 618 },
];

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  growth: number;
}

const topProducts: TopProduct[] = [
  { id: '1', name: 'Ibuprofeno 600mg', sales: 156, revenue: 23400, growth: 15.2 },
  { id: '2', name: 'Vitamina D3 5000UI', sales: 134, revenue: 20100, growth: 8.7 },
  { id: '3', name: 'Omeprazol 20mg', sales: 98, revenue: 14700, growth: -2.3 },
  { id: '4', name: 'Acetaminofén 500mg', sales: 87, revenue: 13050, growth: 12.1 },
  { id: '5', name: 'Complejo B', sales: 76, revenue: 11400, growth: 5.4 },
];

interface TrafficSource {
  source: string;
  visitors: number;
  percentage: number;
  conversion: number;
}

const trafficSources: TrafficSource[] = [
  { source: 'Búsqueda Orgánica', visitors: 2456, percentage: 42.3, conversion: 4.2 },
  { source: 'Directo', visitors: 1789, percentage: 30.8, conversion: 6.1 },
  { source: 'Redes Sociales', visitors: 892, percentage: 15.4, conversion: 2.8 },
  { source: 'Email Marketing', visitors: 445, percentage: 7.7, conversion: 8.9 },
  { source: 'Publicidad Pagada', visitors: 223, percentage: 3.8, conversion: 5.3 },
];

const AdminAnalyticsPage: React.FC = () => {
  const [selectedDateRange, setSelectedDateRange] = useState('last_30_days');
  const { formatPrice } = useAdminCurrency();



  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Calcular métricas actuales vs periodo anterior
  const currentData = mockAnalyticsData[mockAnalyticsData.length - 1];
  const previousData = mockAnalyticsData[mockAnalyticsData.length - 2];

  const getGrowthData = (current: number, previous: number) => {
    const growth = ((current - previous) / previous) * 100;
    return {
      value: growth,
      isPositive: growth > 0,
      formatted: formatPercentage(growth)
    };
  };

  const revenueGrowth = getGrowthData(currentData.revenue, previousData.revenue);
  const ordersGrowth = getGrowthData(currentData.orders, previousData.orders);
  const customersGrowth = getGrowthData(currentData.customers, previousData.customers);
  const conversionGrowth = getGrowthData(currentData.conversion_rate, previousData.conversion_rate);

  const MetricCard = ({ 
    title, 
    value, 
    growth, 
    icon: Icon, 
    color = 'blue' 
  }: {
    title: string;
    value: string | number | React.ReactNode;
    growth: { value: number; isPositive: boolean; formatted: string };
    icon: any;
    color?: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className={`flex items-center mt-2 text-sm ${
              growth.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {growth.isPositive ? (
                <ArrowUpRight className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 mr-1" />
              )}
              <span>{growth.formatted}</span>
            <span className="text-gray-500 ml-1">vs mes anterior</span>
            </div>
        </div>
        <div className={`p-3 bg-${color}-100 rounded-full`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </motion.div>
  );

    return (
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
            Analíticas y Reportes
          </h1>
          <p className="mt-2 text-gray-600">
            Monitorea el rendimiento de tu farmacia con métricas detalladas y reportes en tiempo real.
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </button>
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="last_7_days">Últimos 7 días</option>
            <option value="last_30_days">Últimos 30 días</option>
            <option value="last_3_months">Últimos 3 meses</option>
            {/* <option value="last_year">Último año</option> */}
          </select>
          <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Exportar Reporte
          </button>
        </div>
      </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <MetricCard
            title="Ingresos Totales"
            value={<SmartPriceDisplay amountUsd={currentData.revenue} />}
            growth={revenueGrowth}
            icon={DollarSign}
            color="green"
          />
          <MetricCard
            title="Pedidos"
          value={currentData.orders}
            growth={ordersGrowth}
            icon={ShoppingCart}
            color="blue"
          />
          <MetricCard
            title="Nuevos Clientes"
          value={currentData.customers}
            growth={customersGrowth}
            icon={Users}
            color="purple"
          />
          <MetricCard
            title="Tasa de Conversión"
          value={`${currentData.conversion_rate}%`}
            growth={conversionGrowth}
            icon={Target}
            color="orange"
          />
        </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Ingresos por Mes</h3>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>
            </div>
            <div className="h-80 flex items-end justify-center space-x-4">
            {mockAnalyticsData.map((data, index) => {
              const maxRevenue = Math.max(...mockAnalyticsData.map(d => d.revenue));
                const height = (data.revenue / maxRevenue) * 100;
                return (
                  <div key={data.period} className="flex flex-col items-center">
                    <div className="text-xs text-gray-600 mb-2">
                      {formatPrice(data.revenue)}
                    </div>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="w-16 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg min-h-8"
                    />
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(data.period).toLocaleDateString('es-VE', { month: 'short' })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Pedidos por Mes</h3>
          </div>
          <div className="h-80 flex items-end justify-center space-x-4">
            {mockAnalyticsData.map((data, index) => {
              const maxOrders = Math.max(...mockAnalyticsData.map(d => d.orders));
              const height = (data.orders / maxOrders) * 100;
              return (
                <div key={data.period} className="flex flex-col items-center">
                  <div className="text-xs text-gray-600 mb-2">
                    {data.orders}
                  </div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="w-16 bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg min-h-8"
                  />
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(data.period).toLocaleDateString('es-VE', { month: 'short' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Productos Más Vendidos</h3>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.sales} ventas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 text-sm">
                    {formatPrice(product.revenue)}
                  </p>
                  <p className={`text-xs ${
                    product.growth > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(product.growth)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Fuentes de Tráfico</h3>
          <div className="space-y-4">
            {trafficSources.map((source, index) => (
              <motion.div
                key={source.source}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{source.source}</span>
                  <span className="text-sm text-gray-600">{source.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${source.percentage}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="bg-blue-600 h-2 rounded-full"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{source.visitors.toLocaleString()} visitantes</span>
                  <span>Conversión: {source.conversion}%</span>
                </div>
              </motion.div>
            ))}
            </div>
          </div>

          {/* Real-time Stats */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Estadísticas en Tiempo Real</h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Usuarios Activos</span>
                <span className="text-lg font-bold text-green-600">47</span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Globe className="w-3 h-3 mr-1" />
                  <span>En los últimos 30 minutos</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Ventas Hoy</span>
                <span className="text-lg font-bold text-blue-600">12</span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <ShoppingCart className="w-3 h-3 mr-1" />
                <span>{formatPrice(18500)} en ingresos</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Páginas Vistas</span>
                <span className="text-lg font-bold text-purple-600">2,347</span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Eye className="w-3 h-3 mr-1" />
                  <span>Hoy</span>
                </div>
              </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Tiempo Promedio</span>
                <span className="text-lg font-bold text-orange-600">4:32</span>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                <span>En el sitio</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Tráfico Móvil</span>
                <span className="text-lg font-bold text-pink-600">68%</span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Smartphone className="w-3 h-3 mr-1" />
                  <span>Del total de visitas</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Valor Promedio del Pedido</h3>
            <Zap className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {formatPrice(currentData.avg_order_value)}
          </p>
          <div className="flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+2.3% vs mes anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Productos Vendidos</h3>
            <Package className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {currentData.products_sold.toLocaleString()}
          </p>
          <div className="flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+18% vs mes anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Tasa de Retención</h3>
            <Users className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            72.5%
          </p>
          <div className="flex items-center text-sm text-red-600">
            <TrendingDown className="w-4 h-4 mr-1" />
            <span>-1.2% vs mes anterior</span>
          </div>
        </div>
      </div>

      {/* Goals and Targets */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Objetivos del Mes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-3">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="transparent"
                      className="text-gray-200"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.73)}`}
                  className="text-blue-600"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-900">73%</span>
                  </div>
                </div>
            <p className="text-sm font-medium text-gray-900">Ingresos</p>
            <p className="text-xs text-gray-500">{formatPrice(220000)} / {formatPrice(300000)}</p>
        </div>

              <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                  strokeWidth="10"
                      fill="transparent"
                  className="text-gray-200"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                  strokeWidth="10"
                      fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.89)}`}
                      className="text-green-600"
                    />
                  </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-900">89%</span>
                  </div>
                </div>
            <p className="text-sm font-medium text-gray-900">Pedidos</p>
            <p className="text-xs text-gray-500">356 / 400</p>
          </div>

          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.58)}`}
                  className="text-purple-600"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-900">58%</span>
                    </div>
                  </div>
            <p className="text-sm font-medium text-gray-900">Nuevos Clientes</p>
            <p className="text-xs text-gray-500">145 / 250</p>
          </div>

          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.82)}`}
                  className="text-orange-600"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-900">82%</span>
            </div>
          </div>
            <p className="text-sm font-medium text-gray-900">Conversión</p>
            <p className="text-xs text-gray-500">4.1% / 5.0%</p>
            </div>
          </div>
        </div>
    </div>
  );
};

export default AdminAnalyticsPage;
