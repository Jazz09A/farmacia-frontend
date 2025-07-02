import React from 'react';
import { SkeletonBase } from './SkeletonBase';

export const HeroSkeleton: React.FC = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background skeleton */}
      <SkeletonBase 
        className="absolute inset-0" 
        height="100vh" 
        animate={false} 
      />
      
      {/* Content skeleton */}
      <div className="relative z-10 medical-container text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Main title skeleton */}
          <div className="space-y-4">
            <SkeletonBase height="3.5rem" width="80%" className="mx-auto" />
            <SkeletonBase height="3rem" width="60%" className="mx-auto" />
          </div>
          
          {/* Subtitle skeleton */}
          <div className="space-y-2">
            <SkeletonBase height="1.5rem" width="70%" className="mx-auto" />
            <SkeletonBase height="1.5rem" width="50%" className="mx-auto" />
          </div>
          
          {/* CTA buttons skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <SkeletonBase height="3.5rem" width="200px" rounded="2xl" />
            <SkeletonBase height="3.5rem" width="200px" rounded="2xl" />
          </div>
        </div>
        
        {/* Benefits cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <SkeletonBase height="3rem" width="3rem" rounded="full" className="mx-auto mb-4" />
              <SkeletonBase height="1.5rem" width="80%" className="mx-auto mb-2" />
              <SkeletonBase height="1rem" width="90%" className="mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSkeleton; 