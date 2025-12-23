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
 * 
 * Optimizaciones:
 * - Lazy loading con IntersectionObserver (solo carga cuando está en viewport)
 * - Caché compartido para evitar requests duplicados
 * - Animaciones suaves de transición
 * - Skeleton placeholder mientras carga
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
  const [isInView, setIsInView] = useState(priority); // Si es priority, cargar inmediatamente
  const mountedRef = useRef(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver para lazy loading real
  useEffect(() => {
    if (priority || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        rootMargin: '100px', // Precargar 100px antes de entrar en viewport
        threshold: 0.01 
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [priority]);

  useEffect(() => {
    // No cargar si no está en viewport (y no es priority)
    if (!isInView) return;
    
    mountedRef.current = true;

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
  }, [src, priority, isInView, onLoad, onError]);

  // Determinar objectFit basado en className o usar 'contain' por defecto
  const objectFit = className.includes('object-cover') ? 'cover' : 
                   className.includes('object-contain') ? 'contain' : 'contain';

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <AnimatePresence mode="wait">
        {/* Skeleton/Placeholder mientras no está en viewport o cargando */}
        {(!isInView || isLoading) && (
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
        {isInView && !isLoading && blobUrl && !hasError && (
          <motion.img
            key="image"
            src={blobUrl}
            alt={alt}
            className={className}
            width={width}
            height={height}
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
