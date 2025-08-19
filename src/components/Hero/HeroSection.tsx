import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Shield, Clock, Truck, Stethoscope, Heart, Phone } from 'lucide-react';
import { BenefitCard } from './BenefitCard';

export const HeroSection: React.FC = () => {
  const benefits = [
    { 
      icon: Shield, 
      text: 'Productos Farmacéuticos Certificados',
      description: 'Medicamentos con registro sanitario garantizado'
    },
    { 
      icon: Clock, 
      text: 'Distribución Confiable 24/7',
      description: 'Suministro constante para tu farmacia'
    },
    { 
      icon: Truck, 
      text: 'Logística Especializada',
      description: 'Entrega segura en toda Venezuela'
    }
  ];

  const scrollToProducts = () => {
    // Buscar la sección de productos por su ID o clase
    const productsSection = document.querySelector('[data-section="products"]') || 
                          document.querySelector('.products-section') ||
                          document.querySelector('[id*="products"]') ||
                          // Fallback: scroll después del hero hacia las ofertas/productos
                          document.querySelector('main');
    
    if (productsSection) {
      // Calcular offset para navbar fijo
      const navbarHeight = window.innerWidth >= 1024 ? 80 : 64;
      const bannerHeight = 40;
      const offset = navbarHeight + bannerHeight + 20; // +20px de padding extra
      
      const elementPosition = productsSection.getBoundingClientRect().top + window.pageYOffset;
      
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    } else {
      // Fallback: scroll a la altura de la ventana
      const navbarHeight = window.innerWidth >= 1024 ? 80 : 64;
      const bannerHeight = 40;
      const totalNavHeight = navbarHeight + bannerHeight;
      
      window.scrollTo({
        top: window.innerHeight - totalNavHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative">
      {/* Hero Container con padding para navbar y banner promocional */}
      <div className="min-h-screen flex items-center justify-center overflow-hidden pt-40 sm:pt-36 lg:pt-32">
        {/* High Quality Medical Background */}
        <div className="absolute inset-0">
          {/* Imagen médica profesional de alta calidad */}
          <img
            src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"
            alt="Farmacéutico profesional en consulta médica moderna"
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
          
          {/* Medical Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-medical-blue-900/80 via-medical-blue-800/60 to-medical-green-800/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-medical-blue-900/30 to-transparent" />
          
          {/* Floating Medical Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto py-20">
          {/* Medical Badge */}
          <motion.div
            className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Stethoscope className="h-5 w-5 text-medical-blue-200" />
            <span className="text-sm font-medium text-medical-blue-100">
              Distribuidor Certificado • Líder en Suministros Farmacéuticos
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-serif font-bold mb-6 leading-tight">
              Tu Farmacia,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-medical-blue-200 via-white to-medical-green-200">
                Nuestro Compromiso
              </span>
            </h1>
            
            <motion.p
              className="text-xl sm:text-2xl lg:text-3xl mb-8 text-medical-blue-100 max-w-4xl mx-auto leading-relaxed font-light"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Distribuimos medicamentos certificados con la máxima calidad y confiabilidad para tu farmacia.
              <br />
              <span className="text-lg sm:text-xl text-white/80 font-normal">
                El socio estratégico que tu farmacia necesita.
              </span>
            </motion.p>

            {/* Enhanced Benefits */}
            <div className="mb-12 max-w-5xl mx-auto px-4">
              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start justify-items-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                {benefits.map((benefit, index) => (
                  <div key={index} className="w-full max-w-sm">
                    <BenefitCard
                      icon={benefit.icon}
                      title={benefit.text}
                      description={benefit.description}
                      index={index}
                    />
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Trust Indicators */}
            <motion.div
              className="flex flex-wrap items-center justify-center gap-8 mb-8 opacity-80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 1, delay: 1.2 }}
            >
              {[
                "🏥 +500 Farmacias Asociadas",
                "⭐ 4.9/5 Confiabilidad",
                "🚀 Distribución Nacional",
                "🔒 Crédito Empresarial"
              ].map((indicator, index) => (
                <motion.div
                  key={index}
                  className="text-sm text-white/80 font-medium"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                >
                  {indicator}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
        {/* Enhanced Scroll Indicator - Centered */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex justify-center">
          <motion.button
            onClick={scrollToProducts}
            className="text-white/90 hover:text-white transition-all duration-300 group cursor-pointer"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex flex-col items-center space-y-3">
              <div className="glass-medical rounded-2xl p-3 border border-white/30 group-hover:glass-card group-hover:text-medical-gray-700 transition-all duration-300">
                <ChevronDown className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium hidden sm:block">Ver Catálogo</span>
            </div>
          </motion.button>
        </div>

        {/* Background Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
      </div>
    </div>
  );
};