import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, TrendingUp, Pill, Heart, Sparkles, Stethoscope } from 'lucide-react';
import { useSearch } from '../../hooks/useSearch';
import { Product } from '../../types';

interface SearchSuggestion {
  id: string;
  text: string;
  category: string;
  icon: React.ElementType;
}

interface SearchInputProps {
  products: Product[];
  onSearchResults?: (results: Product[]) => void;
  onSearchTermChange?: (term: string) => void;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
  isScrolled?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  products,
  onSearchResults,
  onSearchTermChange,
  placeholder = "Buscar medicamentos...",
  className = "",
  showSuggestions = true,
  isScrolled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    searchTerm,
    setSearchTerm,
    searchHistory,
    filteredProducts,
    updateSearchHistory,
    currentPlaceholder
  } = useSearch(products);

  // Sugerencias estáticas para asegurar que siempre se muestren
  const suggestions: SearchSuggestion[] = [
    { id: '1', text: 'Acetaminofén 500mg', category: 'Analgésicos', icon: Pill },
    { id: '2', text: 'Ibuprofeno infantil', category: 'Pediatría', icon: Heart },
    { id: '3', text: 'Vitamina D3 1000 UI', category: 'Suplementos', icon: Sparkles },
    { id: '4', text: 'Protector solar FPS 50+', category: 'Cuidado Personal', icon: Stethoscope },
    { id: '5', text: 'Complejo B multivitamínico', category: 'Vitaminas', icon: Sparkles },
    { id: '6', text: 'Jarabe para la tos', category: 'Respiratorio', icon: Heart },
  ];

  const recentSearches = searchHistory.slice(0, 3);
  const trendingSearches = [
    'Ibuprofeno infantil',
    'Complejo B',
    'Jarabe para la tos'
  ];

  // Filtrar sugerencias basadas en la consulta
  const filteredSuggestions = searchTerm.trim() 
    ? suggestions.filter(s => s.text.toLowerCase().includes(searchTerm.toLowerCase()))
    : suggestions.slice(0, 4);

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

  // Notificar cambios en los resultados de búsqueda
  useEffect(() => {
    if (onSearchResults) {
      onSearchResults(filteredProducts);
    }
  }, [filteredProducts, onSearchResults]);

  // Notificar cambios en el término de búsqueda
  useEffect(() => {
    if (onSearchTermChange) {
      onSearchTermChange(searchTerm);
    }
  }, [searchTerm, onSearchTermChange]);

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
        } else if (searchTerm.trim()) {
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

  const handleSearch = () => {
    if (searchTerm.trim()) {
      updateSearchHistory(searchTerm);
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchTerm(suggestion.text);
    updateSearchHistory(suggestion.text);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const clearSearch = () => {
    setSearchTerm('');
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
    setSearchTerm(e.target.value);
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
          value={searchTerm}
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
            ${searchTerm ? 'pr-14' : 'pr-6'}
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
        {searchTerm && (
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
                {searchTerm ? 'Resultados de búsqueda' : 'Sugerencias populares'}
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
          {!searchTerm && recentSearches.length > 0 && (
            <div className="p-6 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                Búsquedas recientes
              </h4>
              
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchTerm(search);
                    updateSearchHistory(search);
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
          {!searchTerm && trendingSearches.length > 0 && (
            <div className="p-6 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                Tendencias populares
              </h4>
              
              {trendingSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchTerm(search);
                    updateSearchHistory(search);
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
          {searchTerm && filteredSuggestions.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No se encontraron resultados para "{searchTerm}"</p>
              <p className="text-sm mt-1">Intenta con otros términos de búsqueda</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInput;


