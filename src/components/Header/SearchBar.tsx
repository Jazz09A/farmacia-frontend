import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, TrendingUp, Pill, Heart, Sparkles, Stethoscope } from 'lucide-react';

interface SearchSuggestion {
  id: string;
  text: string;
  category: string;
  icon: React.ElementType;
}

interface SearchBarProps {
  isScrolled: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ isScrolled }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sugerencias estáticas para asegurar que siempre se muestren
  const suggestions: SearchSuggestion[] = [
    { id: '1', text: 'Acetaminofén 500mg', category: 'Analgésicos', icon: Pill },
    { id: '2', text: 'Ibuprofeno infantil', category: 'Pediatría', icon: Heart },
    { id: '3', text: 'Vitamina D3 1000 UI', category: 'Suplementos', icon: Sparkles },
    { id: '4', text: 'Protector solar FPS 50+', category: 'Cuidado Personal', icon: Stethoscope },
    { id: '5', text: 'Complejo B multivitamínico', category: 'Vitaminas', icon: Sparkles },
    { id: '6', text: 'Jarabe para la tos', category: 'Respiratorio', icon: Heart },
  ];

  const recentSearches = [
    'Acetaminofén 500mg',
    'Vitamina D3',
    'Protector solar'
  ];

  const trendingSearches = [
    'Ibuprofeno infantil',
    'Complejo B',
    'Jarabe para la tos'
  ];

  // Filtrar sugerencias basadas en la consulta
  const filteredSuggestions = query.trim() 
    ? suggestions.filter(s => s.text.toLowerCase().includes(query.toLowerCase()))
    : suggestions.slice(0, 4);

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
          icon: 'text-gray-600',
          text: 'text-gray-900',
          placeholder: 'placeholder-gray-500',
          background: 'bg-white/90',
          clearButton: 'text-gray-400 hover:text-gray-600'
        };
      } else {
        // Sin scroll: colores blancos porque el navbar es transparente
        return {
          icon: 'text-white/70',
          text: 'text-white',
          placeholder: 'placeholder-white/60',
          background: 'bg-white/20',
          clearButton: 'text-white/70 hover:text-white'
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
        setActiveIndex(prev => prev < filteredSuggestions.length - 1 ? prev + 1 : prev);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0) {
          setQuery(filteredSuggestions[activeIndex].text);
          setIsOpen(false);
          setActiveIndex(-1);
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

  const handleSearch = () => {
    if (query.trim()) {
      console.log('Searching for:', query);
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setIsOpen(false);
    setActiveIndex(-1);
    console.log('Selected:', suggestion.text);
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
    <div className="relative w-full max-w-5xl" ref={dropdownRef}>
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
          onChange={(e) => setQuery(e.target.value)}
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

      {/* Dropdown de Sugerencias */}
      {isOpen && (
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
            <div className="p-8 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No se encontraron resultados para "{query}"</p>
              <p className="text-sm mt-1">Intenta con otros términos de búsqueda</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 