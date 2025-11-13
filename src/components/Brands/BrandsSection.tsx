import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import './BrandsSection.css';

const brands = [
  {
    id: 1,
    name: 'By Naturlifes',
    logo: '/brands/LOGO BY NATURLIFES.jpg'
  },
  {
    id: 2,
    name: 'Dulcilina',
    logo: '/brands/Logo Dulcilina.jpg'
  },
  {
    id: 3,
    name: 'Fitosana',
    logo: '/brands/Logo fitosana nueva imagen_page-0001 (1).jpg'
  },
  {
    id: 4,
    name: 'Grupo Fonti',
    logo: '/brands/Logo Grupo Fonti.png'
  },
  {
    id: 5,
    name: 'Nuvitt',
    logo: '/brands/Logo nuvitt.jpg'
  },
  {
    id: 6,
    name: 'NS',
    logo: '/brands/NS-Logo-Nuevo-Slogan.png'
  }
]

interface BrandLogoProps {
  brand: typeof brands[0];
}

const BrandLogo: React.FC<BrandLogoProps> = memo(({ brand }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  if (imageError) {
    return (
      <motion.div
        className="flex-shrink-0 w-40 h-20 flex items-center justify-center bg-gray-100 rounded-lg mx-4"
        whileHover={{ 
          scale: 1.1,
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <span className="text-sm text-gray-500 text-center px-2">{brand.name}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex-shrink-0 w-40 h-20 flex items-center justify-center bg-white rounded-lg mx-4 hover:grayscale transition-all duration-300 cursor-pointer"
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
        loading="lazy"
        onError={handleImageError}
      />
    </motion.div>
  );
});

BrandLogo.displayName = 'BrandLogo';

// Constante para logs solo en desarrollo
const isDev = import.meta.env.DEV;

export const BrandsSection: React.FC = () => {
  // Crear 3 copias para un loop perfecto sin saltos
  // [1,2,3,4,5,6, 1,2,3,4,5,6, 1,2,3,4,5,6]
  // Cuando llegamos al final de la primera copia, saltamos instantáneamente al inicio de la segunda
  // Como son idénticas, el salto es invisible
  const infiniteBrands = useMemo(() => [...brands, ...brands, ...brands], []);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [carouselWidth, setCarouselWidth] = useState(0);

  // Calcular el ancho exacto de una copia de marcas después de que se rendericen
  const calculateWidth = useCallback(() => {
    if (carouselRef.current) {
      const allElements = Array.from(carouselRef.current.children);
      const firstGroupElements = allElements.slice(0, brands.length);
      
      if (firstGroupElements.length === brands.length) {
        // Obtener el primer y último elemento del primer grupo
        const firstElement = firstGroupElements[0] as HTMLElement;
        const lastElement = firstGroupElements[firstGroupElements.length - 1] as HTMLElement;
        
        const firstRect = firstElement.getBoundingClientRect();
        const lastRect = lastElement.getBoundingClientRect();
        
        // Calcular el ancho desde el inicio del primer elemento hasta el final del último
        const width = lastRect.right - firstRect.left;
        
        setCarouselWidth(prevWidth => {
          // Solo actualizar si el ancho cambió significativamente (más de 1px)
          return Math.abs(prevWidth - width) > 1 ? width : prevWidth;
        });
      }
    }
  }, []);

  useEffect(() => {

    // Calcular después de que se rendericen los elementos - múltiples intentos
    const attemptCalculate = (attempt = 1) => {
      if (attempt > 10) {
        return;
      }
      
      setTimeout(() => {
        if (carouselRef.current) {
          const allElements = Array.from(carouselRef.current.children);
          if (allElements.length >= brands.length) {
            calculateWidth();
          } else {
            attemptCalculate(attempt + 1);
          }
        }
      }, 100 * attempt);
    };
    
    attemptCalculate();
    
    // Throttle resize para mejor performance
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(calculateWidth, 150);
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Recalcular cuando las imágenes se carguen
    const imageLoadHandler = () => {
      setTimeout(calculateWidth, 50);
    };
    
    const imageTimeout = setTimeout(() => {
      const images = carouselRef.current?.querySelectorAll('img');
      if (images && images.length > 0) {
        images.forEach((img) => {
          if (img.complete) {
            imageLoadHandler();
          } else {
            img.addEventListener('load', imageLoadHandler, { once: true });
            img.addEventListener('error', imageLoadHandler, { once: true });
          }
        });
      } else {
        // Si no hay imágenes, recalcular de todos modos
        setTimeout(calculateWidth, 100);
      }
    }, 500);
    
    return () => {
      clearTimeout(imageTimeout);
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [calculateWidth]);

  // Controlar el loop infinito sin saltos visibles usando requestAnimationFrame
  useEffect(() => {
    if (carouselWidth > 0 && carouselRef.current) {
      let isAnimating = true;
      let startTime: number | null = null;
      let currentX = 0;
      const duration = 30000; // 30 segundos en milisegundos
      let animationFrameId: number | null = null;
      const element = carouselRef.current;
      
      const animate = (timestamp: number) => {
        if (!isAnimating || !element) return;
        
        if (startTime === null) {
          startTime = timestamp;
        }
        
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1); // Limitar a 1
        
        // Calcular la nueva posición X
        currentX = -carouselWidth * progress;
        
        // Si hemos completado una copia, resetear instantáneamente
        if (currentX <= -carouselWidth) {
          currentX = 0;
          startTime = timestamp; // Reiniciar el tiempo
        }
        
        // Usar transform3d para GPU acceleration
        element.style.transform = `translate3d(${currentX}px, 0, 0)`;
        
        animationFrameId = requestAnimationFrame(animate);
      };
      
      // Iniciar la animación
      animationFrameId = requestAnimationFrame(animate);
      
      return () => {
        isAnimating = false;
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }
  }, [carouselWidth]);

  return (
    <section className="py-16 bg-white">
      {/* Header dentro del contenedor limitado */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <motion.div
          className="text-center"
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
      </div>

      {/* Brands Carousel Infinito - Ancho completo */}
      <div className="relative w-full py-4 overflow-hidden">
        <div
          ref={carouselRef}
          className="flex items-center"
          style={{ 
            display: 'flex',
            width: 'fit-content',
            willChange: 'transform', // Optimización para animaciones
            backfaceVisibility: 'hidden', // Mejora el rendimiento de transformaciones
            perspective: 1000 // Activa GPU acceleration
          }}
        >
          {infiniteBrands.map((brand, index) => (
            <BrandLogo key={`${brand.id}-${index}`} brand={brand} />
          ))}
        </div>
      </div>
    </section>
  );
};