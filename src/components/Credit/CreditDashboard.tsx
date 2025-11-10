import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCreditDashboardQuery } from '../../hooks/queries/useCreditQueries';
import { useCreditValidation } from '../../hooks/useCreditValidation';
import { CreditInfoCard } from './CreditInfoCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { 
  RefreshCw, 
  Package, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface CreditDashboardProps {
  className?: string;
}

export const CreditDashboard: React.FC<CreditDashboardProps> = ({
  className = ''
}) => {
  const { data: dashboardData, isLoading: loading, error, refetch } = useCreditDashboardQuery(true);
  const { getCreditUsagePercentage, getCreditStatusInfo } = useCreditValidation();

  useEffect(() => {
    console.log('[RQ] useCreditDashboardQuery', { loading, error, hasData: !!dashboardData });
  }, [loading, error, dashboardData]);

  const refreshDashboard = () => {
    refetch();
  };

  

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading && !dashboardData) {
    return (
      <div className={`credit-dashboard ${className}`}>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center p-12 bg-white/70 backdrop-blur-sm rounded-3xl border border-gray-200/50"
        >
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600 text-lg font-medium mt-4">Cargando dashboard de crédito...</span>
          <p className="text-gray-500 text-sm mt-2">Obteniendo información actualizada...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`credit-dashboard ${className}`}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-12 bg-red-50/80 backdrop-blur-sm rounded-3xl border border-red-200/50"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Error al cargar el dashboard</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
          <button
            onClick={refreshDashboard}
            className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
        </motion.div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className={`credit-dashboard ${className}`}>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center p-12 bg-gray-50/80 backdrop-blur-sm rounded-3xl border border-gray-200/50"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-6">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay datos disponibles</h3>
          <p className="text-gray-500">Intenta actualizar la página o contacta con soporte</p>
        </motion.div>
      </div>
    );
  }

  const usagePercentage = getCreditUsagePercentage();
  const statusInfo = getCreditStatusInfo();

  return (
    <div className={`credit-dashboard space-y-8 ${className}`}>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Dashboard de Crédito
            </h2>
          </div>
          <p className="text-gray-600">
            Resumen completo de su línea de crédito y actividad
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={refreshDashboard}
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Actualizar
        </motion.button>
      </motion.div>

      {/* Información de crédito */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <CreditInfoCard showDetails={true} />
      </motion.div>

      {/* Estadísticas de órdenes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Package className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">
            Estadísticas de Órdenes
          </h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <motion.div 
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200/50 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-700 mb-2">
              {dashboardData.orders.total_orders}
            </div>
            <div className="text-blue-600 font-medium">Total de Órdenes</div>
            <div className="text-xs text-blue-500 mt-1">Todas las órdenes</div>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200/50 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-500 rounded-lg">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <ArrowDownRight className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-orange-700 mb-2">
              {formatAmount(dashboardData.orders.total_credit_used)}
            </div>
            <div className="text-orange-600 font-medium">Crédito Usado</div>
            <div className="text-xs text-orange-500 mt-1">Del límite total</div>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200/50 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-700 mb-2">
              {formatAmount(dashboardData.orders.total_paid)}
            </div>
            <div className="text-green-600 font-medium">Total Pagado</div>
            <div className="text-xs text-green-500 mt-1">Pagos confirmados</div>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200/50 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-red-500 rounded-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-red-700 mb-2">
              {formatAmount(dashboardData.orders.total_remaining)}
            </div>
            <div className="text-red-600 font-medium">Saldo Pendiente</div>
            <div className="text-xs text-red-500 mt-1">Requiere pago</div>
          </motion.div>
        </div>
      </motion.div>

      {/* Estado de pagos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">
            Estado de Pagos
          </h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200/50 shadow-sm"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-orange-500 rounded-xl shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-700">
                  {dashboardData.payments.pending_count}
                </div>
                <div className="text-orange-600 font-semibold">Pagos Pendientes</div>
              </div>
            </div>
            <div className="text-sm text-orange-600 bg-orange-100/50 px-3 py-2 rounded-lg">
              Esperando aprobación administrativa
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200/50 shadow-sm"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-700">
                  {formatAmount(dashboardData.payments.pending_amount)}
                </div>
                <div className="text-blue-600 font-semibold">Monto Pendiente</div>
              </div>
            </div>
            <div className="text-sm text-blue-600 bg-blue-100/50 px-3 py-2 rounded-lg">
              En proceso de revisión
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden bg-gradient-to-br from-green-50 via-green-50 to-green-100 rounded-xl p-6 border border-green-200/50 shadow-sm"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-200/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-green-700">
                  {dashboardData.payments.recent_approved.length}
                </div>
                <div className="text-green-600 font-semibold">Recientes Aprobados</div>
              </div>
            </div>
            <div className="text-sm text-green-600 bg-green-100/50 px-3 py-2 rounded-lg">
              Últimos 30 días
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Pagos recientes aprobados */}
      {dashboardData.payments.recent_approved.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">
              Pagos Recientes Aprobados
            </h3>
          </div>
          
          <div className="space-y-4">
            {dashboardData.payments.recent_approved.slice(0, 5).map((payment, index) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.01, x: 4 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/50 shadow-sm hover:shadow-md transition-all duration-200 gap-4 sm:gap-0"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-lg">
                      Pago #{payment.id.slice(-8)}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {payment.payment_reference}
                    </div>
                  </div>
                </div>
                
                <div className="text-left sm:text-right">
                  <div className="font-bold text-green-700 text-xl">
                    {formatAmount(payment.amount)}
                  </div>
                  <div className="text-sm text-green-600 flex items-center gap-1 justify-start sm:justify-end">
                    <CheckCircle className="w-3 h-3" />
                    {payment.approved_at ? 
                      new Date(payment.approved_at).toLocaleDateString('es-ES') : 
                      'Aprobado'
                    }
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {dashboardData.payments.recent_approved.length > 5 && (
            <div className="text-center mt-6">
              <button className="text-green-600 hover:text-green-700 font-medium flex items-center gap-2 mx-auto transition-colors">
                Ver todos los pagos
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Estado general del crédito */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">
            Estado General del Crédito
          </h3>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium text-lg">Uso del Crédito</span>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-gray-800">{usagePercentage}%</span>
              <div className={`p-2 rounded-lg ${
                usagePercentage >= 90 ? 'bg-red-100' :
                usagePercentage >= 75 ? 'bg-orange-100' :
                'bg-green-100'
              }`}>
                {usagePercentage >= 90 ? (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                ) : usagePercentage >= 75 ? (
                  <Clock className="w-5 h-5 text-orange-600" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${usagePercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-4 rounded-full shadow-sm relative overflow-hidden ${
                  usagePercentage >= 90 ? 'bg-gradient-to-r from-red-400 to-red-600' :
                  usagePercentage >= 75 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                  'bg-gradient-to-r from-green-400 to-green-600'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
              </motion.div>
            </div>
            <div className="absolute -top-1 left-0 w-full flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 ${
              statusInfo.color === 'green' ? 'bg-green-50 border-green-200' :
              statusInfo.color === 'orange' ? 'bg-orange-50 border-orange-200' :
              statusInfo.color === 'red' ? 'bg-red-50 border-red-200' :
              'bg-gray-50 border-gray-200'
            }`}
          >
            <div className={`p-2 rounded-lg ${
              statusInfo.color === 'green' ? 'bg-green-100' :
              statusInfo.color === 'orange' ? 'bg-orange-100' :
              statusInfo.color === 'red' ? 'bg-red-100' :
              'bg-gray-100'
            }`}>
              <span className={`text-xl ${
                statusInfo.color === 'green' ? 'text-green-600' :
                statusInfo.color === 'orange' ? 'text-orange-600' :
                statusInfo.color === 'red' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {statusInfo.icon}
              </span>
            </div>
            <div>
              <div className={`font-semibold ${
                statusInfo.color === 'green' ? 'text-green-800' :
                statusInfo.color === 'orange' ? 'text-orange-800' :
                statusInfo.color === 'red' ? 'text-red-800' :
                'text-gray-800'
              }`}>
                Estado del Crédito
              </div>
              <div className={`text-sm ${
                statusInfo.color === 'green' ? 'text-green-700' :
                statusInfo.color === 'orange' ? 'text-orange-700' :
                statusInfo.color === 'red' ? 'text-red-700' :
                'text-gray-700'
              }`}>
                {statusInfo.message}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

