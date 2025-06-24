import React from 'react';
import { motion } from 'framer-motion';
import { mockBrands } from '../../data/mockData';

export const BrandsSection: React.FC = () => {
  // Duplicate brands for infinite scroll effect
  const duplicatedBrands = [...mockBrands, ...mockBrands];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Marcas de Confianza
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Trabajamos con las mejores marcas farmacéuticas del mundo
          </p>
        </motion.div>

        {/* Brands Carousel */}
        <div className="relative overflow-hidden">
          <motion.div
            className="flex space-x-8"
            animate={{ x: ['0%', '-50%'] }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear'
            }}
            style={{ width: '200%' }}
          >
            {duplicatedBrands.map((brand, index) => (
              <motion.div
                key={`${brand.id}-${index}`}
                className="flex-shrink-0 w-32 h-16 flex items-center justify-center bg-gray-100 rounded-lg grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer"
                whileHover={{ 
                  scale: 1.1,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="max-w-full max-h-full object-contain"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Trust Indicators */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          {[
            { number: '500+', label: 'Productos Certificados' },
            { number: '50+', label: 'Marcas Asociadas' },
            { number: '10k+', label: 'Clientes Satisfechos' },
            { number: '24/7', label: 'Atención Médica' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              viewport={{ once: true }}
            >
              <motion.div
                className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 500, 
                  damping: 15,
                  delay: 0.2 + (0.1 * index)
                }}
                viewport={{ once: true }}
              >
                {stat.number}
              </motion.div>
              <p className="text-gray-600 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};