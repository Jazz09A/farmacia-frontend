import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Truck, 
  Shield,
  Mail,
  Calendar
} from 'lucide-react';

const TermsAndConditionsPage: React.FC = () => {
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
      <section className="relative py-24 bg-gradient-to-br from-medical-blue-600 to-medical-blue-800 overflow-hidden">
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
            <FileText className="w-10 h-10 text-white" />
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Términos y Condiciones Comerciales B2B
          </motion.h1>
          
          <motion.p
            className="text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            & Política de Devoluciones
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
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <Calendar className="w-4 h-4" />
              <span>Última actualización: [FECHA]</span>
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
            <div className="bg-gradient-to-r from-medical-blue-50 to-medical-blue-100 rounded-xl p-6 mb-6 border-l-4 border-medical-blue-600">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="w-8 h-8 text-medical-blue-600 mr-3" />
                SECCIÓN 1: ACEPTACIÓN Y ALCANCE
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                Los presentes Términos y Condiciones regulan exclusivamente la relación comercial B2B (Business-to-Business) entre <strong>Grupo Drozainka, CA</strong> (en adelante, "el Proveedor") y sus clientes empresariales o institucionales (en adelante, "el Cliente") en todo el territorio nacional de Venezuela. La emisión de una orden de compra confirmada o la aceptación de una factura por parte del Cliente implica la aceptación total e irrevocable de estos términos.
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
                <FileText className="w-8 h-8 text-medical-blue-600 mr-3" />
                SECCIÓN 2: PROCESO DE COMPRA ONLINE (SOLICITUD DE COTIZACIÓN)
              </h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="w-8 h-8 bg-medical-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">1</span>
                    Naturaleza de la Plataforma Web
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    La página web y el carrito de compras de Grupo Drozainka, CA tienen una función <strong>INFORMATIVA Y DE COTIZACIÓN</strong>. El proceso de compra online no constituye un sistema de compra directa (checkout) con confirmación y pago automático.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="w-8 h-8 bg-medical-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">2</span>
                    Generación de Solicitud de Cotización
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Al finalizar la selección de productos en el carrito web, el Cliente está generando una <strong>solicitud de cotización u orden de compra preliminar</strong>. Esta solicitud se envía a nuestro sistema interno de ventas para su procesamiento.
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-medical-blue-600">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="w-8 h-8 bg-medical-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">3</span>
                    Confirmación Obligatoria por Nuestro Equipo
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    <strong>NINGÚN PEDIDO SE CONSIDERA ACEPTADO, CONFIRMADO NI OBLIGATORIO PARA GRUPO DROZAINKA</strong> hasta que un representante de ventas de nuestra oficina se comunique formalmente con el Cliente (vía teléfono o correo electrónico oficial) para:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Verificar ítems, cantidades y precios unitarios.</li>
                    <li>Confirmar la disponibilidad exacta de inventario.</li>
                    <li>Acordar y establecer las condiciones de pago y plazo de entrega definitivos.</li>
                    <li>Emitir y enviar una <strong>Orden de Compra o Factura Proforma confirmada por escrito</strong>, que constituirá el documento contractual vinculante.</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="w-8 h-8 bg-medical-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">4</span>
                    Responsabilidad del Cliente en la Solicitud
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Es responsabilidad del Cliente proveer información de contacto comercial precisa y válida. Cualquier error en la solicitud online (selección de producto, cantidad, presentación) podrá ser corregido durante esta etapa de verificación sin consecuencia alguna.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="w-8 h-8 bg-medical-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">5</span>
                    Precios y Disponibilidad Web
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Los precios, promociones y estados de inventario mostrados en la web son informativos y están sujetos a cambios sin previo aviso. <strong>El precio, descuento y disponibilidad vinculantes serán únicamente los especificados en la cotización oficial confirmada por nuestro equipo.</strong>
                  </p>
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
                <CheckCircle className="w-8 h-8 text-medical-green-600 mr-3" />
                SECCIÓN 3: PEDIDOS, PRECIOS Y PAGOS
              </h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="w-8 h-8 bg-medical-green-600 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">1</span>
                    Formalización del Pedido
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Los pedidos son vinculantes únicamente tras la <strong>confirmación escrita (Orden de Compra o Factura Proforma)</strong> emitida por Grupo Drozainka, CA como resultado exitoso del proceso descrito en la Sección 2.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="w-8 h-8 bg-medical-green-600 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">2</span>
                    Precios Vinculantes
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Los precios aplicables serán exclusivamente los especificados en la <strong>cotización o factura proforma confirmada</strong> enviada por el Proveedor. Grupo Drozainka, CA se reserva el derecho de modificar sus precios, notificando al Cliente con al menos <strong>5 (cinco) días hábiles</strong> de antelación para pedidos futuros.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="w-8 h-8 bg-medical-green-600 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">3</span>
                    Condiciones de Pago
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Las condiciones (crédito, contado) se establecen por escrito en la cotización confirmada, según el perfil crediticio aprobado del Cliente. El incumplimiento en los plazos de pago faculta a Grupo Drozainka, CA a: (a) suspender todo despacho futuro pendiente, (b) exigir el pago al contado para futuras transacciones o (c) inactivar al mismo de forma definitiva.
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
                <Truck className="w-8 h-8 text-medical-blue-600 mr-3" />
                SECCIÓN 4: DESPACHO, ENTREGA Y RECEPCIÓN
              </h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                    <Clock className="w-6 h-6 text-medical-blue-600 mr-3" />
                    Plazo de Despacho
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    El Proveedor se compromete a despachar la mercancía en un máximo de <strong>72 horas hábiles</strong> posteriores a la confirmación del pedido y a la acreditación/comprobación del pago acordado o según sea el acuerdo crediticio.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                    <Truck className="w-6 h-6 text-medical-blue-600 mr-3" />
                    Medios de Despacho
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Flota Propia:</h4>
                      <p className="text-gray-700 leading-relaxed">
                        Despacho directo con vehículos de Grupo Drozainka, CA. <strong>Disponible todos los días de la semana, incluyendo sábados y domingos</strong> si la operación lo requiere.
                      </p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
                      <h4 className="font-semibold text-gray-900 mb-2">Transportistas Aliados (Zoom, Tealca, Zeus u otro):</h4>
                      <p className="text-gray-700 leading-relaxed">
                        Despacho sujeto a las políticas, rutas y horarios del transportista contratado. <strong>NOTA CRÍTICA:</strong> Estos operadores de logística externos realizan entregas generalmente solo de <strong>lunes a viernes y/o sábado dentro de horario comercial</strong>. Los retrasos o inconvenientes atribuibles al transportista serán gestionados por nosotros ante el mismo, pero <strong>no constituyen responsabilidad directa de Grupo Drozainka, CA</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-medical-blue-600">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                    <AlertCircle className="w-6 h-6 text-medical-blue-600 mr-3" />
                    Recepción y Reclamación Inmediata
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    El Cliente o su receptor autorizado debe verificar la mercancía en el acto de la entrega. Cualquier discrepancia en <strong>cantidad, tipo de producto o daño físico evidente</strong> debe ser notificada por escrito (correo electrónico) <strong>el día hábil inmediato siguiente a la recepción</strong>, adjuntando fotos claras de la guía y el producto. Transcurrido este plazo sin observaciones, se considerará recibido en total conformidad.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sección 5 */}
          <motion.div
            className="mb-12"
            variants={itemVariants}
          >
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="w-8 h-8 text-medical-green-600 mr-3" />
                SECCIÓN 5: POLÍTICA DE DEVOLUCIONES Y RECLAMOS
              </h2>
              
              <div className="space-y-6">
                <div className="bg-green-50 rounded-lg p-6 border-l-4 border-medical-green-600">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <CheckCircle className="w-6 h-6 text-medical-green-600 mr-3" />
                    5.1 Motivos Aceptados para Devolución o Reclamo
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">1. Producto Defectuoso:</h4>
                      <p className="text-gray-700 leading-relaxed">
                        Que presente fallas de fabricación o daño no causado durante el transporte o manipulación posterior a la entrega.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">2. Vida Útil Insuficiente:</h4>
                      <p className="text-gray-700 leading-relaxed">
                        Producto que al momento de la entrega tenga <strong>menos de 1 (un) año de vida útil restante</strong>. Para productos perecederos o de corta vida, se notificará de manera excepcional y previa.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">3. Error en el Despacho:</h4>
                      <p className="text-gray-700 leading-relaxed">
                        Que se haya entregado un producto o presentación diferente al especificado en la <strong>orden de compra confirmada</strong> (error de SKU, volumen, etc.).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-6 border-l-4 border-red-500">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
                    5.2 Motivos NO Aceptados para Devolución
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Arrepentimiento, sobrestock o cambio en las necesidades del Cliente.</li>
                    <li>Productos con empaque original abierto, alterado, dañado o contaminado por el Cliente.</li>
                    <li>Productos de especial manejo (refrigerados, termolábiles) cuyo defecto no sea atribuible al Proveedor y se deba a una ruptura de la cadena de custodia.</li>
                    <li>Reclamos notificados fuera del plazo establecido en la Sección 4.3.</li>
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-medical-blue-600">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-6 h-6 text-medical-blue-600 mr-3" />
                    5.3 Procedimiento para Devoluciones
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <span className="w-6 h-6 bg-medical-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold">1</span>
                        Notificación Formal
                      </h4>
                      <p className="text-gray-700 leading-relaxed">
                        El Cliente debe reportar el incidente enviando un correo a <a href="mailto:atencionalcliente@drozainka.com" className="text-medical-blue-600 hover:underline font-semibold">atencionalcliente@drozainka.com</a> dentro del plazo, con: Número de Pedido/Factura, fotos y descripción detallada.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <span className="w-6 h-6 bg-medical-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold">2</span>
                        Evaluación
                      </h4>
                      <p className="text-gray-700 leading-relaxed">
                        Nuestro equipo comercial evaluará la solicitud en un máximo de <strong>3-5 días hábiles</strong>.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <span className="w-6 h-6 bg-medical-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold">3</span>
                        Autorización
                      </h4>
                      <p className="text-gray-700 leading-relaxed">
                        De ser aprobada o no, el equipo comercial le notificará al cliente.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <span className="w-6 h-6 bg-medical-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold">4</span>
                        Logística
                      </h4>
                      <p className="text-gray-700 leading-relaxed">
                        La recolección será coordinada y costeada por el proveedor logístico si el error es atribuible a nosotros. En caso contrario, el costo del retorno correrá por cuenta del Cliente.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <span className="w-6 h-6 bg-medical-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold">5</span>
                        Solución Final
                      </h4>
                      <p className="text-gray-700 leading-relaxed mb-2">
                        Una vez recibido y verificado el producto en nuestras instalaciones, dentro de los <strong>5 días hábiles siguientes</strong> se procederá con:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                        <li><strong>Reemplazo</strong> por el mismo producto en perfecto estado, o</li>
                        <li>Emisión de una <strong>Nota de Crédito</strong> por el valor neto del producto, aplicable a futuras compras.</li>
                      </ul>
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
                <FileText className="w-8 h-8 text-medical-blue-600 mr-3" />
                SECCIÓN 6: DISPOSICIONES GENERALES
              </h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="w-8 h-8 bg-medical-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">1</span>
                    Confidencialidad
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Las partes se comprometen a tratar la información comercial, precios y condiciones aquí derivadas como estrictamente confidenciales.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="w-8 h-8 bg-medical-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">2</span>
                    Fuerza Mayor
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Grupo Drozainka, CA no será responsable por retrasos o incumplimientos causados por eventos de fuerza mayor (huelgas, cortes de luz, inestabilidad social, restricciones gubernamentales, etc.).
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="w-8 h-8 bg-medical-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">3</span>
                    Jurisdicción
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Estos términos se rigen por las leyes de la República Bolivariana de Venezuela. Para cualquier controversia, las partes se someterán a los tribunales competentes de la <strong>ciudad de Caracas</strong>, renunciando expresamente a cualquier otro fuero.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="w-8 h-8 bg-medical-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">4</span>
                    Modificaciones
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Grupo Drozainka, CA se reserva el derecho de modificar estos Términos y Condiciones. Los cambios serán notificados a los clientes activos y publicados en esta sección de nuestra página web.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            className="bg-gradient-to-r from-medical-blue-600 to-medical-blue-800 rounded-xl p-8 text-white text-center"
            variants={itemVariants}
          >
            <h3 className="text-2xl font-bold mb-4">¿Tienes preguntas sobre nuestros términos?</h3>
            <p className="text-white/90 mb-6">
              Nuestro equipo está disponible para aclarar cualquier duda sobre nuestras políticas comerciales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="mailto:atencionalcliente@drozainka.com"
                className="inline-flex items-center space-x-2 bg-white text-medical-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>Contactar Soporte</span>
              </a>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default TermsAndConditionsPage;
