import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Product } from '../types';
import productService from '../services/ProductService';
import {
  addToQuoteCart,
  clearQuoteCart,
  loadQuoteCart,
  QuoteCartItem,
  QUOTE_CART_STORAGE_KEY,
  removeFromQuoteCart,
  updateQuoteCartQuantity,
} from '../utils/quoteCartStorage';

interface QuoteCartOptions {
  hydrateProducts?: boolean;
}

export interface QuoteCartDetailedItem extends QuoteCartItem {
  product: Product | null;
}

interface UseQuoteCartResult {
  items: QuoteCartItem[];
  detailedItems: QuoteCartDetailedItem[];
  loadingProducts: boolean;
  totalQuantity: number;
  uniqueItems: number;
  addItem: (co_art: string, cantidad?: number) => void;
  updateItem: (co_art: string, cantidad: number) => void;
  removeItem: (co_art: string) => void;
  clearItems: () => void;
  refreshItems: () => void;
}

export function useQuoteCart(options: QuoteCartOptions = {}): UseQuoteCartResult {
  const { hydrateProducts = false } = options;
  const [items, setItems] = useState<QuoteCartItem[]>(() => loadQuoteCart());
  const [productMap, setProductMap] = useState<Record<string, Product | null>>({});
  const [loadingProducts, setLoadingProducts] = useState(false);

  const refreshItems = useCallback(() => {
    setItems(loadQuoteCart());
  }, []);

  useEffect(() => {
    refreshItems();
  }, [refreshItems]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === QUOTE_CART_STORAGE_KEY) {
        refreshItems();
      }
    };

    // Listener para cambios en otras pestañas
    window.addEventListener('storage', handleStorageChange);
    
    // Listener personalizado para cambios en la misma pestaña
    const handleCustomStorageChange = () => {
      refreshItems();
    };
    
    // Escuchar eventos personalizados de cambio de carrito
    window.addEventListener('quoteCartUpdated', handleCustomStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('quoteCartUpdated', handleCustomStorageChange);
    };
  }, [refreshItems]);

  useEffect(() => {
    if (!hydrateProducts) {
      return;
    }

    if (items.length === 0) {
      setProductMap({});
      setLoadingProducts(false);
      return;
    }

    let cancelled = false;
    setLoadingProducts(true);

    const fetchProducts = async () => {
      const entries = await Promise.all(
        items.map(async (item) => {
          try {
            const product = await productService.getProductById(item.co_art);
            return [item.co_art, product] as const;
          } catch (error) {
            console.error('Failed to fetch product for quote cart item', item.co_art, error);
            return [item.co_art, null] as const;
          }
        })
      );

      if (!cancelled) {
        setProductMap(Object.fromEntries(entries));
        setLoadingProducts(false);
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [items, hydrateProducts]);

  const addItem = useCallback((co_art: string, cantidad: number = 1) => {
    const updated = addToQuoteCart(co_art, cantidad);
    setItems(updated);
  }, []);

  const updateItem = useCallback((co_art: string, cantidad: number) => {
    const updated = updateQuoteCartQuantity(co_art, cantidad);
    setItems(updated);
  }, []);

  const removeItem = useCallback((co_art: string) => {
    const updated = removeFromQuoteCart(co_art);
    setItems(updated);
  }, []);

  const clearItems = useCallback(() => {
    clearQuoteCart();
    setItems([]);
  }, []);

  const detailedItems = useMemo<QuoteCartDetailedItem[]>(() => {
    if (!hydrateProducts) {
      return items.map((item) => ({
        ...item,
        product: null,
      }));
    }

    return items.map((item) => ({
      ...item,
      product: productMap[item.co_art] ?? null,
    }));
  }, [items, productMap, hydrateProducts]);

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.cantidad, 0),
    [items]
  );

  return {
    items,
    detailedItems,
    loadingProducts,
    totalQuantity,
    uniqueItems: items.length,
    addItem,
    updateItem,
    removeItem,
    clearItems,
    refreshItems,
  };
}


