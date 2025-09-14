import React from 'react';
import { motion } from 'framer-motion';
import { CreditDashboard } from '../components/Credit/CreditDashboard';
import { PageLayout } from '../components/Layout/PageLayout';
import { CreditCard, TrendingUp, Shield, Clock } from 'lucide-react';

const CreditPage: React.FC = () => {
  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
              Mi Línea de Crédito
            </h1>
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Gestiona tu línea de crédito farmacéutica de manera inteligente. 
              Consulta tu disponibilidad, historial de pagos y estado de cuenta en tiempo real.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-blue-200/50 shadow-sm">
                <TrendingUp className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-700">Seguimiento en tiempo real</span>
              </div>
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-green-200/50 shadow-sm">
                <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-700">100% Seguro</span>
              </div>
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-orange-200/50 shadow-sm">
                <Clock className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Actualización automática</span>
              </div>
            </div>
          </motion.div>

          {/* Dashboard Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <CreditDashboard />
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CreditPage;

