import { useState, useEffect, useMemo } from 'react';
import { Product } from '../types';

export const useSearch = (products: Product[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const searchSuggestions = [
    'Buscar medicamentos...',
    'Vitaminas y suplementos...',
    'Cuidado personal...',
    'Analgésicos y antiinflamatorios...',
    'Productos para el hogar...'
  ];

  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => 
        (prev + 1) % searchSuggestions.length
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    
    const term = searchTerm.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(term) ||
      product.brand.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term)
    );
  }, [searchTerm, products]);

  const updateSearchHistory = (term: string) => {
    if (term.trim() && !searchHistory.includes(term)) {
      setSearchHistory(prev => [term, ...prev.slice(0, 4)]);
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    searchHistory,
    suggestions,
    filteredProducts,
    updateSearchHistory,
    currentPlaceholder: searchSuggestions[currentPlaceholder]
  };
};