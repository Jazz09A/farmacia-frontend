import React from 'react';
import { SkeletonBase } from './SkeletonBase';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="group relative bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl p-6 flex flex-col">
      {/* Image skeleton */}
      <div className="relative overflow-hidden rounded-xl mb-4">
        <SkeletonBase height="12rem" rounded="xl" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-3 flex flex-col flex-grow">
        {/* Title and brand */}
        <div>
          <SkeletonBase height="1.25rem" className="mb-2" />
          <SkeletonBase height="1rem" width="60%" />
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <SkeletonBase height="1rem" width="80px" />
          <SkeletonBase height="1rem" width="40px" />
        </div>

        {/* Spacer */}
        <div className="flex-grow"></div>
        
        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <SkeletonBase height="1.5rem" width="80px" />
            <SkeletonBase height="1rem" width="60px" />
          </div>
        </div>
      </div>

      {/* Button skeleton */}
      <div className="mt-4">
        <SkeletonBase height="2.5rem" rounded="xl" />
      </div>
    </div>
  );
};

export default ProductCardSkeleton; 