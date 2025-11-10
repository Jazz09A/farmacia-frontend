import React from 'react';
import { HeroCarousel } from './HeroCarousel';
import { heroCarouselImages } from '../../data/heroCarouselData';

export const HeroSection: React.FC = () => {
  return (
    <div className="relative">
      <div className="min-h-screen flex items-center justify-center overflow-hidden pt-40 sm:pt-36 lg:pt-32">
        <div className="absolute inset-0">
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