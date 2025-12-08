import React from 'react';
import { HeroCarousel } from './HeroCarousel';
import { heroCarouselImages } from '../../data/heroCarouselData';
import { useNavbarHeight } from '../../hooks/useNavbarHeight';

export const HeroSection: React.FC = () => {
  const navbarHeight = useNavbarHeight();

  return (
    <div className="relative w-full">
      {/* Contenedor principal con altura completa de pantalla */}
      {/* La imagen debe comenzar justo debajo del navbar para verse completa */}
      <div className="min-h-screen flex items-center justify-center overflow-hidden relative">
        {/* Contenedor de imagen que comienza desde donde termina el navbar */}
        {/* Así la imagen se muestra completa sin ser tapada por el navbar */}
        <div 
          className="absolute left-0 right-0 w-full"
          style={{
            top: navbarHeight > 0 ? `${navbarHeight}px` : '0px',
            height: navbarHeight > 0 ? `calc(100vh - ${navbarHeight}px)` : '100vh',
            zIndex: 0
          }}
        >
          <HeroCarousel
            images={heroCarouselImages}
            autoPlayInterval={6000}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};