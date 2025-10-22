import React from 'react';
import { motion } from 'framer-motion';

const brands = [
  {
    id: 1,
    name: 'By Naturlifes',
    logo: 'src/public/brands/LOGO BY NATURLIFES.jpg'
  },
  {
    id: 2,
    name: 'Dulcilina',
    logo: 'src/public/brands/Logo Dulcilina.jpg'
  },
  {
    id: 3,
    name: 'Fitosana',
    logo: 'src/public/brands/Logo fitosana nueva imagen_page-0001 (1).jpg'
  },
  {
    id: 4,
    name: 'Grupo Fonti',
    logo: 'src/public/brands/Logo Grupo Fonti.png'
  },
  {
    id: 5,
    name: 'Nuvitt',
    logo: 'src/public/brands/Logo nuvitt.jpg'
  },
  {
    id: 6,
    name: 'NS',
    logo: 'src/public/brands/NS-Logo-Nuevo-Slogan.png'
  }
]
export const BrandsSection: React.FC = () => {
  // Duplicate brands for infinite scroll effect
  const duplicatedBrands = [...brands, ...brands];

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
                className="flex-shrink-0 w-32 h-16 flex items-center justify-center bg-gray-100 rounded-lg hover:grayscale transition-all duration-300 cursor-pointer"
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


      </div>
    </section>
  );
};