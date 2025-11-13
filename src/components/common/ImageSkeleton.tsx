import React from 'react';
import { motion } from 'framer-motion';

interface ImageSkeletonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  aspectRatio?: 'square' | 'auto';
}

/**
 * Componente de skeleton animado para mostrar mientras cargan las imágenes
 * Incluye efecto shimmer/pulse para mejor feedback visual
 */
const ImageSkeleton: React.FC<ImageSkeletonProps> = ({
  className = '',
  size = 'md',
  aspectRatio = 'square'
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48'
  };

  // Si className ya tiene w-full o h-full, no aplicar sizeClasses
  const hasFullSize = className.includes('w-full') || className.includes('h-full');
  const finalSizeClass = hasFullSize ? '' : sizeClasses[size];
  const aspectClass = aspectRatio === 'square' && !hasFullSize ? 'aspect-square' : '';

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg ${aspectClass} ${finalSizeClass} ${className}`}>
      {/* Base background with subtle pulse */}
      <motion.div
        className="absolute inset-0 bg-gray-100"
        animate={{
          opacity: [0.7, 0.9, 0.7]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      
      {/* Shimmer effect - moving gradient */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
          width: '50%',
          height: '100%'
        }}
        animate={{
          x: ['-100%', '200%']
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
          repeatDelay: 0
        }}
      />

      {/* Decorative icon - subtle */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-1/3 h-1/3 text-gray-400"
        >
          <rect
            x="60"
            y="80"
            width="80"
            height="100"
            rx="8"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
};

export default ImageSkeleton;

