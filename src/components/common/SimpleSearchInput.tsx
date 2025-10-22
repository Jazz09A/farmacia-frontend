import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, TrendingUp, Pill, Heart, Package, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { productService, SearchSuggestion as APISuggestion } from '../../services/ProductService';

interface SearchSuggestion {
  id: string;
  text: string;
  category: string;
  type: 'product' | 'brand' | 'category';
  icon: React.ElementType;
}

interface SimpleSearchInputProps {
  onSearchTermChange?: (term: string) => void;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
  isScrolled?: boolean;
}

export const SimpleSearchInput: React.FC<SimpleSearchInputProps> = ({
  onSearchTermChange,
  placeholder = "Buscar medicamentos...",
  className = "",
  showSuggestions = true,
  isScrolled = false
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
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
    'Protector solar',
    'Ibuprofeno'
  ];

  // Obtener sugerencias del backend
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query || query.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoadingSuggestions(true);
      try {
        const apiSuggestions: APISuggestion[] = await productService.getSearchSuggestions(query, 6);
        
        const formattedSuggestions: SearchSuggestion[] = apiSuggestions.map((sug, index) => ({
          id: `${sug.type}-${index}`,
          text: sug.text,
          category: sug.type === 'product' ? 'Producto' : sug.type === 'brand' ? 'Marca' : 'Categoría',
          type: sug.type,
          icon: sug.type === 'product' ? Package : sug.type === 'brand' ? Tag : Pill
        }));

        setSuggestions(formattedSuggestions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const filteredSuggestions = suggestions;

  // Estado activo cuando está en hover, focus o abierto
  const isActive = isHovered || isFocused || isOpen;

  // Función para obtener los colores según el estado
  const getSearchColors = () => {
    if (isActive) {
      return {
        icon: 'text-blue-600',
        text: 'text-gray-900',
        placeholder: 'placeholder-gray-500',
        background: 'bg-white',
        clearButton: 'text-gray-400 hover:text-gray-600'
      };
    } else {
      if (isScrolled) {
        return {
          icon: 'text-medical-blue-900',
          text: 'text-gray-900',
          placeholder: 'placeholder-gray-500',
          background: 'bg-white/90',
          clearButton: 'text-gray-400 hover:text-gray-600'
        };
      } else {
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

  // Notificar cambios en el término de búsqueda
  useEffect(() => {
    if (onSearchTermChange) {
      onSearchTermChange(query);
    }
  }, [query, onSearchTermChange]);

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
        setActiveIndex(prev => prev < filteredSuggestions.length - 1 ? prev + 1 : prev);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0) {
          handleSuggestionClick(filteredSuggestions[activeIndex]);
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

  const addToRecentSearches = (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent searches:', error);
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      addToRecentSearches(query);
      // Navegar al catálogo con el término de búsqueda
      navigate(`/catalog?search=${encodeURIComponent(query)}`);
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    addToRecentSearches(suggestion.text);
    navigate(`/catalog?search=${encodeURIComponent(suggestion.text)}`);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const clearSearch = () => {
    setQuery('');
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (showSuggestions) {
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
    }, 200);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (showSuggestions) {
      setIsOpen(true);
    }
  };

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {/* Input Principal */}
      <div 
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Icono de búsqueda */}
        <div className="absolute inset-y-0 left-0 flex items-center justify-center w-14 pointer-events-none z-10">
          <Search className={`h-5 w-5 transition-colors duration-300 ${colors.icon}`} />
        </div>
        
        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
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

        {/* Botón limpiar */}
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

      {/* Dropdown de Sugerencias */}
      {isOpen && showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 max-h-96 overflow-y-auto backdrop-blur-md">
          {/* Sugerencias de Búsqueda */}
          {filteredSuggestions.length > 0 && (
            <div className="p-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                <Search className="h-4 w-4 mr-2 text-blue-600" />
                {query ? 'Resultados de búsqueda' : 'Sugerencias populares'}
              </h4>
              
              {filteredSuggestions.map((suggestion, index) => {
                const Icon = suggestion.icon;
                return (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full text-left p-3 rounded-xl transition-colors flex items-center space-x-3 ${
                      index === activeIndex 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'hover:bg-gray-50 text-gray-900'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${
                      index === activeIndex ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <div className="flex-1">
                      <div className="font-medium">{suggestion.text}</div>
                      <div className="text-sm text-gray-500">{suggestion.category}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Búsquedas Recientes */}
          {!query && recentSearches.length > 0 && (
            <div className="p-6 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                Búsquedas recientes
              </h4>
              
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(search);
                    navigate(`/catalog?search=${encodeURIComponent(search)}`);
                    setIsOpen(false);
                  }}
                  className="w-full text-left p-3 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          )}

          {/* Tendencias */}
          {!query && trendingSearches.length > 0 && (
            <div className="p-6 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                Tendencias populares
              </h4>
              
              {trendingSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(search);
                    navigate(`/catalog?search=${encodeURIComponent(search)}`);
                    setIsOpen(false);
                  }}
                  className="w-full text-left p-3 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors flex items-center justify-between"
                >
                  <span>{search}</span>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </button>
              ))}
            </div>
          )}

          {/* Mensaje cuando no hay resultados */}
          {query && filteredSuggestions.length === 0 && (
            <motion.div 
              className="p-8 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center"
              >
                <Search className="h-10 w-10 text-gray-400" />
              </motion.div>
              
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                No se encontraron resultados para "<span className="text-blue-600">{query}</span>"
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                Intenta con otros términos de búsqueda
              </p>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 max-w-sm mx-auto">
                <h4 className="text-xs font-semibold text-blue-800 mb-2 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Sugerencias de búsqueda:
                </h4>
                <ul className="text-xs text-gray-700 space-y-1 text-left">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Verifica la ortografía de las palabras</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Usa términos más generales</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Prueba con sinónimos o nombres alternativos</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default SimpleSearchInput;


