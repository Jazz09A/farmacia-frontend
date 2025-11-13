import React from 'react';
import { ProductCardSkeleton } from '../Skeleton';

interface RecommendedProductsSkeletonProps {
  count?: number;
}

export const RecommendedProductsSkeleton: React.FC<RecommendedProductsSkeletonProps> = ({ 
  count = 6 
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default RecommendedProductsSkeleton;

