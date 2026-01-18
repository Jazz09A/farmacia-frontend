import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import {
  getOptimizedCloudinaryUrl,
  getLowQualityUrl,
  getHighQualityUrl,
  generateSrcSet,
  isCloudinaryUrl,
  getBlurDataUrl
} from '../../utils/imageOptimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean; // Si es true, carga inmediatamente sin lazy loading
  placeholder?: 'blur' | 'empty';
  onLoad?: () => void;
  onError?: () => void;
  fallback?: React.ReactNode;
}

/**
 * Componente de imagen optimizada con:
 * - Lazy loading
 * - Progressive loading (LQIP - Low Quality Image Placeholder)
 * - Transformaciones de Cloudinary automáticas
 * - Soporte para srcset responsive
 * - Animaciones suaves
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  sizes,
  priority = false,
  placeholder = 'blur',
  onLoad,
  onError,
  fallback
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);

  // Usar intersection observer solo si no es prioritario
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.01,
    freezeOnceVisible: true,
    rootMargin: '50px' // Precargar 50px antes de ser visible
  });

  // Determinar si debe cargar la imagen
  const shouldLoad = priority || isIntersecting;

  // URLs optimizadas
  const isCloudinary = isCloudinaryUrl(src);
  const lqipUrl = isCloudinary ? getLowQualityUrl(src, 50) : src;
  const highQualityUrl = isCloudinary
    ? getHighQualityUrl(src, width, height)
    : src;
  const srcSet = isCloudinary ? generateSrcSet(src) : undefined;
  const blurDataUrl = getBlurDataUrl();

  // Cargar imagen progresivamente
  useEffect(() => {
    if (!shouldLoad) return;

    let mounted = true;

    const loadImage = async () => {
      try {
        // Fase 1: Cargar imagen de baja calidad primero (solo para Cloudinary)
        if (isCloudinary && placeholder === 'blur') {
          try {
            const lqipImg = new Image();
            lqipImg.src = lqipUrl;
            await new Promise((resolve, reject) => {
              lqipImg.onload = resolve;
              lqipImg.onerror = reject;
              // Timeout de 3 segundos para LQIP
              setTimeout(() => reject(new Error('LQIP timeout')), 3000);
            });

            if (mounted) {
              setCurrentSrc(lqipUrl);
            }
          } catch (lqipError) {
            // Si falla LQIP, continuar con alta calidad
            console.warn('LQIP failed, loading high quality directly');
          }
        }

        // Fase 2: Cargar imagen de alta calidad
        const highQualityImg = new Image();
        
        // Para Cloudinary, intentar sin transformaciones si hay error
        let urlToTry = highQualityUrl;
        
        // Si es Cloudinary y tiene transformaciones, intentar primero con ellas
        if (isCloudinary) {
          highQualityImg.src = urlToTry;
        } else {
          // Para URLs no-Cloudinary, usar directamente
          highQualityImg.src = src;
          urlToTry = src;
        }

        if (srcSet && isCloudinary) {
          highQualityImg.srcset = srcSet;
        }

        if (sizes) {
          highQualityImg.sizes = sizes;
        }

        await new Promise((resolve, reject) => {
          highQualityImg.onload = resolve;
          highQualityImg.onerror = () => {
            // Si falla con transformaciones, intentar URL original
            if (isCloudinary && urlToTry !== src) {
              highQualityImg.src = src;
              highQualityImg.onload = resolve;
              highQualityImg.onerror = reject;
            } else {
              reject(new Error('Image load failed'));
            }
          };
          // Timeout de 10 segundos
          setTimeout(() => reject(new Error('Load timeout')), 10000);
        });

        if (mounted) {
          setCurrentSrc(isCloudinary ? urlToTry : src);
          setIsLoaded(true);
          onLoad?.();
        }
      } catch (error) {
        // Silenciar error en consola para evitar spam
        if (mounted) {
          setHasError(true);
          onError?.();
        }
      }
    };

    loadImage();

    return () => {
      mounted = false;
    };
  }, [shouldLoad, src, lqipUrl, highQualityUrl, srcSet, sizes, isCloudinary, placeholder, onLoad, onError]);

  // Si hay error y existe fallback
  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  // Si hay error sin fallback
  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <svg
            className="w-12 h-12 text-gray-400 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-xs text-gray-500">Imagen no disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        {/* Placeholder mientras no debe cargar o está cargando */}
        {(!shouldLoad || !currentSrc) && (
          <motion.div
            key="placeholder"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300"
            style={{
              backgroundImage: placeholder === 'blur' ? `url(${blurDataUrl})` : undefined,
              backgroundSize: 'cover'
            }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </motion.div>
        )}

        {/* Imagen de baja calidad (blur) */}
        {shouldLoad && currentSrc === lqipUrl && !isLoaded && (
          <motion.img
            key="lqip"
            src={lqipUrl}
            alt={alt}
            className={`${className} blur-sm scale-110`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {/* Imagen de alta calidad */}
        {shouldLoad && isLoaded && (
          <motion.img
            key="highquality"
            ref={imgRef}
            src={currentSrc}
            srcSet={srcSet}
            sizes={sizes}
            alt={alt}
            className={className}
            width={width}
            height={height}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            loading={priority ? 'eager' : 'lazy'}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default OptimizedImage;

