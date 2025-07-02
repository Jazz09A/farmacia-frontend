import React from 'react';
import { SkeletonBase } from './SkeletonBase';

interface SectionSkeletonProps {
  showTitle?: boolean;
  itemsCount?: number;
  itemsPerRow?: number;
  className?: string;
}

export const SectionSkeleton: React.FC<SectionSkeletonProps> = ({
  showTitle = true,
  itemsCount = 8,
  itemsPerRow = 4,
  className = ''
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-6'
  };

  return (
    <div className={`py-12 ${className}`}>
      {showTitle && (
        <div className="text-center mb-8">
          <SkeletonBase height="2.5rem" width="300px" className="mx-auto mb-4" />
          <SkeletonBase height="1.25rem" width="500px" className="mx-auto" />
        </div>
      )}
      
      <div className={`grid ${gridCols[itemsPerRow as keyof typeof gridCols] || gridCols[4]} gap-6`}>
        {[...Array(itemsCount)].map((_, index) => (
          <div key={index} className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
            <SkeletonBase height="12rem" rounded="xl" className="mb-4" />
            <SkeletonBase height="1.25rem" width="90%" className="mb-2" />
            <SkeletonBase height="1rem" width="60%" className="mb-3" />
            <SkeletonBase height="1rem" width="80%" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionSkeleton; 