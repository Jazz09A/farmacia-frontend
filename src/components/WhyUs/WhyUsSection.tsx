import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Award, MapPin } from 'lucide-react';

export const WhyUsSection: React.FC = () => {
  const features = [
    {
      icon: Award,
      title: 'Expertos en nutracéuticos en Venezuela',
      description: 'Más de 15 años de experiencia especializada en la distribución de nutracéuticos y productos farmacéuticos de alta calidad.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      hoverGlow: 'hover:shadow-blue-100',
      gradientColor: 'from-blue-500 to-blue-600',
      stat: '15+ años',
    },
    {
      icon: MapPin,
      title: 'Atención a todos los estados del país',
      description: 'Cobertura nacional con logística especializada que garantiza entregas puntuales en cualquier rincón de Venezuela.',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      hoverGlow: 'hover:shadow-emerald-100',
      gradientColor: 'from-emerald-500 to-emerald-600',
      stat: '24 estados',
    },
    {
      icon: Clock,
      title: 'Despachos en tiempo récord',
      description: 'Sistema de distribución optimizado que permite entregas en 24-48 horas en las principales ciudades del país.',
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-200',
      hoverGlow: 'hover:shadow-violet-100',
      gradientColor: 'from-violet-500 to-violet-600',
      stat: '24-48 hrs',
    },
    // {
    //   icon: Truck,
    //   title: 'Distribución farmacéutica certificada',
    //   description: 'Cadena de frío y protocolos BPA (Buenas Prácticas de Almacenamiento) garantizan la integridad de cada producto.',
    //   color: 'text-amber-600',
    //   bgColor: 'bg-amber-50',
    //   borderColor: 'border-amber-200',
    //   hoverGlow: 'hover:shadow-amber-100',
    //   stat: 'BPA cert.',
    // },
    // {
    //   icon: Users,
    //   title: 'Red de más de 1.200 farmacias aliadas',
    //   description: 'Somos el proveedor de confianza de miles de farmacias en Venezuela con una relación comercial sólida y duradera.',
    //   color: 'text-rose-600',
    //   bgColor: 'bg-rose-50',
    //   borderColor: 'border-rose-200',
    //   hoverGlow: 'hover:shadow-rose-100',
    //   stat: '1.200+',
    // },
    // {
    //   icon: CheckCircle,
    //   title: 'Garantía de calidad en cada producto',
    //   description: 'Todos nuestros productos cuentan con registro sanitario y pasan rigurosos controles de calidad antes de su despacho.',
    //   color: 'text-cyan-600',
    //   bgColor: 'bg-cyan-50',
    //   borderColor: 'border-cyan-200',
    //   hoverGlow: 'hover:shadow-cyan-100',
    //   stat: '100% cert.',
    // },
  ];

  const trustIndicators = [
    { label: 'Registro gratuito' },
    { label: 'Sin compromisos' },
    { label: 'Soporte 24/7' },
    { label: 'Entregas garantizadas' },
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
            className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6"
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

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={`group relative p-7 rounded-2xl border-2 bg-white ${feature.borderColor} ${feature.hoverGlow} hover:shadow-xl transition-all duration-300 overflow-hidden`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -6, scale: 1.02 }}
            >
              {/* Subtle background fill on hover */}
              <div className={`absolute inset-0 ${feature.bgColor} opacity-0 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none`} />

              {/* Stat badge */}
              <div className={`absolute top-5 right-5 text-xs font-bold px-2.5 py-1 rounded-full ${feature.bgColor} ${feature.color} border ${feature.borderColor}`}>
                {feature.stat}
              </div>

              <div className="relative z-10 text-center">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${feature.gradientColor} text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                {/* Text */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-base leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Bottom accent line */}
              <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 rounded-b-2xl bg-gradient-to-r from-medical-blue-400 to-medical-green-400`} />
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators Bar */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          viewport={{ once: true }}
        >
          {trustIndicators.map((item, i) => (
            <div key={i} className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-medical-green-500 rounded-full flex-shrink-0" />
              <span className="font-medium">✓ {item.label}</span>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};
