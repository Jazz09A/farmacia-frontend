import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  submessage?: string;
  variant?: 'page' | 'inline' | 'button';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6', 
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

const containerSizes = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16', 
  xl: 'w-20 h-20'
};

/**
 * Componente de Loading unificado y reutilizable
 * Reemplaza todas las implementaciones inconsistentes de loading en la app
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'lg',
  message = 'Cargando...',
  submessage,
  variant = 'page',
  className = ''
}) => {
  // Variante para páginas completas
  if (variant === 'page') {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-medical ${className}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className={`${containerSizes[size]} bg-medical-blue-gradient rounded-full flex items-center justify-center mx-auto mb-4`}>
            <Loader2 className={`${sizeClasses[size]} text-white animate-spin`} />
          </div>
          <h2 className="text-xl font-semibold text-medical-gray-800 mb-2">{message}</h2>
          {submessage && <p className="text-medical-gray-600">{submessage}</p>}
        </motion.div>
      </div>
    );
  }

  // Variante inline (para secciones dentro de páginas)
  if (variant === 'inline') {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className={`${containerSizes[size]} bg-medical-blue-gradient rounded-full flex items-center justify-center mx-auto mb-3`}>
            <Loader2 className={`${sizeClasses[size]} text-white animate-spin`} />
          </div>
          <p className="text-medical-gray-600">{message}</p>
          {submessage && <p className="text-sm text-medical-gray-500 mt-1">{submessage}</p>}
        </motion.div>
      </div>
    );
  }

  // Variante para botones
  if (variant === 'button') {
    return (
      <Loader2 className={`${sizeClasses[size]} animate-spin ${className}`} />
    );
  }

  // Fallback a inline si no se reconoce la variante
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin`} />
    </div>
  );
};

export default LoadingSpinner;
