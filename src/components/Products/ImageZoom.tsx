import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
}

const ImageZoom: React.FC<ImageZoomProps> = ({ src, alt, className = '' }) => {
  const [isZooming, setIsZooming] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [portalPosition, setPortalPosition] = useState({ top: 0, left: 0, height: 0 });
  const imageRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Precargar la imagen
    const img = new Image();
    img.src = src;
    img.onload = () => setImageLoaded(true);
  }, [src]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    
    // Calcular posición relativa dentro de la imagen (0-100%)
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPosition({ x, y });
    
    // Actualizar posición del portal para que siga a la imagen
    setPortalPosition({
      top: rect.top + window.scrollY - 40,
      left: rect.right + 63, // 10px de margen para estar más cerca (como en el dibujo)
      height: rect.height
    });
  };

  const handleMouseEnter = () => {
    if (imageLoaded && imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      setPortalPosition({
        top: rect.top + window.scrollY - 40,
        left: rect.right + 80,
        height: rect.height
      });
      setIsZooming(true);
    }
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
  };

  return (
    <div className="relative">
      {/* Imagen principal con hover */}
      <div
        ref={imageRef}
        className={`relative overflow-hidden cursor-crosshair ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain"
          draggable={false}
        />
        
        {/* Overlay de lente cuando está haciendo zoom */}
        {isZooming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute pointer-events-none border-2 border-gray-400 bg-white bg-opacity-30"
            style={{
              width: '150px',
              height: '150px',
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}
      </div>

      {/* Ventana de zoom usando Portal para escapar de overflow:hidden */}
      {createPortal(
        <AnimatePresence mode="wait">
          {isZooming && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="fixed bg-white shadow-2xl border-2 border-blue-500 rounded-xl z-[9999] overflow-hidden"
              style={{
                top: portalPosition.top - window.scrollY, // Ajustar para fixed position
                left: portalPosition.left,
                width: '650px', // Más largo horizontalmente
                height: '500px', // Altura proporcional
                pointerEvents: 'none',
              }}
            >
              {/* Imagen ampliada */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${src})`,
                  backgroundSize: '250%', // Zoom 2.5x
                  backgroundPosition: `${position.x}% ${position.y}%`,
                  backgroundRepeat: 'no-repeat',
                }}
              />
              
              {/* Indicador de zoom */}
              <div className="absolute top-3 left-3 bg-black bg-opacity-70 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                  </svg>
                  Zoom 2.5x
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default ImageZoom;
