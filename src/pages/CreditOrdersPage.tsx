import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PageLayout } from '../components/Layout/PageLayout';
import { CreditOrdersList } from '../components/Credit/CreditOrdersList';
import { CreditOrderDetails } from '../components/Credit/CreditOrderDetails';
import EnhancedPaymentForm from '../components/Credit/EnhancedPaymentForm';
import { CurrencyToggle } from '../components/Header/CurrencyToggle';
import { CreditOrder } from '../types/credit';
import { 
  CreditCard, 
  Package, 
  DollarSign, 
  ArrowLeft,
  X
} from 'lucide-react';

type ViewMode = 'list' | 'details' | 'payment';

const CreditOrdersPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [selectedOrder, setSelectedOrder] = useState<CreditOrder | null>(null);

  const handleViewDetails = (order: CreditOrder) => {
    setSelectedOrder(order);
    setCurrentView('details');
  };

  const handleMakePayment = (order: CreditOrder) => {
    setSelectedOrder(order);
    setCurrentView('payment');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedOrder(null);
  };

  const handleBackToDetails = () => {
    setCurrentView('details');
  };

  const handlePaymentCreated = () => {
    // After payment is created, go back to details to see the updated payment history
    setCurrentView('details');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'list':
        return (
          <CreditOrdersList
            onViewDetails={handleViewDetails}
            onMakePayment={handleMakePayment}
          />
        );
      
      case 'details':
        return selectedOrder ? (
          <CreditOrderDetails
            orderId={selectedOrder.id}
            onBack={handleBackToList}
            onMakePayment={handleMakePayment}
          />
        ) : null;
      
      case 'payment':
        return selectedOrder ? (
          <div className="space-y-6">
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4"
            >
              <button
                onClick={handleBackToDetails}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Realizar Pago
                </h2>
                <p className="text-gray-600">
                  Orden {selectedOrder.order_number}
                </p>
              </div>
            </motion.div>

            {/* Payment Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <EnhancedPaymentForm
                orderId={selectedOrder.id}
                orderTotal={Number(selectedOrder.total)}
                orderTotalRef={Number(selectedOrder.credit_amount)}
                creditRemaining={selectedOrder.credit_remaining}
                orderNumber={selectedOrder.order_number}
                exchangeRate={Number(selectedOrder.exchange_rate)}
                onPaymentCreated={handlePaymentCreated}
                onCancel={handleBackToDetails}
              />
            </motion.div>
          </div>
        ) : null;
      
      default:
        return null;
    }
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Hero Section - Only show on list view */}
          {currentView === 'list' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
                <Package className="w-8 h-8 text-white" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
                Mis Órdenes de Crédito
              </h1>
              
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                Gestiona tus órdenes de crédito, consulta detalles y realiza pagos de manera sencilla.
              </p>

              {/* Currency Toggle */}
              <div className="flex justify-center mb-8">
                <CurrencyToggle currency="USD" onToggle={() => {}} isScrolled={false} />
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-blue-200/50 shadow-sm">
                  <Package className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Seguimiento completo</span>
                </div>
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-green-200/50 shadow-sm">
                  <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Pagos flexibles</span>
                </div>
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-orange-200/50 shadow-sm">
                  <CreditCard className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Historial detallado</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: currentView === 'list' ? 0.2 : 0 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CreditOrdersPage;
