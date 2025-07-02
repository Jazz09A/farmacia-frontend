import React from 'react';
import { SkeletonBase } from './SkeletonBase';

export const BlogPostSkeleton: React.FC = () => {
  return (
    <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Image skeleton */}
      <SkeletonBase height="12rem" animate={false} />
      
      {/* Content */}
      <div className="p-6">
        {/* Category and date */}
        <div className="flex items-center justify-between mb-3">
          <SkeletonBase height="1rem" width="80px" rounded="full" />
          <SkeletonBase height="1rem" width="100px" />
        </div>
        
        {/* Title */}
        <SkeletonBase height="1.5rem" width="90%" className="mb-3" />
        
        {/* Description */}
        <div className="space-y-2 mb-4">
          <SkeletonBase height="1rem" width="100%" />
          <SkeletonBase height="1rem" width="80%" />
        </div>
        
        {/* Author and read more */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SkeletonBase height="2rem" width="2rem" rounded="full" />
            <SkeletonBase height="1rem" width="100px" />
          </div>
          <SkeletonBase height="1rem" width="80px" />
        </div>
      </div>
    </div>
  );
};

export default BlogPostSkeleton; 