import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CreditDashboard } from '../components/Credit/CreditDashboard';
import { PageLayout } from '../components/Layout/PageLayout';
import { CreditCard, TrendingUp, Shield, Clock, Package, ArrowRight } from 'lucide-react';

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

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                to="/credit/orders"
                className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-lg transition-all duration-200 p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl group-hover:scale-110 transition-transform duration-200">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      Mis Órdenes de Crédito
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Gestiona tus órdenes y realiza pagos
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </Link>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">
                      Dashboard de Crédito
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Resumen de tu línea de crédito
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Dashboard Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <CreditDashboard />
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CreditPage;

