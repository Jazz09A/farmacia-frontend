import React, { useMemo } from 'react';
import ProductPlaceholder from './ProductPlaceholder';
import OptimizedImage from './OptimizedImage';
import AuthenticatedImage from './AuthenticatedImage';

interface ProductImageProps {
  src?: string;
  images?: string[];
  alt: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallbackClassName?: string;
  priority?: boolean;
}

/**
 * Componente que muestra una imagen de producto con fallback automático al placeholder
 * cuando no hay imagen disponible o falla la carga.
 * 
 * Optimizaciones:
 * - Lazy loading con Intersection Observer
 * - Progressive loading (LQIP)
 * - Transformaciones automáticas de Cloudinary
 * - Responsive images con srcset
 * 
 * Lógica interna: Si hay 2 o más imágenes, muestra la segunda imagen.
 */
const ProductImage: React.FC<ProductImageProps> = ({
  src,
  images = [],
  alt,
  className = '',
  size = 'md',
  fallbackClassName,
  priority = false
}) => {
  // Lógica interna: determinar qué imagen mostrar
  const imageToShow = useMemo(() => {
    // Si hay 2 o más imágenes, usar la segunda imagen (índice 1)
    if (images && images.length >= 2) {
      return images[1];
    }
    // Si hay solo 1 imagen o no hay array de imágenes, usar la imagen principal
    return src || (images && images.length > 0 ? images[0] : null);
  }, [src, images]);

  // Mapear tamaños a dimensiones
  const dimensions = useMemo(() => {
    const sizeMap = {
      sm: { width: 200, height: 200 },
      md: { width: 400, height: 400 },
      lg: { width: 600, height: 600 },
      xl: { width: 800, height: 800 }
    };
    return sizeMap[size];
  }, [size]);

  // Si no hay imagen, mostrar placeholder
  if (!imageToShow) {
    return (
      <ProductPlaceholder 
        size={size} 
        className={fallbackClassName || className} 
      />
    );
  }

  // Si la imagen es de la API de artículos (requiere autenticación), usar AuthenticatedImage
  // Detectar tanto URLs relativas como absolutas
  const isArticleImage = imageToShow && (
    imageToShow.includes('/api/v1/images/') || 
    imageToShow.startsWith('/api/v1/images/')
  );
  
  if (isArticleImage) {
    return (
      <AuthenticatedImage
        src={imageToShow}
        alt={alt}
        className={className}
        width={dimensions.width}
        height={dimensions.height}
        size={size}
        onError={() => {
          // Fallback a placeholder si falla
        }}
      />
    );
  }

  return (
    <OptimizedImage
      src={imageToShow}
      alt={alt}
      className={className}
      width={dimensions.width}
      height={dimensions.height}
      priority={priority}
      placeholder="blur"
      sizes={`(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${dimensions.width}px`}
      fallback={
        <ProductPlaceholder 
          size={size} 
          className={fallbackClassName || className} 
        />
      }
    />
  );
};

export default ProductImage;
