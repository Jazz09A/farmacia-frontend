import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductPlaceholder from './ProductPlaceholder';
import ImageSkeleton from './ImageSkeleton';
import { authenticatedImageCache } from '../../utils/authenticatedImageCache';

interface AuthenticatedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Componente para cargar imágenes que requieren autenticación
 * Usa un sistema de caché compartido para evitar múltiples fetches
 */
export const AuthenticatedImage: React.FC<AuthenticatedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  size = 'md',
  priority = false,
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

    // Cargar imagen usando el caché
    const loadAuthenticatedImage = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        // Usar el caché compartido
        const url = await authenticatedImageCache.getImage(src, priority);
        
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

    // Cleanup: liberar referencia cuando el componente se desmonte
    return () => {
      mountedRef.current = false;
      if (src.includes('/api/v1/images/')) {
        authenticatedImageCache.releaseImage(src);
      }
    };
  }, [src, priority, onLoad, onError]);

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
            loading={priority ? "eager" : "lazy"}
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

