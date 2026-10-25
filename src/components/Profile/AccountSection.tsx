import React, { useState } from 'react';
import {
  User as UserIcon,
  Key,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Building,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { User } from '../../types/auth';
import ChangePasswordForm from './ChangePasswordForm';

// Componente para la sección de cuenta
export const AccountSection: React.FC<{ user: User }> = ({ user }) => {
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (
    <div className="space-y-6 lg:space-y-8">
             {/* Información de la cuenta */}
       <div className="bg-white rounded-2xl shadow-soft p-6 lg:p-8">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
           <h2 className="text-lg lg:text-xl font-bold text-medical-gray-900 flex items-center gap-2">
             <UserIcon className="w-5 h-5 lg:w-6 lg:h-6" />
             Información de la Cuenta
           </h2>
           {/* <button className="btn-medical-secondary self-start sm:self-auto px-4 py-2 lg:px-6 lg:py-3">
             <Settings className="w-4 h-4 lg:w-5 lg:h-5" />
             <span className="hidden sm:inline ml-2">Editar</span>
             <span className="sm:hidden">Editar</span>
           </button> */}
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
             {/* <div className="flex items-center gap-4 p-4 lg:p-5 bg-medical-gray-50 rounded-xl border border-medical-gray-100 hover:shadow-sm transition-all">
               <div className="w-10 h-10 lg:w-12 lg:h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                 <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-600" />
               </div>
               <div className="min-w-0 flex-1">
                 <div className="text-xs lg:text-sm text-medical-gray-500 mb-1">Representante Legal</div>
                 <div className="font-semibold text-sm lg:text-base truncate">
                   {user.representante_legal_nombre || 'No disponible'}
                 </div>
               </div>
             </div> */}
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
       {showChangePassword ? (
         <ChangePasswordForm
           onSuccess={() => setShowChangePassword(false)}
           onCancel={() => setShowChangePassword(false)}
         />
       ) : (
         <div className="bg-white rounded-2xl shadow-soft p-6 lg:p-8">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
             <h2 className="text-lg lg:text-xl font-bold text-medical-gray-900 flex items-center gap-2">
               <Key className="w-5 h-5 lg:w-6 lg:h-6" />
               Seguridad
             </h2>
             <button
               onClick={() => setShowChangePassword(true)}
               className="btn-medical-secondary self-start sm:self-auto px-4 py-2 lg:px-6 lg:py-3"
             >
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
       )}
    </div>
  );
};


