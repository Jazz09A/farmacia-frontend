import React from 'react';
import { motion } from 'framer-motion';
import { useCredit } from '../../contexts/CreditContext';
import { useCreditValidation } from '../../hooks/useCreditValidation';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { CreditCard, RefreshCw, TrendingUp, DollarSign, Shield, AlertTriangle } from 'lucide-react';

interface CreditInfoCardProps {
  onRefresh?: () => void;
  showDetails?: boolean;
  className?: string;
}

const CreditInfoCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`credit-info-card bg-gray-200 rounded-2xl p-6 sm:p-8 shadow-lg ${className} relative overflow-hidden animate-pulse`}>
    <div className="h-8 bg-gray-300 rounded w-3/4 mb-8"></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
      <div className="bg-gray-300/50 rounded-xl p-6 h-28"></div>
      <div className="bg-gray-300/50 rounded-xl p-6 h-28"></div>
      <div className="bg-gray-300/50 rounded-xl p-6 h-28"></div>
    </div>
    <div className="h-3 bg-gray-300 rounded w-full mb-3"></div>
    <div className="h-10 bg-gray-300/50 rounded-xl"></div>
  </div>
);

export const CreditInfoCard: React.FC<CreditInfoCardProps> = ({
  onRefresh,
  showDetails = true,
  className = ''
}) => {
  const { creditInfo, loading, error, refreshCreditInfo } = useCredit();
  const { getCreditStatusInfo, getCreditUsagePercentage } = useCreditValidation();

  const handleRefresh = async () => {
    await refreshCreditInfo();
    onRefresh?.();
  };

  if (loading && !creditInfo) {
    return <CreditInfoCardSkeleton className={className} />;
  }

  if (error || !creditInfo) {
    return (
      <div 
        className={`credit-info-card bg-red-50 text-red-700 rounded-2xl p-6 sm:p-8 shadow-lg border border-red-200 ${className} relative overflow-hidden flex flex-col items-center justify-center`}
      >
        <AlertTriangle className="w-12 h-12 mb-4 text-red-500" />
        <h4 className="text-xl font-bold mb-2 text-red-800">Error al Cargar</h4>
        <p className="text-center mb-6 text-red-700">{error || 'No se pudo obtener la información de crédito.'}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50"
        >
          {loading ? <LoadingSpinner size="sm" /> : <RefreshCw className="w-4 h-4" />}
          Reintentar
        </motion.button>
      </div>
    );
  }

  const statusInfo = getCreditStatusInfo();
  const usagePercentage = getCreditUsagePercentage();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`credit-info-card bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-blue-400/20 ${className} relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">
              Información de Crédito
            </h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleRefresh}
            disabled={loading}
            className="p-3 hover:bg-white/20 rounded-xl transition-all duration-200 disabled:opacity-50 backdrop-blur-sm"
            title="Actualizar información"
          >
            {loading ? <LoadingSpinner size="sm" /> : <RefreshCw className="w-6 h-6" />}
          </motion.button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/15 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-400/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-300" />
              </div>
              <div className="text-sm text-white/80">Crédito Disponible</div>
            </div>
            <div className="text-3xl font-bold text-green-300">
              ${creditInfo.available_credit.toFixed(2)}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/15 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-400/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-300" />
              </div>
              <div className="text-sm text-white/80">Límite de Crédito</div>
            </div>
            <div className="text-3xl font-bold text-blue-300">
              ${creditInfo.credit_limit.toFixed(2)}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/15 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-400/20 rounded-lg">
                <Shield className="w-5 h-5 text-purple-300" />
              </div>
              <div className="text-sm text-white/80">Estado</div>
            </div>
            <div className={`flex items-center gap-2 text-2xl font-bold ${
              statusInfo.color === 'green' ? 'text-green-300' : 
              statusInfo.color === 'orange' ? 'text-orange-300' : 
              statusInfo.color === 'red' ? 'text-red-300' : 
              'text-gray-300'
            }`}>
              <span className="text-lg">{statusInfo.icon}</span>
              <span className="capitalize">{creditInfo.credit_status}</span>
            </div>
          </motion.div>
        </div>

        {showDetails && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <div className="flex justify-between text-sm mb-3">
                <span className="text-white/90 font-medium">Uso de Crédito</span>
                <span className="text-white font-bold">{usagePercentage}%</span>
              </div>
              <div className="relative">
                <div className="w-full bg-white/20 rounded-full h-3 shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${usagePercentage}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                    className={`h-3 rounded-full shadow-sm relative overflow-hidden ${
                      usagePercentage >= 90 ? 'bg-gradient-to-r from-red-400 to-red-300' :
                      usagePercentage >= 75 ? 'bg-gradient-to-r from-orange-400 to-orange-300' :
                      'bg-gradient-to-r from-green-400 to-green-300'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"></div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  statusInfo.color === 'green' ? 'bg-green-400/20' :
                  statusInfo.color === 'orange' ? 'bg-orange-400/20' :
                  statusInfo.color === 'red' ? 'bg-red-400/20' :
                  'bg-gray-400/20'
                }`}>
                  <span className={`text-lg ${
                    statusInfo.color === 'green' ? 'text-green-300' :
                    statusInfo.color === 'orange' ? 'text-orange-300' :
                    statusInfo.color === 'red' ? 'text-red-300' :
                    'text-gray-300'
                  }`}>
                    {statusInfo.icon}
                  </span>
                </div>
                <div>
                  <div className="text-white font-medium">Estado del Crédito</div>
                  <div className="text-white/80 text-sm">{statusInfo.message}</div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
};

