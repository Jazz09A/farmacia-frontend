import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, TrendingUp, Package, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { productService } from '../../services/ProductService';
import { Product } from '../../types';
import ProductImage from '../common/ProductImage';

interface SearchBarProps {
  isScrolled: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ isScrolled }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();

  // Búsquedas recientes del localStorage
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('recentSearches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const trendingSearches = [
    'Acetaminofén',
    'Vitaminas',
    'Ibuprofeno',
    'Protector solar'
  ];

  // Buscar productos cuando cambia el query
  useEffect(() => {
    const searchProducts = async () => {
      if (!query || query.trim().length < 2) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await productService.searchProducts({
          search: query.trim(),
          limit: 8, // Limitar a 8 resultados para el dropdown
        });
        setProducts(response.products);
      } catch (error) {
        console.error('Error searching products:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // Estado activo cuando está en hover, focus o abierto
  const isActive = isHovered || isFocused || isOpen;

  // Función para obtener los colores según el estado
  const getSearchColors = () => {
    if (isActive) {
      // Cuando está activo (hover, focus, abierto), siempre es blanco con texto oscuro
      return {
        icon: 'text-blue-600',
        text: 'text-gray-900',
        placeholder: 'placeholder-gray-500',
        background: 'bg-white',
        clearButton: 'text-gray-400 hover:text-gray-600'
      };
    } else {
      // Cuando NO está activo, depende del scroll
      if (isScrolled) {
        // Con scroll: colores oscuros porque el navbar es blanco
        return {
          icon: 'text-medical-blue-900',
          text: 'text-gray-900',
          placeholder: 'placeholder-gray-500',
          background: 'bg-white/90',
          clearButton: 'text-gray-400 hover:text-gray-600'
        };
      } else {
        // Sin scroll: colores blancos porque el navbar es transparente
        return {
          icon: 'text-medical-blue-900',
          text: 'text-gray-900',
          placeholder: 'placeholder-gray-500',
          background: 'bg-white/90',
          clearButton: 'text-gray-400 hover:text-gray-600'
        };
      }
    }
  };

  const colors = getSearchColors();

  // Manejar clicks fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejar navegación por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const maxIndex = products.length - 1;
        setActiveIndex(prev => prev < maxIndex ? prev + 1 : prev);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && products[activeIndex]) {
          handleProductClick(products[activeIndex]);
        } else if (query.trim()) {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setIsFocused(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      addToRecentSearches(query);
      navigate(`/catalog?search=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleProductClick = (product: Product) => {
    addToRecentSearches(query);
    navigate(`/product/${product.slug || product.id}`);
    setIsOpen(false);
    setQuery('');
  };

  const addToRecentSearches = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleRecentSearchClick = (search: string) => {
    setQuery(search);
    navigate(`/catalog?search=${encodeURIComponent(search)}`);
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery('');
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    setIsFocused(true);
    setIsOpen(true);
  };

  const handleBlur = () => {
    // Delay para permitir clicks en el dropdown
    setTimeout(() => {
      setIsFocused(false);
    }, 200);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-5xl" ref={dropdownRef}>
      {/* Input Principal */}
      <div 
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Icono de búsqueda - siempre visible */}
        <div className="absolute inset-y-0 left-0 flex items-center justify-center w-14 pointer-events-none z-10">
          <Search className={`h-5 w-5 transition-colors duration-300 ${colors.icon}`} />
        </div>
        
        {/* Input con scroll horizontal */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Buscar medicamentos..."
          className={`
            w-full h-14 pl-14 rounded-full
            focus:outline-none transition-all duration-300
            text-base leading-relaxed backdrop-blur-md border
            overflow-x-auto scrollbar-hide
            ${query ? 'pr-14' : 'pr-6'}
            ${isActive 
              ? 'bg-white text-gray-900 placeholder-gray-500 shadow-lg border-blue-200 focus:ring-2 focus:ring-blue-500' 
              : `${colors.background} ${colors.text} ${colors.placeholder} shadow-md border-white/30 hover:bg-white/30`
            }
          `}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        />

        {/* Botón limpiar - solo cuando hay texto */}
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className={`
              absolute inset-y-0 right-0 flex items-center justify-center w-14
              transition-colors duration-300 z-10
              ${colors.clearButton}
            `}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown de Resultados */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 max-h-[600px] overflow-hidden"
          >
            {/* Resultados de productos */}
            {query.trim().length >= 2 && (
              <div className="overflow-y-auto max-h-[500px]">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Buscando productos...</p>
                  </div>
                ) : products.length > 0 ? (
                  <div className="p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center px-2">
                      <Search className="h-4 w-4 mr-2 text-blue-600" />
                      Resultados ({products.length})
                    </h4>
                    <div className="space-y-1">
                      {products.map((product, index) => (
                        <button
                          key={product.id}
                          onClick={() => handleProductClick(product)}
                          className={`w-full text-left p-3 rounded-xl transition-colors flex items-center space-x-3 ${
                            index === activeIndex
                              ? 'bg-blue-50 text-blue-700'
                              : 'hover:bg-gray-50 text-gray-900'
                          }`}
                        >
                          {/* Imagen del producto */}
                          <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                            <ProductImage
                              src={product.image}
                              images={product.images}
                              alt={product.name}
                              size="sm"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {/* Información del producto */}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm sm:text-base truncate">
                              {product.name}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500 truncate">
                              {product.category || 'Sin categoría'}
                            </div>
                            {product.price && (
                              <div className="text-sm font-semibold text-blue-600 mt-1">
                                ${parseFloat(product.price).toLocaleString()}
                              </div>
                            )}
                          </div>

                          <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                    
                    {/* Ver todos los resultados */}
                    {products.length >= 8 && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleSearch();
                        }}
                        className="w-full mt-3 p-3 text-center text-blue-600 hover:bg-blue-50 rounded-xl transition-colors font-medium"
                      >
                        Ver todos los resultados para "{query}"
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      No se encontraron productos
                    </h3>
                    <p className="text-sm text-gray-600">
                      Intenta con otros términos de búsqueda
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Búsquedas recientes (solo cuando no hay query o es muy corta) */}
            {(!query || query.trim().length < 2) && recentSearches.length > 0 && (
              <div className="p-4 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center px-2">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  Búsquedas recientes
                </h4>
                <div className="space-y-1">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearchClick(search)}
                      className="w-full text-left p-3 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tendencias */}
            {(!query || query.trim().length < 2) && trendingSearches.length > 0 && (
              <div className="p-4 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center px-2">
                  <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                  Tendencias populares
                </h4>
                <div className="space-y-1">
                  {trendingSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearchClick(search)}
                      className="w-full text-left p-3 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors flex items-center justify-between"
                    >
                      <span>{search}</span>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mensaje cuando no hay query */}
            {!query && recentSearches.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <p>Escribe para buscar productos...</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}; 