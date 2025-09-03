import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Truck, Award, Users, Heart } from 'lucide-react';

export const WhyUsSection: React.FC = () => {
  const features = [
    {
      icon: Shield,
      title: 'Productos 100% Certificados',
      description: 'Garantizamos medicamentos con registro sanitario vigente y certificaciones internacionales. Tu farmacia siempre estará protegida.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      icon: Clock,
      title: 'Servicio 24/7 Garantizado',
      description: 'Emergencias farmacéuticas cubiertas las 24 horas. Nunca te quedes sin stock cuando más lo necesites.',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      icon: Truck,
      title: 'Entrega Nacional Express',
      description: 'Red logística especializada con entrega segura y controlada de temperatura en toda Venezuela.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      icon: Award,
      title: '15+ Años de Experiencia',
      description: 'Líderes en distribución farmacéutica con más de 500 farmacias satisfechas en todo el país.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      icon: Users,
      title: 'Asesoría Farmacéutica Premium',
      description: 'Equipo de farmacéuticos especializados listos para optimizar tu inventario y aumentar tus ventas.',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    {
      icon: Heart,
      title: 'Impacto Social Positivo',
      description: 'Contribuimos al bienestar comunitario llevando medicamentos de calidad a todos los rincones del país.',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200'
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="medical-container">
        {/* Section Header - Centered */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center space-x-2 bg-medical-blue-100 text-medical-blue-700 px-6 py-3 rounded-full text-sm font-semibold mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Shield className="w-5 h-5" />
            <span>¿Por qué elegirnos?</span>
          </motion.div>
          
          <motion.h2
            className="text-5xl lg:text-7xl font-serif font-bold text-gray-900 leading-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Tu socio estratégico en{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-medical-blue-600 to-medical-green-600">
              distribución farmacéutica
            </span>
          </motion.h2>
          
          <motion.p
            className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Con más de 15 años de experiencia, somos el distribuidor farmacéutico 
            más confiable de Venezuela, comprometidos con la excelencia y la 
            innovación en cada entrega.
          </motion.p>
        </motion.div>

        {/* Video and Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Video Section - Left Side */}
          <motion.div
            className="relative lg:sticky lg:top-32 lg:flex lg:items-center lg:justify-center px-4"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl w-full max-w-md mx-auto">
              {/* Video Placeholder */}
              <div className="relative w-full h-72 lg:h-80 bg-gradient-to-br from-medical-blue-600 to-medical-blue-800 flex items-center justify-center">
                {/* Play Button Overlay */}
                <motion.div
                  className="absolute inset-0 bg-black/20 flex items-center justify-center cursor-pointer group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:bg-white transition-colors duration-300">
                    <svg
                      className="w-6 h-6 text-medical-blue-600 ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </motion.div>
                
                {/* Video Thumbnail/Preview */}
                <div className="absolute inset-0 bg-gradient-to-br from-medical-blue-600/80 to-medical-blue-800/80 flex items-center justify-center">
                  <div className="text-center text-white px-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-1">Conoce Nuestra Historia</h3>
                    <p className="text-white/80 text-sm">Video corporativo - 2:30 min</p>
                  </div>
                </div>
              </div>
              
              {/* Video Info Badge */}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-gray-700">En Vivo</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content Section - Right Side */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            {/* Features Grid */}
            <div className="grid grid-cols-1 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className={`p-5 rounded-xl border-2 ${feature.bgColor} ${feature.borderColor} hover:shadow-lg transition-all duration-300 group`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -3, scale: 1.01 }}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-2.5 rounded-lg ${feature.bgColor} ${feature.borderColor} border group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                      <feature.icon className={`w-5 h-5 ${feature.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Enhanced Call to Action */}
            <motion.div
              className="pt-6 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              viewport={{ once: true }}
            >
              {/* Urgency Message */}
              <div className="bg-gradient-to-r from-medical-blue-50 to-medical-green-50 border border-medical-blue-200 rounded-xl p-4">
                <div className="text-center">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    🚀 ¡Únete a las 500+ farmacias exitosas!
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Obtén acceso inmediato a nuestro catálogo completo y comienza a 
                    aumentar tus ventas desde el primer día.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <motion.button
                  className="btn-medical-primary w-full px-6 py-3 text-base font-semibold shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  🎯 Convierte en Cliente Ahora
                </motion.button>
                <motion.button
                  className="btn-medical-secondary w-full px-6 py-3 text-base font-semibold border-2 hover:border-medical-blue-300"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  📋 Ver Catálogo Completo
                </motion.button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>✓ Registro gratuito</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>✓ Sin compromisos</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>✓ Soporte 24/7</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
