import React, { useRef, useEffect, useState, ReactNode } from 'react';

interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  once?: boolean; // Cargar solo una vez
}

/**
 * Componente que carga su contenido solo cuando es visible en el viewport
 * Usa Intersection Observer para lazy loading optimizado
 */
export const LazySection: React.FC<LazySectionProps> = ({
  children,
  fallback = null,
  threshold = 0.1,
  rootMargin = '50px',
  className = '',
  once = true
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (!hasBeenVisible) {
            setHasBeenVisible(true);
          }
          
          // Si solo debe cargar una vez, desconectar el observer
          if (once && ref.current) {
            observer.unobserve(ref.current);
          }
        } else {
          // Si no es "once", volver a ocultar cuando no sea visible
          if (!once) {
            setIsVisible(false);
          }
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, rootMargin, once, hasBeenVisible]);

  // Determinar qué mostrar
  const shouldShowContent = once ? hasBeenVisible : isVisible;

  return (
    <div ref={ref} className={className}>
      {shouldShowContent ? children : fallback}
    </div>
  );
};

export default LazySection;

