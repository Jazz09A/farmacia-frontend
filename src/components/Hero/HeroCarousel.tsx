import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface CarouselImage {
  id: string;
  src: string;
  alt: string;
  title?: string;
  description?: string;
}

interface HeroCarouselProps {
  images: CarouselImage[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  showThumbnails?: boolean;
  className?: string;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  images,
  autoPlay = true,
  autoPlayInterval = 5000,
  showControls = true,
  showIndicators = true,
  showThumbnails = false,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, isHovered, autoPlayInterval, images.length]);

  // Navigation functions
  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  }, [images.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        goToPrevious();
      } else if (event.key === 'ArrowRight') {
        goToNext();
      } else if (event.key === ' ') {
        event.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious, togglePlayPause]);

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
            <img
              src={images[currentIndex].src}
              alt={images[currentIndex].alt}
              className="w-full h-full object-cover object-center"
              loading="eager"
            />
            
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

      {/* Navigation Controls */}
      {showControls && images.length > 1 && (
        <>
          {/* Previous Button */}
          <motion.button
            className="carousel-control absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/20 rounded-full p-2 sm:p-3 text-white group/btn"
            onClick={goToPrevious}
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 group-hover/btn:text-medical-blue-200 transition-colors" />
          </motion.button>

          {/* Next Button */}
          <motion.button
            className="carousel-control absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/20 rounded-full p-2 sm:p-3 text-white group/btn"
            onClick={goToNext}
            whileHover={{ scale: 1.1, x: 2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 group-hover/btn:text-medical-blue-200 transition-colors" />
          </motion.button>
        </>
      )}

      {/* Play/Pause Button */}
      {autoPlay && (
        <motion.button
          className="absolute top-2 right-2 sm:top-4 sm:right-4 z-50 bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/20 rounded-full p-2 sm:p-3 text-white transition-all duration-300 group/btn"
          onClick={togglePlayPause}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 sm:h-5 sm:w-5 group-hover/btn:text-medical-blue-200 transition-colors" />
          ) : (
            <Play className="h-4 w-4 sm:h-5 sm:w-5 group-hover/btn:text-medical-blue-200 transition-colors" />
          )}
        </motion.button>
      )}

      {/* Indicators */}
      {showIndicators && images.length > 1 && (
        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ 
            transform: 'translateX(-50%)',
            left: '50%'
          }}
        >
          {images.map((_, index) => (
            <button
              key={index}
              className={`carousel-indicator w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${
                index === currentIndex
                  ? 'bg-white scale-125 active'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </motion.div>
      )}

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <motion.div
          className="absolute bottom-16 left-1/2 -translate-x-1/2 flex space-x-2 z-50 max-w-full overflow-x-auto pb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {images.map((image, index) => (
            <button
              key={image.id}
              className={`relative w-16 h-12 rounded-lg overflow-hidden transition-all duration-300 ${
                index === currentIndex
                  ? 'ring-2 ring-white scale-110'
                  : 'opacity-70 hover:opacity-100'
              }`}
              onClick={() => goToSlide(index)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </motion.div>
      )}

      {/* Progress Bar */}
      {autoPlay && isPlaying && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-white/30 z-50"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: autoPlayInterval / 1000, ease: "linear" }}
          key={currentIndex}
        />
      )}
    </div>
  );
};
