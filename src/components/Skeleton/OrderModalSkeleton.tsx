// 💀 Skeleton para OrderModal mientras cargan los detalles
import React from 'react';
import { XCircle } from 'lucide-react';

interface OrderModalSkeletonProps {
  onClose: () => void;
}

export const OrderModalSkeleton: React.FC<OrderModalSkeletonProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg max-w-md md:max-w-4xl w-full max-h-[95vh] overflow-y-auto animate-pulse">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-300 rounded w-48"></div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Customer Info & Status Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="h-6 bg-gray-300 rounded w-48"></div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-40"></div>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-32"></div>
                </div>
                <div className="flex items-start">
                  <div className="w-4 h-4 bg-gray-300 rounded mr-2 mt-0.5"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-300 rounded w-56"></div>
                    <div className="h-4 bg-gray-300 rounded w-48"></div>
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-6 bg-gray-300 rounded w-36"></div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                </div>
                <div>
                  <div className="h-4 bg-gray-300 rounded w-32 mb-1"></div>
                  <div className="h-10 bg-gray-300 rounded w-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items Skeleton */}
          <div>
            <div className="h-6 bg-gray-300 rounded w-24 mb-4"></div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-md"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-48"></div>
                    <div className="h-3 bg-gray-300 rounded w-32"></div>
                    <div className="h-3 bg-gray-300 rounded w-24"></div>
                  </div>
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary Skeleton */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="h-6 bg-gray-300 rounded w-40 mb-3"></div>
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                </div>
              ))}
              <div className="border-t border-gray-200 my-2"></div>
              <div className="flex justify-between">
                <div className="h-5 bg-gray-300 rounded w-12"></div>
                <div className="h-5 bg-gray-300 rounded w-20"></div>
              </div>
              <div className="h-4 bg-gray-300 rounded w-48 mt-2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderModalSkeleton;

