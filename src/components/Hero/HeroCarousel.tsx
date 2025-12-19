import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CarouselImage {
  id: string;
  src: string; // Fallback image
  srcMobile?: string; // Mobile image (opcional)
  srcDesktop?: string; // Desktop image (opcional)
  alt: string;
  title?: string;
  description?: string;
}

interface HeroCarouselProps {
  images: CarouselImage[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  autoPlay = true,
  autoPlayInterval = 5000,
  className = '',
  images,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Preload all carousel images for instant transitions
  useEffect(() => {
    images.forEach((image) => {
      // Preload mobile image if available
      if (image.srcMobile) {
        const imgMobile = new Image();
        imgMobile.src = image.srcMobile;
      }
      // Preload desktop image if available
      if (image.srcDesktop) {
        const imgDesktop = new Image();
        imgDesktop.src = image.srcDesktop;
      }
      // Preload fallback image
      const img = new Image();
      img.src = image.src;
    });
  }, [images]);

  // Auto-play functionality
  useEffect(() => {
    if (isHovered || !autoPlay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isHovered, autoPlayInterval, images.length, autoPlay]);

  // Navigation functions
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  if (!images.length) return null;

  return (
    <div 
      className={`hero-carousel relative w-full h-full overflow-hidden group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Image Container */}
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {/* Responsive Image using picture element for production optimization */}
            {/* object-cover para que la imagen llene todo el espacio sin espacios vacíos */}
            <picture className="absolute inset-0 w-full h-full">
              {/* Desktop image - shown on screens 768px and wider */}
              {images[currentIndex].srcDesktop && (
                <source
                  media="(min-width: 768px)"
                  srcSet={images[currentIndex].srcDesktop}
                />
              )}
              {/* Mobile image - shown on screens smaller than 768px */}
              {images[currentIndex].srcMobile && (
                <source
                  media="(max-width: 767px)"
                  srcSet={images[currentIndex].srcMobile}
                />
              )}
              {/* Fallback image */}
              <img
                src={images[currentIndex].src}
                alt={images[currentIndex].alt}
                className="w-full h-full object-cover object-center"
                loading="eager"
                fetchpriority={currentIndex === 0 ? "high" : "auto"}
                decoding="async"
              />
            </picture>
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Image Info Overlay */}
        {(images[currentIndex].title || images[currentIndex].description) && (
          <motion.div
            className="absolute bottom-8 left-4 right-4 sm:left-8 sm:right-8 text-white z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {images[currentIndex].title && (
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
                {images[currentIndex].title}
              </h3>
            )}
            {images[currentIndex].description && (
              <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl">
                {images[currentIndex].description}
              </p>
            )}
          </motion.div>
        )}
      </div>

      {/* Navigation Arrows - Only show if more than one image */}
      {images.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-300 opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </button>

          {/* Next Button */}
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-300 opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Imagen siguiente"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </button>
        </>
      )}

      {/* Progress Bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-white/30 z-50"
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: autoPlayInterval / 1000, ease: "linear" }}
        key={currentIndex}
      />
    </div>
  );
};