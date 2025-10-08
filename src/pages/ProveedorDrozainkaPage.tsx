import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  MapPin, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Building2,
  Phone,
  Mail,
  FileText,
  Shield,
  Award,
  Truck,
  Package,
  Wrench,
  Laptop,
  Briefcase,
  Star,
  Handshake
} from 'lucide-react';
import { Link } from 'react-router-dom';
import MapSection from '../components/Map/MapSection';
const ProveedorDrozainkaPage: React.FC = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    supplierType: '',
    productCategory: '',
    yearsInBusiness: '',
    companySize: '',
    currentClients: '',
    certifications: '',
    specialRequirements: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const supplierTypes = [
    {
      icon: Package,
      title: 'Proveedor de Mercadería',
      description: 'Productos farmacéuticos, nutracéuticos y de salud para nuestra red de farmacias',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      icon: Wrench,
      title: 'Proveedor de Suministros y Servicios',
      description: 'Insumos de oficina, repuestos mecánicos y electrónicos para nuestra operación',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      icon: Laptop,
      title: 'Proveedor de Equipos Tecnológicos',
      description: 'Tecnología y equipos especializados para optimizar nuestros procesos',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  const benefits = [
    {
      icon: Handshake,
      title: 'Alianza Estratégica',
      description: 'Forma parte de nuestra red de aliados comerciales y crece con nosotros'
    },
    {
      icon: Star,
      title: 'Oportunidades de Crecimiento',
      description: 'Accede a un mercado estable y en constante expansión'
    },
    {
      icon: Shield,
      title: 'Procesos Transparentes',
      description: 'Evaluación justa y transparente de todas las propuestas'
    }
  ];

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
              Gracias por tu interés en formar parte de nuestra red de proveedores. 
              Nuestro equipo de compras se pondrá en contacto contigo en las próximas 48 horas.
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
            src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Equipo de trabajo profesional"
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
              <Handshake className="w-5 h-5" />
              <span>Únete a nuestra red</span>
            </motion.div>

            <motion.h1
              className="text-5xl lg:text-7xl font-serif font-bold leading-tight mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Sé un{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                Proveedor Drozainka
              </span>
            </motion.h1>

            <motion.p
              className="text-xl lg:text-2xl text-white/90 leading-relaxed max-w-4xl mx-auto mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Únete a nuestra red de aliados comerciales y forma parte del crecimiento 
              de la distribución farmacéutica más confiable de Venezuela.
            </motion.p>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <motion.button
                onClick={() => document.getElementById('types-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center text-white/90 hover:text-white font-semibold text-lg group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Descubre las oportunidades disponibles
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Supplier Types Section */}
      <section id="types-section" className="py-24 bg-white">
        <div className="medical-container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-6">
              Oportunidades de{' '}
              <span className="text-medical-blue-600">Colaboración</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Estamos en búsqueda constante de los mejores proveedores para satisfacer 
              las necesidades de nuestra operación y nuestros clientes
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {supplierTypes.map((type, index) => (
              <motion.div
                key={index}
                className={`relative p-8 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl ${type.bgColor} ${type.borderColor}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${type.color} text-white mb-6`}>
                    <type.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{type.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{type.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits-section" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="medical-container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-6">
              ¿Por qué ser{' '}
              <span className="text-medical-green-600">nuestro aliado</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Forma parte de una red de proveedores que crece junto con nosotros
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-medical-blue-100 rounded-full mb-6">
                    <benefit.icon className="w-8 h-8 text-medical-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form Section */}
      <section id="form-section" className="py-24 bg-white">
        <div className="medical-container">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-6">
                Solicita ser{' '}
                <span className="text-medical-blue-600">Proveedor</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Completa el formulario y nuestro equipo de compras evaluará tu propuesta
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-xl p-8 lg:p-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Información de la Empresa */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Building2 className="w-6 h-6 text-medical-blue-600" />
                    <h3 className="text-2xl font-bold text-gray-900">Información de la Empresa</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nombre de la Empresa *
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="Ej: Suministros Médicos S.A."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Persona de Contacto *
                      </label>
                      <input
                        type="text"
                        name="contactPerson"
                        value={formData.contactPerson}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="Ej: Juan Pérez"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email de Contacto *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="contacto@empresa.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="+58 212 555-0123"
                      />
                    </div>
                  </div>
                </div>

                {/* Ubicación */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <MapPin className="w-6 h-6 text-medical-blue-600" />
                    <h3 className="text-2xl font-bold text-gray-900">Ubicación</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Dirección *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="Av. Principal, Edificio Empresarial, Local 1"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="Caracas"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Estado *
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="">Selecciona un estado</option>
                      <option value="Distrito Capital">Distrito Capital</option>
                      <option value="Miranda">Miranda</option>
                      <option value="Zulia">Zulia</option>
                      <option value="Carabobo">Carabobo</option>
                      <option value="Lara">Lara</option>
                      <option value="Aragua">Aragua</option>
                      <option value="Anzoátegui">Anzoátegui</option>
                      <option value="Bolívar">Bolívar</option>
                      <option value="Táchira">Táchira</option>
                      <option value="Mérida">Mérida</option>
                      <option value="Trujillo">Trujillo</option>
                      <option value="Portuguesa">Portuguesa</option>
                      <option value="Yaracuy">Yaracuy</option>
                      <option value="Falcón">Falcón</option>
                      <option value="Sucre">Sucre</option>
                      <option value="Monagas">Monagas</option>
                      <option value="Delta Amacuro">Delta Amacuro</option>
                      <option value="Amazonas">Amazonas</option>
                      <option value="Apure">Apure</option>
                      <option value="Barinas">Barinas</option>
                      <option value="Cojedes">Cojedes</option>
                      <option value="Guárico">Guárico</option>
                      <option value="Vargas">Vargas</option>
                    </select>
                  </div>
                </div>

                {/* Información Comercial */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Briefcase className="w-6 h-6 text-medical-blue-600" />
                    <h3 className="text-2xl font-bold text-gray-900">Información Comercial</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tipo de Proveedor *
                      </label>
                      <select
                        name="supplierType"
                        value={formData.supplierType}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent transition-all duration-300"
                      >
                        <option value="">Selecciona el tipo</option>
                        <option value="Proveedor de Mercadería">Proveedor de Mercadería</option>
                        <option value="Proveedor de Suministros y Servicios">Proveedor de Suministros y Servicios</option>
                        <option value="Proveedor de Equipos Tecnológicos">Proveedor de Equipos Tecnológicos</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Categoría de Productos/Servicios *
                      </label>
                      <input
                        type="text"
                        name="productCategory"
                        value={formData.productCategory}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="Ej: Medicamentos, Insumos de Oficina, etc."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Años en el Negocio *
                      </label>
                      <select
                        name="yearsInBusiness"
                        value={formData.yearsInBusiness}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent transition-all duration-300"
                      >
                        <option value="">Selecciona</option>
                        <option value="Menos de 1 año">Menos de 1 año</option>
                        <option value="1-3 años">1-3 años</option>
                        <option value="3-5 años">3-5 años</option>
                        <option value="5-10 años">5-10 años</option>
                        <option value="10-20 años">10-20 años</option>
                        <option value="Más de 20 años">Más de 20 años</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tamaño de la Empresa *
                      </label>
                      <select
                        name="companySize"
                        value={formData.companySize}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent transition-all duration-300"
                      >
                        <option value="">Selecciona</option>
                        <option value="Microempresa (1-10 empleados)">Microempresa (1-10 empleados)</option>
                        <option value="Pequeña empresa (11-50 empleados)">Pequeña empresa (11-50 empleados)</option>
                        <option value="Mediana empresa (51-200 empleados)">Mediana empresa (51-200 empleados)</option>
                        <option value="Gran empresa (más de 200 empleados)">Gran empresa (más de 200 empleados)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Clientes Actuales
                      </label>
                      <input
                        type="text"
                        name="currentClients"
                        value={formData.currentClients}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="Menciona algunos clientes importantes"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Certificaciones
                      </label>
                      <input
                        type="text"
                        name="certifications"
                        value={formData.certifications}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="ISO, Buenas Prácticas, etc."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Información Adicional
                    </label>
                    <textarea
                      name="specialRequirements"
                      value={formData.specialRequirements}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="Describe tu propuesta, capacidades especiales, o cualquier información adicional que consideres relevante..."
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-8">
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
                        <span>Enviando Solicitud...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Handshake className="w-5 h-5" />
                        <span>Enviar Solicitud de Proveedor</span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
      <section>
        <MapSection
          subtitle="Distribuidor líder de productos nutraceuticos y farmacéuticos en Venezuela. Suministramos productos certificados a farmacias con la más alta calidad y confiabilida."
        />
      </section>
    </div>
  );
};

export default ProveedorDrozainkaPage;
