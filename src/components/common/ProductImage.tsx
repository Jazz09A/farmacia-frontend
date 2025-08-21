import React from 'react';
import ProductPlaceholder from './ProductPlaceholder';

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallbackClassName?: string;
}

/**
 * Componente que muestra una imagen de producto con fallback automático al placeholder
 * cuando no hay imagen disponible o falla la carga.
 */
const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = '',
  size = 'md',
  fallbackClassName
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  // Reset error state when src changes
  React.useEffect(() => {
    if (src) {
      setImageError(false);
      setImageLoaded(false);
    }
  }, [src]);

  // Si no hay src o hubo error al cargar, mostrar placeholder
  if (!src || imageError) {
    return (
      <ProductPlaceholder 
        size={size} 
        className={fallbackClassName || className} 
      />
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Placeholder mientras carga */}
      {!imageLoaded && (
        <div className="absolute inset-0">
          <ProductPlaceholder 
            size={size} 
            className="w-full h-full" 
          />
        </div>
      )}
      
      {/* Imagen real */}
      <img
        src={src}
        alt={alt}
        className={`${className} ${!imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        loading="lazy"
      />
    </div>
  );
};

export default ProductImage;
