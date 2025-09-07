import React from 'react';
import { motion } from 'framer-motion';
import { Stethoscope } from 'lucide-react';
import { HeroCarousel } from './HeroCarousel';
import { heroCarouselImages } from '../../data/heroCarouselData';

export const HeroSection: React.FC = () => {

  return (
    <div className="relative">
      {/* Hero Container con padding para navbar y banner promocional */}
      <div className="min-h-screen flex items-center justify-center overflow-hidden pt-40 sm:pt-36 lg:pt-32">
        {/* Image Carousel Background */}
        <div className="absolute inset-0">
          <HeroCarousel
            images={heroCarouselImages}
            autoPlay={true}
            autoPlayInterval={6000}
            showControls={true}
            showIndicators={true}
            showThumbnails={false}
            className="w-full h-full"
          />
          
          {/* Subtle overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
          
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
        <div className="relative z-5 text-center text-white px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto py-20 pointer-events-none">
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



          </motion.div>
        </div>

        {/* Background Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
      </div>
    </div>
  );
};