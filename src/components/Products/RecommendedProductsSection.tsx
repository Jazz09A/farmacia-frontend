import React from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { RecommendedProductsSkeleton } from './RecommendedProductsSkeleton';

interface RecommendedProductsSectionProps {
  relatedArticles: Product[];
  frequentlyBoughtTogether: Product[];
  isLoading: boolean;
}

export const RecommendedProductsSection: React.FC<RecommendedProductsSectionProps> = ({
  relatedArticles,
  frequentlyBoughtTogether,
  isLoading,
}) => {
  // Si está cargando y no hay datos, mostrar skeletons
  if (isLoading && relatedArticles.length === 0 && frequentlyBoughtTogether.length === 0) {
    return (
      <>
        <div className="py-12">
          <div className="h-8 w-64 bg-gray-200 rounded-lg mb-6 animate-pulse" />
          <RecommendedProductsSkeleton count={6} />
        </div>
        <div className="py-12">
          <div className="h-8 w-64 bg-gray-200 rounded-lg mb-6 animate-pulse" />
          <RecommendedProductsSkeleton count={6} />
        </div>
      </>
    );
  }

  return (
    <>
      {/* Artículos Relacionados */}
      {(isLoading || relatedArticles.length > 0) && (
        <div className="py-12">
          <h2 className="text-2xl font-bold text-medical-gray-800 mb-6">
            Artículos Relacionados
          </h2>
          {isLoading && relatedArticles.length === 0 ? (
            <RecommendedProductsSkeleton count={6} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {relatedArticles.map((product) => (
                <ProductCard key={product.id} product={product} className="text-sm" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Comprados Juntos Frecuentemente */}
      {(isLoading || frequentlyBoughtTogether.length > 0) && (
        <div className="py-12">
          <h2 className="text-2xl font-bold text-medical-gray-800 mb-6">
            Comprados Juntos Frecuentemente
          </h2>
          {isLoading && frequentlyBoughtTogether.length === 0 ? (
            <RecommendedProductsSkeleton count={6} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {frequentlyBoughtTogether.map((product) => (
                <ProductCard key={product.id} product={product} className="text-sm" />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default RecommendedProductsSection;

