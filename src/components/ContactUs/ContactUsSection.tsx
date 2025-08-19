import React from 'react';
import { motion } from 'framer-motion';
import { Mail, User, Phone, MessageSquare, Building, Home, MapPin, AlertCircle } from 'lucide-react';

export const ContactUsSection: React.FC = () => {
  const venezuelanStates = [
    'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar', 'Carabobo', 
    'Cojedes', 'Delta Amacuro', 'Distrito Capital', 'Falcón', 'Guárico', 'Lara', 
    'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta', 'Portuguesa', 'Sucre', 
    'Táchira', 'Trujillo', 'Vargas', 'Yaracuy', 'Zulia'
  ];

  return (
    <div className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-gray-50 rounded-2xl shadow-lg">
              <div className="md:col-span-2 text-center mb-4">
                 <h2 className="text-3xl font-serif font-bold text-gray-800">Formulario de Contacto</h2>
              </div>
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

          {/* Text Content Section */}
          <motion.div
            className="text-gray-700"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-gray-800 mb-6">QUEREMOS CONOCERTE</h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Gracias por tu interés en asociarte con Drozainka como distribuidor farmacéutico. Por favor, completa el formulario y uno de nuestros asesores comerciales te contactará para establecer una alianza comercial.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
              <div className="flex items-start">
                  <AlertCircle className="h-6 w-6 text-blue-600 mr-4 mt-1" />
                  <div>
                      <h3 className="font-bold text-gray-800 text-lg mb-2">Documentación Comercial Requerida</h3>
                      <p className="text-gray-700">
                          Para establecer una relación comercial, necesitarás tener actualizados los siguientes documentos de tu farmacia:
                      </p>
                      <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600">
                          <li>RIF vigente de la farmacia</li>
                          <li>Registro Mercantil actualizado</li>
                          <li>Permiso de funcionamiento farmacéutico</li>
                          <li>Licencia del farmacéutico responsable</li>
                      </ul>
                  </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}; 