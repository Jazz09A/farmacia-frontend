import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  User, 
  Phone, 
  MessageSquare, 
  Building, 
  Home, 
  MapPin, 
  AlertCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const QueremosConocertePage: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    farmacia: '',
    direccion: '',
    estado: '',
    mensaje: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const venezuelanStates = [
    'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar', 'Carabobo', 
    'Cojedes', 'Delta Amacuro', 'Distrito Capital', 'Falcón', 'Guárico', 'Lara', 
    'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta', 'Portuguesa', 'Sucre', 
    'Táchira', 'Trujillo', 'Vargas', 'Yaracuy', 'Zulia'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simular envío del formulario
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <motion.div
          className="max-w-2xl mx-auto text-center p-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <motion.div
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              ¡Solicitud Enviada Exitosamente!
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Gracias por tu interés en asociarte con Drozainka. 
              Uno de nuestros asesores comerciales se pondrá en contacto contigo pronto.
            </p>
            
            <div className="space-y-4">
              <Link
                to="/"
                className="inline-flex items-center bg-medical-blue-600 hover:bg-medical-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-300"
              >
                Volver al Inicio
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Banner Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Equipo de Grupo Drozainka"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-medical-blue-600/80 to-medical-blue-800/80"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 medical-container text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.div
              className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-semibold mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <User className="w-5 h-5" />
              <span>Conectemos contigo</span>
            </motion.div>

            <motion.h1
              className="text-5xl lg:text-7xl font-serif font-bold leading-tight mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Queremos{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                Conocerte
              </span>
            </motion.h1>

            <motion.p
              className="text-xl lg:text-2xl text-white/90 leading-relaxed max-w-4xl mx-auto mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Gracias por tu interés en asociarte con Drozainka como distribuidor farmacéutico. 
              Completa el formulario y uno de nuestros asesores comerciales te contactará.
            </motion.p>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <motion.button
                onClick={() => document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center text-white/90 hover:text-white font-semibold text-lg group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Completa el formulario
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section id="form-section" className="py-24 bg-white">
        <div className="medical-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Form Section */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-gray-50 rounded-2xl shadow-lg">
                <div className="md:col-span-2 text-center mb-4">
                  <h2 className="text-3xl font-serif font-bold text-gray-800">Formulario de Contacto</h2>
                </div>
                
                {/* Nombre y Apellido */}
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Nombre" 
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleInputChange}
                    placeholder="Apellido" 
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                  />
                </div>
                
                {/* Correo y Teléfono */}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Correo Electrónico" 
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="tel" 
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="Teléfono Celular" 
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                  />
                </div>
                
                {/* Nombre de la Farmacia */}
                <div className="md:col-span-2 relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    name="farmacia"
                    value={formData.farmacia}
                    onChange={handleInputChange}
                    placeholder="Nombre de la Farmacia" 
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                  />
                </div>
                
                {/* Dirección */}
                <div className="md:col-span-2 relative">
                  <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    placeholder="Dirección" 
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                  />
                </div>
                
                {/* Estado */}
                <div className="md:col-span-2 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select 
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue-500 bg-white"
                  >
                    <option value="" disabled>Seleccione un estado</option>
                    {venezuelanStates.sort().map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                
                {/* Mensaje */}
                <div className="md:col-span-2 relative">
                  <MessageSquare className="absolute left-4 top-5 text-gray-400" />
                  <textarea 
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleInputChange}
                    placeholder="Mensaje (Opcional)" 
                    rows={5} 
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2 text-center">
                  <motion.button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="btn-medical-primary disabled:opacity-50 disabled:cursor-not-allowed" 
                    whileHover={{ scale: isSubmitting ? 1 : 1.05 }} 
                    whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Enviando...</span>
                      </div>
                    ) : (
                      'Enviar Solicitud'
                    )}
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
      </section>

      {/* Contact Info Section */}
      <section className="py-16 bg-medical-blue-600 text-white">
        <div className="medical-container">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-8">
              ¿Tienes preguntas? Contáctanos directamente
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">Teléfono</h3>
                <p className="text-white/80">+58 212 555-0123</p>
              </div>
              
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-white/80">comercial@grupodrozainka.com</p>
              </div>
              
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">Ubicación</h3>
                <p className="text-white/80">Caracas, Venezuela</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default QueremosConocertePage;
