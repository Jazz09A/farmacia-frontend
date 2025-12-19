import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Eye, 
  FileCheck, 
  Users, 
  Mail,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Database,
  Key,
  Truck
} from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-medical-green-600 to-medical-green-800 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
        
        <motion.div
          className="relative z-10 medical-container text-center text-white"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Shield className="w-10 h-10 text-white" />
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Política de Privacidad de Datos
          </motion.h1>
          
          <motion.p
            className="text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Comprometidos con la protección y privacidad de su información
          </motion.p>

          <motion.div
            className="flex flex-wrap justify-center gap-4 text-sm md:text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <Calendar className="w-4 h-4" />
              <span>Vigente desde: [FECHA DE IMPLEMENTACIÓN]</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-white">
        <motion.div
          className="medical-container max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Sección 1 */}
          <motion.div
            className="mb-12"
            variants={itemVariants}
          >
            <div className="bg-gradient-to-r from-medical-green-50 to-medical-green-100 rounded-xl p-6 mb-6 border-l-4 border-medical-green-600">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center">
                <Users className="w-8 h-8 text-medical-green-600 mr-3" />
                1. Identidad del responsable
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                <strong>Grupo Drozainka, CA</strong>, RIF J-50570318-8, con domicilio fiscal en [DIRECCIÓN COMPLETA DE LA SEDE PRINCIPAL], es el responsable del tratamiento de los datos personales de sus clientes B2B y sus contactos autorizados.
              </p>
            </div>
          </motion.div>

          {/* Sección 2 */}
          <motion.div
            className="mb-12"
            variants={itemVariants}
          >
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <Database className="w-8 h-8 text-medical-blue-600 mr-3" />
                2. Información que Recopilamos
              </h2>
              
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-medical-blue-600">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="w-6 h-6 text-medical-blue-600 mr-3" />
                    Datos de la Empresa Cliente
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Razón social</li>
                    <li>RIF</li>
                    <li>Dirección fiscal y de entrega</li>
                    <li>Teléfonos</li>
                    <li>Correo electrónico corporativo</li>
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-medical-blue-600">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="w-6 h-6 text-medical-blue-600 mr-3" />
                    Datos de Personas de Contacto
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Nombres y apellidos</li>
                    <li>Cédula de identidad</li>
                    <li>Cargo</li>
                    <li>Teléfono móvil/corporativo</li>
                    <li>Correo electrónico de los representantes, compradores, encargados de logística o pagos autorizados por el Cliente</li>
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-medical-blue-600">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <FileCheck className="w-6 h-6 text-medical-blue-600 mr-3" />
                    Datos de la Relación Comercial
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Historial de pedidos y cotizaciones</li>
                    <li>Condiciones crediticias aprobadas</li>
                    <li>Comunicaciones de servicio al cliente</li>
                    <li>Facturación electrónica</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sección 3 */}
          <motion.div
            className="mb-12"
            variants={itemVariants}
          >
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <FileCheck className="w-8 h-8 text-medical-green-600 mr-3" />
                3. Finalidad del Tratamiento
              </h2>
              
              <p className="text-gray-700 leading-relaxed text-lg mb-6">
                Utilizamos la información exclusivamente para fines legítimos comerciales y operativos:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-5 border border-medical-green-200">
                  <CheckCircle className="w-6 h-6 text-medical-green-600 mb-3" />
                  <p className="text-gray-700 leading-relaxed">
                    Gestionar, procesar y facturar las solicitudes de cotización y pedidos.
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-5 border border-medical-green-200">
                  <CheckCircle className="w-6 h-6 text-medical-green-600 mb-3" />
                  <p className="text-gray-700 leading-relaxed">
                    Administrar la cobranza y la línea de crédito comercial.
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-5 border border-medical-green-200">
                  <CheckCircle className="w-6 h-6 text-medical-green-600 mb-3" />
                  <p className="text-gray-700 leading-relaxed">
                    Enviar información sobre productos, actualizaciones de precios, promociones comerciales y cambios en servicios o políticas.
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-5 border border-medical-green-200">
                  <CheckCircle className="w-6 h-6 text-medical-green-600 mb-3" />
                  <p className="text-gray-700 leading-relaxed">
                    Cumplir con obligaciones legales, regulatorias y fiscales (ej: facturación electrónica ante el SENIAT).
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-5 border border-medical-green-200 md:col-span-2">
                  <CheckCircle className="w-6 h-6 text-medical-green-600 mb-3" />
                  <p className="text-gray-700 leading-relaxed">
                    Mantener la seguridad de nuestras operaciones y prevenir fraudes.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sección 4 */}
          <motion.div
            className="mb-12"
            variants={itemVariants}
          >
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <FileCheck className="w-8 h-8 text-medical-blue-600 mr-3" />
                4. Base Legal
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                El tratamiento se basa en: (a) la relación contractual necesaria para ejecutar los pedidos; (b) el interés legítimo comercial del Proveedor; y (c) el cumplimiento de obligaciones legales.
              </p>
            </div>
          </motion.div>

          {/* Sección 5 */}
          <motion.div
            className="mb-12"
            variants={itemVariants}
          >
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className="w-8 h-8 text-medical-blue-600 mr-3" />
                5. Compartición de Datos
              </h2>
              
              <div className="space-y-6">
                <div className="bg-red-50 rounded-lg p-6 border-l-4 border-red-500">
                  <div className="flex items-start">
                    <AlertTriangle className="w-6 h-6 text-red-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        NO comercializamos, vendemos ni alquilamos datos personales.
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-medical-blue-600">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Podemos compartir datos <strong>únicamente con:</strong>
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Truck className="w-5 h-5 text-medical-blue-600 mr-2" />
                        Proveedores de Servicios Logísticos
                      </h4>
                      <p className="text-gray-700 leading-relaxed">
                        (Zoom, Tealca, Zeus y otro) exclusivamente con la información necesaria (nombre contacto, teléfono, dirección de entrega) para cumplir con la entrega del pedido.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Key className="w-5 h-5 text-medical-blue-600 mr-2" />
                        Entidades Financieras
                      </h4>
                      <p className="text-gray-700 leading-relaxed">
                        Para la gestión de pagos y cobranzas.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Shield className="w-5 h-5 text-medical-blue-600 mr-2" />
                        Autoridades Competentes
                      </h4>
                      <p className="text-gray-700 leading-relaxed">
                        Cuando sea requerido por ley (tributarias, regulatorias).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sección 6 */}
          <motion.div
            className="mb-12"
            variants={itemVariants}
          >
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <Lock className="w-8 h-8 text-medical-green-600 mr-3" />
                6. Seguridad de los Datos
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                Implementamos medidas técnicas, administrativas y físicas para proteger los datos contra acceso no autorizado, pérdida, alteración o divulgación. El acceso está restringido al personal autorizado bajo confidencialidad.
              </p>
            </div>
          </motion.div>

          {/* Sección 7 */}
          <motion.div
            className="mb-12"
            variants={itemVariants}
          >
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <CheckCircle className="w-8 h-8 text-medical-green-600 mr-3" />
                7. Derechos del Titular de los Datos
              </h2>
              
              <p className="text-gray-700 leading-relaxed text-lg mb-6">
                El representante legal de la empresa cliente o la persona física cuyos datos tratamos tiene derecho a:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-5 border border-medical-green-200">
                  <CheckCircle className="w-6 h-6 text-medical-green-600 mb-3" />
                  <p className="text-gray-700 leading-relaxed font-medium">
                    Acceder, rectificar y actualizar sus datos.
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-5 border border-medical-green-200">
                  <CheckCircle className="w-6 h-6 text-medical-green-600 mb-3" />
                  <p className="text-gray-700 leading-relaxed font-medium">
                    Solicitar la limitación del tratamiento u oponerse al envío de comunicaciones comerciales.
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-5 border border-medical-green-200">
                  <CheckCircle className="w-6 h-6 text-medical-green-600 mb-3" />
                  <p className="text-gray-700 leading-relaxed font-medium">
                    Solicitar la portabilidad o supresión de sus datos, cuando la ley lo permita.
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-5 border border-medical-green-200">
                  <CheckCircle className="w-6 h-6 text-medical-green-600 mb-3" />
                  <p className="text-gray-700 leading-relaxed font-medium">
                    Presentar una reclamación ante la autoridad de protección de datos competente.
                  </p>
                </div>
              </div>

              <div className="mt-6 bg-blue-50 rounded-lg p-6 border-l-4 border-medical-blue-600">
                <p className="text-gray-700 leading-relaxed">
                  Para ejercer estos derechos, debe enviar una solicitud formal y verificable al correo: <a href="mailto:privacidad@drozainka.com" className="text-medical-blue-600 hover:underline font-semibold">privacidad@drozainka.com</a>.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Sección 8 */}
          <motion.div
            className="mb-12"
            variants={itemVariants}
          >
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <Database className="w-8 h-8 text-medical-blue-600 mr-3" />
                8. Conservación de los Datos
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                Conservaremos los datos mientras dure la relación comercial y durante el tiempo adicional necesario para cumplir con obligaciones legales (ej: 5 años para materia fiscal contable).
              </p>
            </div>
          </motion.div>

          {/* Sección 9 */}
          <motion.div
            className="mb-12"
            variants={itemVariants}
          >
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <FileCheck className="w-8 h-8 text-medical-blue-600 mr-3" />
                9. Actualizaciones
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                Esta política podrá ser actualizada. Los cambios se publicarán en nuestra página web con la nueva fecha de vigencia.
              </p>
            </div>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            className="bg-gradient-to-r from-medical-green-600 to-medical-green-800 rounded-xl p-8 text-white text-center"
            variants={itemVariants}
          >
            <h3 className="text-2xl font-bold mb-4">¿Tienes preguntas sobre nuestra política de privacidad?</h3>
            <p className="text-white/90 mb-6">
              Estamos comprometidos con la protección de tus datos. Contáctanos si necesitas más información o ejercer tus derechos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="mailto:privacidad@drozainka.com"
                className="inline-flex items-center space-x-2 bg-white text-medical-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>Contactar Privacidad</span>
              </a>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;
