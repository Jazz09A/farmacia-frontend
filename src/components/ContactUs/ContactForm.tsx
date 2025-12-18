import React from 'react';
import { motion } from 'framer-motion';
import { Mail, User, Phone, MessageSquare, Building, Home, MapPin } from 'lucide-react';

type ContactFormProps = {
  title?: string;
  className?: string;
  showTitle?: boolean;
};

export const ContactForm: React.FC<ContactFormProps> = ({
  title = 'Formulario de Contacto',
  className = '',
  showTitle = true,
}) => {
  const venezuelanStates = [
    'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar', 'Carabobo', 
    'Cojedes', 'Delta Amacuro', 'Distrito Capital', 'Falcón', 'Guárico', 'Lara', 
    'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta', 'Portuguesa', 'Sucre', 
    'Táchira', 'Trujillo', 'Vargas', 'Yaracuy', 'Zulia'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-gray-50 rounded-2xl shadow-lg">
        {showTitle && (
          <div className="md:col-span-2 text-center mb-4">
            <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
          </div>
        )}
        {/* Nombre y Apellido */}
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Nombre" className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Apellido" className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>
        {/* Correo y Teléfono */}
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="email" placeholder="Correo Electrónico" className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="tel" placeholder="Teléfono Celular" className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>
        {/* Nombre de la Farmacia */}
        <div className="md:col-span-2 relative">
          <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Nombre de la Farmacia" className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>
        {/* Dirección */}
        <div className="md:col-span-2 relative">
          <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Dirección" className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>
        {/* Estado */}
        <div className="md:col-span-2 relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <select className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" defaultValue="">
            <option value="" disabled>Seleccione un estado</option>
            {venezuelanStates.sort().map(state => <option key={state} value={state}>{state}</option>)}
          </select>
        </div>
        {/* Mensaje */}
        <div className="md:col-span-2 relative">
          <MessageSquare className="absolute left-4 top-5 text-gray-400" />
          <textarea placeholder="Mensaje (Opcional)" rows={5} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
        </div>
        <div className="md:col-span-2 text-center">
          <motion.button type="submit" className="btn-medical-primary" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            Enviar Solicitud
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default ContactForm;
