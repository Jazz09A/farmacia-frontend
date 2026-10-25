import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, 
  Package, 
  FileText,
  Loader2,
  DollarSign,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGlobalCurrency } from '../contexts/GlobalCurrencyContext';
import type {  
  UserPromotion, 
  SupportTicket 
} from '../types/profile';
import OrdersSection from '../components/Profile/OrdersSection';
import QuotesSection from '../components/Profile/QuotesSection';
import { useUserStats } from '../hooks/useUserStats';
import { AccountSection } from '../components/Profile/AccountSection';
import { PromotionsSection } from '../components/Profile/ProfileSections';
import { SupportTicketsSection as SupportSection } from '../components/Profile/SupportTicketsSection';

type TabType = 'cuenta' | 'pedidos' | 'cotizaciones' | 'promociones' | 'soporte';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pedidos');
  const { user, loading } = useAuth();
  const { formatPriceFromBackend } = useGlobalCurrency();
  const location = useLocation();
  
  const [promotions] = useState<UserPromotion[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const { stats: userStats, loading: statsLoading, error: statsError } = useUserStats();

  useEffect(() => {
    if (location.state?.defaultTab) {
      setActiveTab(location.state.defaultTab);
    }
  }, [location.state]);

  const tabs = [
    { id: 'cuenta', label: 'Mi Cuenta', icon: UserIcon, count: null },
    { id: 'pedidos', label: 'Facturas', icon: Package, count: null },
    { id: 'cotizaciones', label: 'Cotizaciones', icon: FileText, count: null },
    // { id: 'promociones', label: 'Promociones', icon: Gift, count: promotions.filter(p => !p.is_used).length },
    // { id: 'soporte', label: 'Soporte', icon: MessageCircle, count: supportTickets.filter(t => t.status === 'open').length }
  ];

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Fecha no disponible';
    return new Date(dateString).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-medical-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-medical-gray-50 pt-18 pb-15">
      <div className="medical-container">
        {/* Header del perfil */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-soft p-6 lg:p-8 mb-6 lg:mb-8"
        >
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            {/* Avatar y info básica */}
            <div className="flex items-center gap-4 lg:gap-6">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-medical-blue-gradient rounded-full flex items-center justify-center text-white text-xl lg:text-2xl font-bold flex-shrink-0">
                {user.user_type === 'juridico' && user.company_name
                  ? user.company_name.charAt(0).toUpperCase()
                  : 'U'
                }
              </div>
              <div className="min-w-0">
                <h1 className="text-xl lg:text-2xl font-bold text-medical-gray-900 truncate">
                  {user.company_name || 'Usuario'}
                </h1>
                <p className="text-sm lg:text-base text-medical-gray-600 truncate">{user.email}</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-2">
                  <span className="text-xs lg:text-sm text-medical-gray-500">
                    Miembro desde {formatDate(user.created_at)}
                  </span>
                  {user.user_type === 'admin' && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      Administrador
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Estadísticas rápidas con datos reales */}
            <div className="w-full mt-6 lg:mt-0 lg:ml-8">
              {/* Indicador de estado */}
              {statsError && (
                <div className="mb-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                    <p className="text-sm text-red-700">
                      {statsError}. Los datos mostrados pueden no estar actualizados.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Grid de estadísticas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {/* Total de Pedidos */}
                <div className="text-center p-4 lg:p-6 bg-medical-blue-50 rounded-xl border border-medical-blue-100 relative group hover:shadow-md transition-all">
                  <div className="flex items-center justify-center mb-3">
                    <Package className="w-6 h-6 lg:w-8 lg:h-8 text-medical-blue-600" />
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold text-medical-blue-700 mb-2">
                    {statsLoading ? (
                      <Loader2 className="w-6 h-6 lg:w-8 lg:h-8 animate-spin mx-auto" />
                    ) : statsError ? (
                      <span className="text-sm text-red-500">Error</span>
                    ) : (
                      userStats?.total_orders || 0
                    )}
                  </div>
                  <div className="text-sm lg:text-base text-medical-gray-600 font-medium">Total Facturas</div>
                  {statsError && (
                    <button 
                      onClick={() => window.location.reload()}
                      className="absolute top-3 right-3 p-2 text-red-500 hover:text-red-700 transition-colors bg-white rounded-full shadow-sm"
                      title="Reintentar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Total Gastado */}
                <div className="text-center p-4 lg:p-6 bg-green-50 rounded-xl border border-green-100 hover:shadow-md transition-all">
                  <div className="flex items-center justify-center mb-3">
                    <DollarSign className="w-6 h-6 lg:w-8 lg:h-8 text-green-600" />
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold text-green-700 mb-2">
                    {statsLoading ? (
                      <Loader2 className="w-6 h-6 lg:w-8 lg:h-8 animate-spin mx-auto" />
                    ) : statsError ? (
                      <span className="text-sm text-red-500">Error</span>
                    ) : (
                      formatPriceFromBackend(userStats?.total_spent || 0)
                    )}
                  </div>
                  <div className="text-sm lg:text-base text-medical-gray-600 font-medium">Total Gastado</div>
                </div>

                {/* Total Productos Comprados */}
                <div className="text-center p-4 lg:p-6 bg-purple-50 rounded-xl border border-purple-100 hover:shadow-md transition-all sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-center mb-3">
                    <ShoppingBag className="w-6 h-6 lg:w-8 lg:h-8 text-purple-600" />
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold text-purple-700 mb-2">
                    {statsLoading ? (
                      <Loader2 className="w-6 h-6 lg:w-8 lg:h-8 animate-spin mx-auto" />
                    ) : statsError ? (
                      <span className="text-sm text-red-500">Error</span>
                    ) : (
                      userStats?.total_products_purchased || 0
                    )}
                  </div>
                  <div className="text-sm lg:text-base text-medical-gray-600 font-medium">Productos Comprados</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

                 {/* Navegación por pestañas */}
         <motion.div
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="bg-white rounded-2xl shadow-soft mb-6 lg:mb-8 overflow-hidden"
         >
           {/* Tabs responsivos */}
           <div className="flex flex-col sm:flex-row border-b border-medical-gray-200">
             {tabs.map((tab) => (
               <button
                 key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                 className={`flex items-center justify-center sm:justify-start gap-2 lg:gap-3 px-4 lg:px-6 py-4 lg:py-5 font-medium transition-all relative text-sm lg:text-base min-h-[60px] sm:min-h-0 ${
                   activeTab === tab.id
                     ? 'text-medical-blue-700 bg-medical-blue-50 border-b-2 sm:border-b-0 border-medical-blue-600'
                     : 'text-medical-gray-600 hover:text-medical-gray-900 hover:bg-medical-gray-50'
                 }`}
               >
                 <tab.icon className="w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                 <span className="hidden sm:inline font-semibold">{tab.label}</span>
                 <span className="sm:hidden font-semibold">{tab.label.split(' ')[0]}</span>
                 {tab.count !== null && tab.count > 0 && (
                   <span className="bg-medical-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center ml-auto sm:ml-0">
                     {tab.count}
                   </span>
                 )}
                 {activeTab === tab.id && (
                   <motion.div
                     layoutId="activeTab"
                     className="absolute bottom-0 left-0 right-0 h-1 bg-medical-blue-600 hidden sm:block"
                   />
                 )}
               </button>
             ))}
           </div>
         </motion.div>

        {/* Contenido de las pestañas */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'cuenta' && <AccountSection user={user} />}
            {activeTab === 'pedidos' && <OrdersSection />}
            {activeTab === 'cotizaciones' && <QuotesSection />}
            {activeTab === 'promociones' && <PromotionsSection promotions={promotions} />}
            {activeTab === 'soporte' && <SupportSection tickets={supportTickets} setTickets={setSupportTickets} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfilePage;
