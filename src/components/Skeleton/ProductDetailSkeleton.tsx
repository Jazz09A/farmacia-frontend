import React from 'react';
import { SkeletonBase } from './SkeletonBase';

export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-medical-gray-50 pt-24 lg:pt-32">
      <div className="medical-container mb-12">
        {/* Breadcrumb skeleton */}
        <div className="mb-8 flex items-center space-x-2">
          <SkeletonBase height="1rem" width="60px" />
          <SkeletonBase height="1rem" width="8px" />
          <SkeletonBase height="1rem" width="80px" />
          <SkeletonBase height="1rem" width="8px" />
          <SkeletonBase height="1rem" width="120px" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Gallery Skeleton */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-soft p-4">
              <SkeletonBase height="24rem" rounded="xl" />
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-4">
              {[...Array(5)].map((_, index) => (
                <SkeletonBase key={index} height="4rem" rounded="xl" />
              ))}
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="space-y-6">
            {/* Title */}
            <SkeletonBase height="2.5rem" width="90%" />
            
            {/* Brand and rating */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <SkeletonBase height="1.5rem" width="100px" />
              <SkeletonBase height="1.5rem" width="150px" />
            </div>

            {/* Price */}
            <div className="bg-medical-blue-50/50 rounded-2xl p-4 sm:p-6">
              <SkeletonBase height="3rem" width="200px" className="mb-2" />
              <SkeletonBase height="1.5rem" width="120px" />
            </div>
            
            {/* Stock & Prescription */}
            <div className="flex items-center space-x-6">
              <SkeletonBase height="1.5rem" width="150px" />
              <SkeletonBase height="1.5rem" width="120px" />
            </div>

            {/* Add to Cart section */}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <SkeletonBase height="3rem" width="150px" rounded="xl" />
              <div className="flex w-full max-w-xs items-stretch gap-2 sm:w-auto">
                <SkeletonBase height="3rem" width="200px" rounded="2xl" />
                <SkeletonBase height="3rem" width="3rem" rounded="2xl" />
              </div>
            </div>

            {/* Delivery Info */}
            <div className="space-y-3 pt-4">
              <SkeletonBase height="1.25rem" width="80%" />
              <SkeletonBase height="1.25rem" width="75%" />
            </div>
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className="mt-12">
          <div className="flex border-b border-medical-gray-200 mb-6">
            {[...Array(3)].map((_, index) => (
              <SkeletonBase key={index} height="2.5rem" width="120px" className="mr-8" />
            ))}
          </div>
          <div className="space-y-4">
            <SkeletonBase height="1.25rem" width="100%" />
            <SkeletonBase height="1.25rem" width="95%" />
            <SkeletonBase height="1.25rem" width="85%" />
            <SkeletonBase height="1.25rem" width="90%" />
          </div>
        </div>

        {/* Related Products skeleton */}
        <div className="mt-12">
          <SkeletonBase height="2rem" width="250px" className="mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
                <SkeletonBase height="10rem" rounded="xl" className="mb-4" />
                <SkeletonBase height="1.25rem" width="90%" className="mb-2" />
                <SkeletonBase height="1rem" width="60%" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailSkeleton; 