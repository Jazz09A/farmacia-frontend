// 🎣 Hook para manejar productos y búsqueda
import { useState, useEffect, useCallback } from 'react';
import { Product, ProductsApiResponse } from '../types';
import { productService, ProductSearchParams } from '../services/ProductService';

interface UseProductsOptions extends ProductSearchParams {
  autoFetch?: boolean;
}

export const useProducts = (options: UseProductsOptions = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false,
  });

  const { autoFetch = true, ...searchParams } = options;

  const fetchProducts = useCallback(async (params: ProductSearchParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response: ProductsApiResponse = await productService.searchProducts({
        ...searchParams,
        ...params,
      });

      setProducts(response.products);
      setPagination(response.pagination || {
        page: params.page || 1,
        limit: params.limit || 20,
        total: response.total || 0,
        total_pages: Math.ceil((response.total || 0) / (params.limit || 20)),
        has_next: false,
        has_prev: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  const searchProducts = useCallback(async (query: string, params: ProductSearchParams = {}) => {
    await fetchProducts({ ...params, search: query });
  }, [fetchProducts]);

  const nextPage = useCallback(() => {
    if (pagination.has_next) {
      fetchProducts({ page: pagination.page + 1 });
    }
  }, [pagination, fetchProducts]);

  const prevPage = useCallback(() => {
    if (pagination.has_prev) {
      fetchProducts({ page: pagination.page - 1 });
    }
  }, [pagination, fetchProducts]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= pagination.total_pages) {
      fetchProducts({ page });
    }
  }, [pagination.total_pages, fetchProducts]);

  const refresh = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (autoFetch) {
      fetchProducts();
    }
  }, []); // Solo en el montaje inicial

  return {
    products,
    loading,
    error,
    pagination,
    fetchProducts,
    searchProducts,
    nextPage,
    prevPage,
    goToPage,
    refresh,
  };
};

export default useProducts;

