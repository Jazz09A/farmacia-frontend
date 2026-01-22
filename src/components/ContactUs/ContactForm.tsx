import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, User, Phone, MessageSquare, Building, Home, MapPin, Handshake, ArrowRight } from 'lucide-react';
import { emailService } from '../../services/EmailService';

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
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    farmacia_nombre: '',
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
    
    try {
      await emailService.sendContactForm({
        title: 'Contacto',
        name: formData.nombre,
        apellido: formData.apellido,
        farmacia_nombre: formData.farmacia_nombre,
        user_email: formData.email,
        phone: formData.telefono,
        estado: formData.estado,
        direccion: formData.direccion,
        email: formData.email,
        mensaje: formData.mensaje || '',
      });
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      alert('Error al enviar el formulario. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={className}
      >
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-green-800 mb-2">¡Formulario Enviado Exitosamente!</h3>
          <p className="text-green-600">Gracias por contactarnos. Nos pondremos en contacto contigo pronto.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-gray-50 rounded-2xl shadow-lg">
        {showTitle && (
          <div className="md:col-span-2 text-center mb-4">
            <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
          </div>
        )}
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
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {/* Nombre de la Farmacia */}
        <div className="md:col-span-2 relative">
          <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            name="farmacia_nombre"
            value={formData.farmacia_nombre}
            onChange={handleInputChange}
            placeholder="Nombre de la Farmacia" 
            required
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="" disabled>Seleccione un estado</option>
            {venezuelanStates.sort().map(state => <option key={state} value={state}>{state}</option>)}
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
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="md:col-span-2 text-center">
          <motion.button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-medical-blue-600 to-medical-blue-700 hover:from-medical-blue-700 hover:to-medical-blue-800 text-white font-semibold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }} 
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Enviando...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Handshake className="w-5 h-5" />
                <span>Enviar Solicitud</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default ContactForm;
