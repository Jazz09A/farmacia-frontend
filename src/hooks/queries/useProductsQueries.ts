import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import productService, { ProductSearchParams } from '../../services/ProductService';
import type { Product, ProductsApiResponse } from '../../types';
import { queryKeys } from './queryKeys';

export const useProductsQuery = (filters: ProductSearchParams) => {
  return useQuery<ProductsApiResponse>({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => productService.searchProducts(filters),
    staleTime: 30 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });
};

export const useProductQuery = (id: string, enabled: boolean = true) => {
  return useQuery<Product>({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productService.getProductById(id),
    enabled,
    staleTime: 30 * 60 * 1000,
  });
};

export const useProductBySlugQuery = (slug: string, enabled: boolean = true) => {
  return useQuery<Product>({
    queryKey: queryKeys.products.slug(slug),
    queryFn: () => productService.getProductBySlug(slug),
    enabled,
    staleTime: 30 * 60 * 1000,
  });
};

export const useFeaturedProductsQuery = (limit: number = 10) => {
  return useQuery<Product[]>({
    queryKey: [...queryKeys.products.featured(), { limit }],
    queryFn: () => productService.getFeaturedProducts(limit),
    staleTime: 30 * 60 * 1000,
    retry: false, // No reintentar si falla
    refetchOnWindowFocus: false,
    onError: (error) => {
      // Error ya manejado en el servicio, solo loguear si es necesario
      if (error instanceof Error && !error.message.includes('No authentication token')) {
        console.error('Unexpected error fetching featured products:', error);
      }
    },
  });
};

export const useOfferProductsQuery = (limit: number = 20) => {
  return useQuery<Product[]>({
    queryKey: [...queryKeys.products.offers(), { limit }],
    queryFn: () => productService.getOfferProducts(limit),
    staleTime: 10 * 60 * 1000,
    retry: false, // No reintentar si falla
    refetchOnWindowFocus: false,
    onError: (error) => {
      // Error ya manejado en el servicio, solo loguear si es necesario
      if (error instanceof Error && !error.message.includes('No authentication token')) {
        console.error('Unexpected error fetching offer products:', error);
      }
    },
  });
};

export const useSearchSuggestionsQuery = (q: string, limit: number = 10) => {
  return useQuery({
    queryKey: queryKeys.products.suggestions(q),
    queryFn: () => productService.getSearchSuggestions(q, limit),
    enabled: q.length >= 2,
    staleTime: 15 * 60 * 1000,
  });
};

export const useUpdateProductMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) => productService.updateProduct(id, data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: queryKeys.products.all });
      qc.setQueryData(queryKeys.products.detail(updated.id), updated);
    },
  });
};

export const useDeleteProductImageMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, imageUrl }: { id: string; imageUrl: string }) => productService.deleteProductImage(id, imageUrl),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: queryKeys.products.all });
      qc.setQueryData(queryKeys.products.detail(updated.id), updated);
    },
  });
};

export const useRelatedProductsQuery = (product: Product | null, limit: number = 6) => {
  return useQuery<Product[]>({
    queryKey: [...queryKeys.products.lists(), 'related', product?.id ?? 'none', { limit }],
    queryFn: () => product ? productService.getRelatedProducts(product, limit) : Promise.resolve([]),
    enabled: !!product,
    staleTime: 30 * 60 * 1000,
  });
};

export const useProductRecommendations = (productId: string, enabled: boolean = true) => {
  return useQuery<{
    related_articles: Product[];
    frequently_bought_together: Product[];
    you_may_also_like: Product[];
  }>({
    queryKey: queryKeys.products.recommendations(productId),
    queryFn: () => productService.getProductRecommendations(productId),
    enabled: enabled && !!productId,
    staleTime: 30 * 60 * 1000, // Cache por 30 minutos
    gcTime: 60 * 60 * 1000, // Mantener en cache por 1 hora
    refetchOnWindowFocus: false,
  });
};


