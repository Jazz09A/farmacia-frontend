import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, 
  Package, 
  Gift, 
  MessageCircle, 
  Settings, 
  Key,
  Clock,
  CheckCircle,
  Shield,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Building,
  Calendar,
  Loader2,
  DollarSign,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGlobalCurrency } from '../contexts/GlobalCurrencyContext';
import type {  
  UserPromotion, 
  SupportTicket 
} from '../types/profile';
import { User } from '../types/auth';
import OrdersSection from '../components/Profile/OrdersSection';
import ProfileCurrencyToggle from '../components/Profile/ProfileCurrencyToggle';
import { useUserStats } from '../hooks/useUserStats';

type TabType = 'cuenta' | 'pedidos' | 'promociones' | 'soporte';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pedidos');
  const { user, loading } = useAuth();
  const { formatPrice } = useGlobalCurrency();
  const location = useLocation();
  
  const [promotions] = useState<UserPromotion[]>([]);
  const [supportTickets] = useState<SupportTicket[]>([]);
  const { stats: userStats, loading: statsLoading, error: statsError } = useUserStats();

  useEffect(() => {
    if (location.state?.defaultTab) {
      setActiveTab(location.state.defaultTab);
    }
  }, [location.state]);

  const tabs = [
    { id: 'cuenta', label: 'Mi Cuenta', icon: UserIcon, count: null },
    { id: 'pedidos', label: 'Pedidos', icon: Package, count: null },
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
    <div className="min-h-screen bg-medical-gray-50 pt-32 pb-16">
      <div className="medical-container">
        {/* Header del perfil */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-soft p-6 lg:p-8 mb-6 lg:mb-8"
        >
          {/* Currency Toggle - Top Right */}
          <div className="flex justify-end mb-4">
            <ProfileCurrencyToggle />
          </div>
          
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
                  <div className="text-sm lg:text-base text-medical-gray-600 font-medium">Total Pedidos</div>
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
                      formatPrice(userStats?.total_spent || 0)
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
            {activeTab === 'promociones' && <PromotionsSection promotions={promotions} />}
            {activeTab === 'soporte' && <SupportSection tickets={supportTickets} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Componente para la sección de cuenta
const AccountSection: React.FC<{ user: User }> = ({ user }) => {
  return (
    <div className="space-y-6 lg:space-y-8">
             {/* Información de la cuenta */}
       <div className="bg-white rounded-2xl shadow-soft p-6 lg:p-8">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
           <h2 className="text-lg lg:text-xl font-bold text-medical-gray-900 flex items-center gap-2">
             <UserIcon className="w-5 h-5 lg:w-6 lg:h-6" />
             Información de la Cuenta
           </h2>
           <button className="btn-medical-secondary self-start sm:self-auto px-4 py-2 lg:px-6 lg:py-3">
             <Settings className="w-4 h-4 lg:w-5 lg:h-5" />
             <span className="hidden sm:inline ml-2">Editar</span>
             <span className="sm:hidden">Editar</span>
           </button>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
           <div className="space-y-4 lg:space-y-5">
             <div className="flex items-center gap-4 p-4 lg:p-5 bg-medical-gray-50 rounded-xl border border-medical-gray-100 hover:shadow-sm transition-all">
               <div className="w-10 h-10 lg:w-12 lg:h-12 bg-medical-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                 <Building className="w-5 h-5 lg:w-6 lg:h-6 text-medical-blue-600" />
               </div>
               <div className="min-w-0 flex-1">
                 <div className="text-xs lg:text-sm text-medical-gray-500 mb-1">Empresa</div>
                 <div className="font-semibold text-sm lg:text-base truncate">
                   {user.company_name || 'Nombre de Empresa'}
                 </div>
               </div>
             </div>
             <div className="flex items-center gap-4 p-4 lg:p-5 bg-medical-gray-50 rounded-xl border border-medical-gray-100 hover:shadow-sm transition-all">
               <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                 <Mail className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
               </div>
               <div className="min-w-0 flex-1">
                 <div className="text-xs lg:text-sm text-medical-gray-500 mb-1">Email</div>
                 <div className="font-semibold text-sm lg:text-base truncate">{user.email}</div>
               </div>
             </div>
             <div className="flex items-center gap-4 p-4 lg:p-5 bg-medical-gray-50 rounded-xl border border-medical-gray-100 hover:shadow-sm transition-all">
               <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                 <Phone className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
               </div>
               <div className="min-w-0 flex-1">
                 <div className="text-xs lg:text-sm text-medical-gray-500 mb-1">Teléfono</div>
                 <div className="font-semibold text-sm lg:text-base">
                   {user.phone || 'Teléfono no disponible'}
                 </div>
               </div>
             </div>
           </div>
           <div className="space-y-4 lg:space-y-5">
             <div className="flex items-center gap-4 p-4 lg:p-5 bg-medical-gray-50 rounded-xl border border-medical-gray-100 hover:shadow-sm transition-all">
               <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                 <CreditCard className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" />
               </div>
               <div className="min-w-0 flex-1">
                 <div className="text-xs lg:text-sm text-medical-gray-500 mb-1">RIF</div>
                 <div className="font-semibold text-sm lg:text-base">
                   {user.rif || 'RIF no disponible'}
                 </div>
               </div>
             </div>
             <div className="flex items-center gap-4 p-4 lg:p-5 bg-medical-gray-50 rounded-xl border border-medical-gray-100 hover:shadow-sm transition-all">
               <div className="w-10 h-10 lg:w-12 lg:h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                 <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-600" />
               </div>
               <div className="min-w-0 flex-1">
                 <div className="text-xs lg:text-sm text-medical-gray-500 mb-1">Representante Legal</div>
                 <div className="font-semibold text-sm lg:text-base truncate">
                   {user.representante_legal_nombre || 'No disponible'}
                 </div>
               </div>
             </div>
             <div className="flex items-center gap-4 p-4 lg:p-5 bg-medical-gray-50 rounded-xl border border-medical-gray-100 hover:shadow-sm transition-all">
               <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                 <MapPin className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
               </div>
               <div className="min-w-0 flex-1">
                 <div className="text-xs lg:text-sm text-medical-gray-500 mb-1">Dirección</div>
                 <div className="font-semibold text-sm lg:text-base truncate">
                   {user.direccion_establecimiento || 'No disponible'}
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>

             {/* Seguridad */}
       <div className="bg-white rounded-2xl shadow-soft p-6 lg:p-8">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
           <h2 className="text-lg lg:text-xl font-bold text-medical-gray-900 flex items-center gap-2">
             <Key className="w-5 h-5 lg:w-6 lg:h-6" />
             Seguridad
           </h2>
           <button className="btn-medical-secondary self-start sm:self-auto px-4 py-2 lg:px-6 lg:py-3">
             <span className="hidden sm:inline">Cambiar Contraseña</span>
             <span className="sm:hidden">Contraseña</span>
           </button>
         </div>

         <div className="space-y-4 lg:space-y-5">
           <div className="flex items-center gap-4 p-4 lg:p-5 bg-green-50 rounded-xl border border-green-200 hover:shadow-sm transition-all">
             <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
               <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
             </div>
             <div className="min-w-0 flex-1">
               <div className="font-semibold text-green-800 text-sm lg:text-base mb-1">
                 Cuenta {user.is_verified ? 'verificada' : 'no verificada'}
               </div>
               <div className="text-xs lg:text-sm text-green-600">
                 Tu cuenta está {user.is_active ? 'activa' : 'inactiva'}
               </div>
             </div>
           </div>
           <div className="flex items-center gap-4 p-4 lg:p-5 bg-medical-gray-50 rounded-xl border border-medical-gray-100 hover:shadow-sm transition-all">
             <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
               <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
             </div>
             <div className="min-w-0 flex-1">
               <div className="text-xs lg:text-sm text-medical-gray-500 mb-1">Último acceso</div>
               <div className="font-semibold text-sm lg:text-base">
                 {user.last_login ? new Date(user.last_login).toLocaleString('es-VE') : 'No registrado'}
               </div>
             </div>
           </div>
         </div>
       </div>
    </div>
  );
};

// Sección de Promociones
const PromotionsSection: React.FC<{ promotions: UserPromotion[] }> = ({ promotions }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDiscountText = (promotion: UserPromotion) => {
    if (promotion.discount_type === 'percentage') {
      return `${promotion.discount_value}% OFF`;
    } else {
      return `$${promotion.discount_value} OFF`;
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    // Aquí podrías agregar una notificación de copiado
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-soft p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg lg:text-xl font-bold text-medical-gray-900 flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Promociones Disponibles
          </h2>
          <span className="text-sm text-medical-gray-600">
            {promotions.filter(p => !p.is_used).length} promociones activas
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {promotions.map((promotion) => (
            <motion.div
              key={promotion.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative p-4 lg:p-6 rounded-2xl border-2 ${
                promotion.is_used
                  ? 'bg-medical-gray-50 border-medical-gray-200 opacity-60'
                  : 'bg-gradient-to-br from-medical-blue-50 to-purple-50 border-medical-blue-200'
              }`}
            >
              {/* Badge de descuento */}
              <div className={`absolute -top-2 -right-2 lg:-top-3 lg:-right-3 px-3 lg:px-4 py-1 lg:py-2 rounded-full text-white font-bold text-sm lg:text-lg ${
                promotion.is_used ? 'bg-medical-gray-400' : 'bg-medical-blue-gradient'
              }`}>
                {getDiscountText(promotion)}
              </div>

              {/* Estado usado */}
              {promotion.is_used && (
                <div className="absolute top-3 lg:top-4 left-3 lg:left-4 px-2 lg:px-3 py-1 bg-medical-gray-500 text-white text-xs font-medium rounded-full">
                  USADO
                </div>
              )}

              <div className="mt-3 lg:mt-4">
                <h3 className="text-base lg:text-lg font-bold text-medical-gray-900 mb-2">
                  {promotion.title}
                </h3>
                <p className="text-medical-gray-600 text-sm mb-3 lg:mb-4">
                  {promotion.description}
                </p>

                {/* Código de promoción */}
                <div className="bg-white/80 backdrop-blur-sm p-3 lg:p-4 rounded-xl border border-medical-gray-200 mb-3 lg:mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-xs text-medical-gray-500 mb-1">Código de promoción</div>
                      <div className="font-mono font-bold text-medical-gray-900 text-base lg:text-lg break-all">
                        {promotion.code}
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(promotion.code)}
                      className="px-3 py-2 bg-medical-blue-100 text-medical-blue-700 rounded-lg hover:bg-medical-blue-200 transition-colors text-sm font-medium self-start sm:self-auto"
                      disabled={promotion.is_used}
                    >
                      Copiar
                    </button>
                  </div>
                </div>

                {/* Detalles de la promoción */}
                <div className="space-y-2 text-xs lg:text-sm text-medical-gray-600">
                  {promotion.min_amount && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4 text-green-500 flex-shrink-0" />
                      <span>Compra mínima: ${promotion.min_amount}</span>
                    </div>
                  )}
                  {promotion.max_discount && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4 text-green-500 flex-shrink-0" />
                      <span>Descuento máximo: ${promotion.max_discount}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 lg:w-4 lg:h-4 text-orange-500 flex-shrink-0" />
                    <span>Válido hasta: {formatDate(promotion.valid_until)}</span>
                  </div>
                </div>

                {/* Botón de acción */}
                {!promotion.is_used && (
                  <button className="w-full mt-3 lg:mt-4 btn-medical-primary text-sm lg:text-base">
                    Usar promoción
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {promotions.length === 0 && (
          <div className="text-center py-8 lg:py-12">
            <Gift className="w-12 h-12 lg:w-16 lg:h-16 text-medical-gray-300 mx-auto mb-4" />
            <h3 className="text-base lg:text-lg font-semibold text-medical-gray-500 mb-2">
              No hay promociones disponibles
            </h3>
            <p className="text-sm lg:text-base text-medical-gray-400">
              Las promociones aparecerán aquí cuando estén disponibles
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Sección de Soporte
const SupportSection: React.FC<{ tickets: SupportTicket[] }> = ({ tickets }) => {
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    message: ''
  });

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      urgent: 'text-red-600'
    };
    return colors[priority as keyof typeof colors] || 'text-gray-600';
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el ticket
    console.log('Nuevo ticket:', newTicket);
    setShowNewTicketForm(false);
    setNewTicket({ subject: '', category: 'general', priority: 'medium', message: '' });
  };

  return (
    <div className="space-y-6">
      {/* Nuevo ticket */}
      {!showNewTicketForm ? (
        <div className="bg-white rounded-2xl shadow-soft p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg lg:text-xl font-bold text-medical-gray-900 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Centro de Soporte
            </h2>
            <button
              onClick={() => setShowNewTicketForm(true)}
              className="btn-medical-primary flex items-center gap-2 self-start sm:self-auto"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo ticket</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          </div>

          {/* Contacto rápido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-6 lg:mb-8">
            <div className="p-3 lg:p-4 bg-medical-blue-50 rounded-xl text-center border border-medical-blue-100">
              <Phone className="w-6 h-6 lg:w-8 lg:h-8 text-medical-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-medical-gray-900 text-sm lg:text-base">Teléfono</h3>
              <p className="text-xs lg:text-sm text-medical-gray-600">+58 212-800-FARMA</p>
              <p className="text-xs text-medical-gray-500">Lun-Vie 8AM-6PM</p>
            </div>
            <div className="p-3 lg:p-4 bg-green-50 rounded-xl text-center border border-green-100">
              <MessageCircle className="w-6 h-6 lg:w-8 lg:h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-medical-gray-900 text-sm lg:text-base">WhatsApp</h3>
              <p className="text-xs lg:text-sm text-medical-gray-600">+58 414-FARMA-VE</p>
              <p className="text-xs text-medical-gray-500">24/7 Disponible</p>
            </div>
            <div className="p-3 lg:p-4 bg-purple-50 rounded-xl text-center border border-purple-100 sm:col-span-2 lg:col-span-1">
              <Mail className="w-6 h-6 lg:w-8 lg:h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-medical-gray-900 text-sm lg:text-base">Email</h3>
              <p className="text-xs lg:text-sm text-medical-gray-600">soporte@grupodrozainka.com</p>
              <p className="text-xs text-medical-gray-500">Respuesta en 24h</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-soft p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg lg:text-xl font-bold text-medical-gray-900">Crear Nuevo Ticket</h2>
            <button
              onClick={() => setShowNewTicketForm(false)}
              className="btn-medical-secondary self-start sm:self-auto"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmitTicket} className="space-y-4 lg:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
                  Asunto *
                </label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="w-full p-3 border border-medical-gray-300 rounded-xl focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent"
                  placeholder="Describe brevemente tu problema"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                  className="w-full p-3 border border-medical-gray-300 rounded-xl focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent"
                >
                  <option value="general">Consulta General</option>
                  <option value="technical">Problema Técnico</option>
                  <option value="billing">Facturación</option>
                  <option value="order">Pedidos</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
                Prioridad
              </label>
              <select
                value={newTicket.priority}
                onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                className="w-full p-3 border border-medical-gray-300 rounded-xl focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
                Mensaje *
              </label>
              <textarea
                value={newTicket.message}
                onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                className="w-full p-3 border border-medical-gray-300 rounded-xl focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent"
                rows={6}
                placeholder="Describe detalladamente tu problema o consulta"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
              <button type="submit" className="btn-medical-primary flex-1">
                Enviar ticket
              </button>
              <button
                type="button"
                onClick={() => setShowNewTicketForm(false)}
                className="btn-medical-secondary flex-1"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Historial de tickets */}
      {!showNewTicketForm && (
        <div className="bg-white rounded-2xl shadow-soft p-6 lg:p-8">
          <h3 className="text-lg font-bold text-medical-gray-900 mb-6">Mis Tickets</h3>
          
          <div className="space-y-3 lg:space-y-4">
            {tickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 lg:p-4 border border-medical-gray-200 rounded-xl hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 lg:gap-3 mb-2">
                      <h4 className="font-semibold text-medical-gray-900 text-sm lg:text-base truncate">
                        {ticket.subject}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status === 'open' ? 'Abierto' : 
                         ticket.status === 'in_progress' ? 'En progreso' : 
                         ticket.status === 'resolved' ? 'Resuelto' : 'Cerrado'}
                      </span>
                      <span className={`text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority === 'low' ? 'Baja' : 
                         ticket.priority === 'medium' ? 'Media' : 
                         ticket.priority === 'high' ? 'Alta' : 'Urgente'}
                      </span>
                    </div>
                    <p className="text-sm text-medical-gray-600 mb-2 line-clamp-2">{ticket.message}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-medical-gray-500">
                      <span>Creado: {new Date(ticket.created_at).toLocaleDateString('es-VE')}</span>
                      <span>#{ticket.id.slice(0, 8)}</span>
                    </div>
                  </div>
                  <button className="btn-medical-secondary text-sm self-start sm:self-auto">
                    Ver detalles
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {tickets.length === 0 && (
            <div className="text-center py-8 lg:py-12">
              <MessageCircle className="w-12 h-12 lg:w-16 lg:h-16 text-medical-gray-300 mx-auto mb-4" />
              <h3 className="text-base lg:text-lg font-semibold text-medical-gray-500 mb-2">
                No hay tickets de soporte
              </h3>
              <p className="text-sm lg:text-base text-medical-gray-400">
                Crea tu primer ticket para contactar a nuestro equipo de soporte
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage; 