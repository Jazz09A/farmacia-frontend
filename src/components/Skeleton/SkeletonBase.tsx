import React from 'react';

interface SkeletonBaseProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  animate?: boolean;
}

export const SkeletonBase: React.FC<SkeletonBaseProps> = ({
  className = '',
  width = '100%',
  height = '1rem',
  rounded = 'md',
  animate = true
}) => {
  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full'
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height
  };

  return (
    <div
      className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 ${roundedClasses[rounded]} ${
        animate ? 'animate-pulse' : ''
      } ${className}`}
      style={style}
    />
  );
};

export default SkeletonBase; 