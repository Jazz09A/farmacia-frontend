import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mic, X, Clock, TrendingUp, Camera, Filter, Pill, Heart, Sparkles } from 'lucide-react';

interface SearchCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  count: number;
}

export const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [searchResults, setSearchResults] = useState<SearchCategory[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const placeholders = [
    'Buscar medicamentos certificados...',
    'Vitaminas y suplementos premium...',
    'Cuidado personal especializado...',
    'Analgésicos y antiinflamatorios...',
    'Productos dermatológicos...',
    'Suplementos nutricionales...',
    'Medicamentos recetados...',
    'Productos para el hogar...'
  ];

  const categories: SearchCategory[] = [
    { id: 'rx', name: 'Medicamentos Rx', icon: Pill, color: 'text-red-600 bg-red-50', count: 245 },
    { id: 'otc', name: 'Sin Receta (OTC)', icon: Heart, color: 'text-blue-600 bg-blue-50', count: 567 },
    { id: 'supplements', name: 'Suplementos', icon: Sparkles, color: 'text-green-600 bg-green-50', count: 189 },
    { id: 'cosmetics', name: 'Cosméticos', icon: Search, color: 'text-purple-600 bg-purple-50', count: 123 },
  ];

  const recentSearches = [
    { query: 'Acetaminofén 500mg', category: 'otc', results: 12 },
    { query: 'Vitamina D3 1000 UI', category: 'supplements', results: 8 },
    { query: 'Protector solar FPS 50+', category: 'cosmetics', results: 15 }
  ];

  const trendingSearches = [
    { query: 'Ibuprofeno infantil', category: 'otc', trend: '+25%' },
    { query: 'Complejo B multivitamínico', category: 'supplements', trend: '+18%' },
    { query: 'Jarabe para la tos', category: 'otc', trend: '+32%' },
    { query: 'Omega 3 + EPA DHA', category: 'supplements', trend: '+15%' }
  ];

  // Cambio automático de placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Simulación de búsqueda inteligente
  useEffect(() => {
    if (query.trim()) {
      const filteredCategories = categories.filter(cat => 
        cat.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filteredCategories);
    } else {
      setSearchResults([]);
    }
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      console.log('Searching for:', query);
      // Aquí iría la lógica de búsqueda real
      setIsActive(false);
    }
  };

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsListening(true);
      
      // Simulación de búsqueda por voz
      setTimeout(() => {
        setIsListening(false);
        setQuery('Acetaminofén 500mg');
      }, 2000);
    } else {
      alert('Tu navegador no soporta reconocimiento de voz');
    }
  };

  const handleImageSearch = () => {
    alert('Funcionalidad de búsqueda por imagen disponible próximamente');
  };

  return (
    <div className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <motion.div
          className={`relative overflow-hidden rounded-2xl transition-all duration-400 ${
            isActive
              ? 'glass-card shadow-medical-hover ring-2 ring-medical-blue-500/50'
              : 'glass-medical hover:glass-card hover:shadow-medical'
          }`}
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          {/* Main Search Input */}
          <div className="flex items-center">
            <div className="p-4">
              <Search className={`h-5 w-5 transition-colors duration-200 ${
                isActive ? 'text-medical-blue-600' : 'text-medical-gray-500'
              }`} />
            </div>
            
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsActive(true)}
              onBlur={() => setTimeout(() => setIsActive(false), 200)}
              placeholder={placeholders[currentPlaceholder]}
              className={`flex-1 py-4 bg-transparent text-medical-gray-900 placeholder-medical-gray-400 focus:outline-none transition-all duration-300 ${
                isActive ? 'text-lg' : 'text-base'
              }`}
            />

            {/* Action Buttons */}
            <div className="flex items-center pr-3 space-x-2">
              {query && (
                <motion.button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-2 hover:bg-medical-gray-100 rounded-full transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-4 w-4 text-medical-gray-400" />
                </motion.button>
              )}

            </div>
          </div>

          {/* Search Progress Bar */}
          {isListening && (
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-medical-blue-gradient"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2 }}
            />
          )}
        </motion.div>
      </form>

      {/* Enhanced Search Suggestions Dropdown */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-3 glass-card rounded-2xl shadow-elegant border border-white/30 overflow-hidden z-50"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'spring' }}
          >
            <div className="p-6">
              {/* Quick Categories */}
              {!query && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-medical-gray-700 mb-3 flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-medical-blue-600" />
                    Categorías Rápidas
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map((category) => (
                      <motion.button
                        key={category.id}
                        className={`flex items-center p-3 rounded-xl transition-all duration-200 hover:shadow-medical ${category.color}`}
                        whileHover={{ scale: 1.02, x: 4 }}
                        onClick={() => {
                          setQuery(category.name);
                          setIsActive(false);
                        }}
                      >
                        <category.icon className="h-5 w-5 mr-3" />
                        <div className="text-left">
                          <div className="font-medium text-sm">{category.name}</div>
                          <div className="text-xs opacity-75">{category.count} productos</div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results Categories */}
              {searchResults.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-medical-gray-700 mb-3">
                    Resultados por categoría
                  </h4>
                  {searchResults.map((result) => (
                    <motion.button
                      key={result.id}
                      className="block w-full text-left p-3 rounded-lg hover:bg-medical-blue-50 transition-colors duration-200"
                      whileHover={{ x: 4 }}
                      onClick={() => {
                        setQuery(result.name);
                        setIsActive(false);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-medical-gray-900">{result.name}</span>
                        <span className="text-sm text-medical-gray-500">{result.count} productos</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Recent Searches */}
              {recentSearches.length > 0 && !query && (
                <div className="mb-6">
                  <div className="flex items-center text-sm font-semibold text-medical-gray-700 mb-3">
                    <Clock className="h-4 w-4 mr-2 text-medical-blue-600" />
                    Búsquedas Recientes
                  </div>
                  {recentSearches.map((search, index) => (
                    <motion.button
                      key={index}
                      className="block w-full text-left p-3 rounded-lg hover:bg-medical-blue-50 transition-colors duration-200 group"
                      whileHover={{ x: 4 }}
                      onClick={() => {
                        setQuery(search.query);
                        setIsActive(false);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-medical-gray-900 group-hover:text-medical-blue-700">{search.query}</span>
                        <span className="text-xs text-medical-gray-500">{search.results} resultados</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Trending Searches */}
              {!query && (
                <div>
                  <div className="flex items-center text-sm font-semibold text-medical-gray-700 mb-3">
                    <TrendingUp className="h-4 w-4 mr-2 text-medical-green-600" />
                    Tendencias Populares
                  </div>
                  {trendingSearches.map((search, index) => (
                    <motion.button
                      key={index}
                      className="block w-full text-left p-3 rounded-lg hover:bg-medical-green-50 transition-colors duration-200 group"
                      whileHover={{ x: 4 }}
                      onClick={() => {
                        setQuery(search.query);
                        setIsActive(false);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-medical-gray-900 group-hover:text-medical-green-700">{search.query}</span>
                        <span className="text-xs text-medical-green-600 font-medium">{search.trend}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Voice Search Indicator */}
              {isListening && (
                <motion.div
                  className="flex items-center justify-center p-8 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="text-medical-blue-600">
                    <motion.div
                      className="w-16 h-16 mx-auto mb-4 bg-medical-blue-100 rounded-full flex items-center justify-center"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      <Mic className="h-8 w-8" />
                    </motion.div>
                    <p className="text-sm font-medium">Escuchando...</p>
                    <p className="text-xs text-medical-gray-500 mt-1">Dime qué medicamento necesitas</p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};