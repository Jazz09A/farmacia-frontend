import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  User, 
  Phone, 
  MessageSquare, 
  Briefcase,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Handshake
} from 'lucide-react';
import { Link } from 'react-router-dom';

const QueremosConocertePage: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    cargo: '',
    mensaje: ''
  });

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const availablePositions = [
    'Representante de Ventas',
    'Analista de Almacen',
    'Auxiliar Administrativo',
    'Contador',
    'Recursos Humanos',
    'Marketing',
    'Otro'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validar que sea PDF o DOC/DOCX
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (validTypes.includes(file.type) || file.name.endsWith('.pdf') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
        // Validar tamaño máximo (5MB)
        if (file.size <= 5 * 1024 * 1024) {
          setCvFile(file);
        } else {
          alert('El archivo es demasiado grande. Por favor, sube un archivo de máximo 5MB.');
        }
      } else {
        alert('Por favor, sube un archivo PDF o Word (.pdf, .doc, .docx)');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cvFile) {
      alert('Por favor, sube tu CV');
      return;
    }
    
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
              ¡Postulación Enviada Exitosamente!
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Gracias por tu interés en trabajar con Drozainka C.A.
              Hemos recibido tu CV y postulación. Nos pondremos en contacto contigo pronto.
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
            src="/images-local/establecimiento_Drozainka.webp"
            alt="Establecimiento de Grupo Drozainka C.A"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-medical-blue-900/70 via-medical-blue-800/55 to-medical-blue-700/45"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"></div>
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
              <Briefcase className="w-5 h-5" />
              <span>Únete a nuestro equipo</span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-5xl font-bold leading-tight mb-8 drop-shadow-[0_6px_18px_rgba(0,0,0,0.65)]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Trabaja{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                con Nosotros
              </span>
            </motion.h1>

            <motion.p
              className="text-xl lg:text-2xl text-white/95 leading-relaxed max-w-4xl mx-auto mb-12 drop-shadow-[0_4px_14px_rgba(0,0,0,0.55)]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              ¿Deseas trabajar con nosotros? 
              Estamos buscando talento para formar parte de nuestro equipo.
            </motion.p>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
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
                  <h2 className="text-3xl font-bold text-gray-800">Formulario de Postulación</h2>
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
                
                {/* Cargo */}
                <div className="md:col-span-2 relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select 
                    name="cargo"
                    value={formData.cargo}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue-500 bg-white"
                  >
                    <option value="" disabled>Seleccione un cargo</option>
                    {availablePositions.map(position => (
                      <option key={position} value={position}>{position}</option>
                    ))}
                  </select>
                </div>
                
                {/* Subir CV */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subir CV (PDF o Word, máximo 5MB)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      required
                      className="hidden"
                      id="cv-upload"
                    />
                    <label
                      htmlFor="cv-upload"
                      className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-medical-blue-500 transition-colors bg-white"
                    >
                      <div className="flex items-center space-x-3">
                        {cvFile ? (
                          <>
                            <FileText className="w-5 h-5 text-green-600" />
                            <span className="text-sm text-gray-700">{cvFile.name}</span>
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5 text-gray-400" />
                            <span className="text-sm text-gray-600">Haz clic para subir tu CV</span>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                  {cvFile && (
                    <p className="mt-2 text-xs text-gray-500">
                      Archivo seleccionado: {cvFile.name} ({(cvFile.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                </div>
                
                {/* Mensaje */}
                <div className="md:col-span-2 relative">
                  <MessageSquare className="absolute left-4 top-5 text-gray-400" />
                  <textarea 
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleInputChange}
                    placeholder="Mensaje adicional (Opcional)" 
                    rows={5} 
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2 text-center">
                  <motion.button 
                    type="submit" 
                    disabled={isSubmitting || !cvFile}
                    className="btn-medical-primary disabled:opacity-50 disabled:cursor-not-allowed" 
                    whileHover={{ scale: isSubmitting || !cvFile ? 1 : 1.05 }} 
                    whileTap={{ scale: isSubmitting || !cvFile ? 1 : 0.95 }}
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

            {/* Text Content Section */}
            <motion.div
              className="text-gray-700"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">TRABAJA CON NOSOTROS</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                ¿Deseas trabajar con nosotros? En Drozainka estamos siempre buscando talento comprometido y apasionado por la industria farmacéutica. Completa el formulario, sube tu CV y postúlate para el cargo de tu interés.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-6">
                <div className="flex items-start">
                  <AlertCircle className="h-6 w-6 text-blue-600 mr-4 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg mb-2">Proceso de Selección</h3>
                    <p className="text-gray-700 mb-3">
                      Una vez que envíes tu postulación:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                      <li>Revisaremos tu CV y perfil</li>
                      <li>Te contactaremos si tu perfil coincide con nuestras necesidades</li>
                      <li>Programaremos una entrevista</li>
                      <li>Te informaremos sobre el resultado del proceso</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-4 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg mb-2">¿Qué ofrecemos?</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                      <li>Ambiente de trabajo colaborativo</li>
                      <li>Oportunidades de crecimiento profesional</li>
                      <li>Capacitación continua</li>
                      <li>Beneficios competitivos</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      {/* <section className="py-16 bg-medical-blue-600 text-white">
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
                <p className="text-white/80">rrhh@grupodrozainka.com</p>
              </div>
              
            </div>
          </motion.div>
        </div>
      </section> */}
    </div>
  );
};

export default QueremosConocertePage;
