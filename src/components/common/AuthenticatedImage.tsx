import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductPlaceholder from './ProductPlaceholder';
import ImageSkeleton from './ImageSkeleton';

interface AuthenticatedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Componente para cargar imágenes que requieren autenticación
 * Convierte la URL a blob URL usando fetch con token
 */
export const AuthenticatedImage: React.FC<AuthenticatedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  size = 'md',
  onLoad,
  onError
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (!src) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    // Si la URL no es de la API de imágenes, usar directamente
    if (!src.includes('/api/v1/images/')) {
      setBlobUrl(src);
      setIsLoading(false);
      return;
    }

    // Cargar imagen con autenticación
    const loadAuthenticatedImage = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        // Obtener token del almacenamiento (intentar ambos nombres posibles)
        const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token');
        
        if (!token) {
          throw new Error('No hay token de autenticación');
        }

        // Construir URL completa si es relativa
        const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
        const imageUrl = src.startsWith('http') ? src : `${baseUrl}${src}`;

        // Hacer fetch de la imagen con el token
        const response = await fetch(imageUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Error al cargar imagen: ${response.status}`);
        }

        // Convertir respuesta a blob
        const blob = await response.blob();
        
        // Crear URL local del blob
        const url = URL.createObjectURL(blob);
        
        if (mountedRef.current) {
          setBlobUrl(url);
          setIsLoading(false);
          onLoad?.();
        }
      } catch (error) {
        console.error('Error cargando imagen:', error);
        if (mountedRef.current) {
          setHasError(true);
          setIsLoading(false);
          onError?.();
        }
      }
    };

    loadAuthenticatedImage();

    // Cleanup: revocar URL cuando el componente se desmonte
    return () => {
      mountedRef.current = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [src, onLoad, onError]);

  // Determinar objectFit basado en className o usar 'contain' por defecto
  const objectFit = className.includes('object-cover') ? 'cover' : 
                    className.includes('object-contain') ? 'contain' : 'contain';

  // Extraer clases de tamaño para el skeleton
  const skeletonClassName = className.includes('w-full') ? 'w-full' : 
                           className.includes('h-full') ? 'h-full' : '';

  return (
    <div className="relative w-full h-full">
      <AnimatePresence mode="wait">
        {/* Skeleton mientras carga */}
        {isLoading && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <ImageSkeleton 
              size={size} 
              className="w-full h-full"
              aspectRatio="square"
            />
          </motion.div>
        )}

        {/* Imagen cargada */}
        {!isLoading && blobUrl && !hasError && (
          <motion.img
            key="image"
            src={blobUrl}
            alt={alt}
            className={className}
            width={width}
            height={height}
            loading="lazy"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.4,
              ease: 'easeOut'
            }}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: objectFit as 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
            }}
            onLoad={() => {
              onLoad?.();
            }}
            onError={() => {
              setHasError(true);
              onError?.();
            }}
          />
        )}

        {/* Placeholder si hay error */}
        {hasError && !isLoading && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <ProductPlaceholder size={size} className={className} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthenticatedImage;

