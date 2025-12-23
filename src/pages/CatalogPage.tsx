import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Grid, List, Heart, Pill, Stethoscope, Shield, Sparkles, X, Brain, Bone, User, Flower2, Scale, Loader2 } from 'lucide-react';
import { SearchFilters } from '../types';
import { ProductCard } from '../components/Products/ProductCard';
import { useGlobalCurrency } from '../contexts/GlobalCurrencyContext';
import Pagination from '../components/common/Pagination';
import { ProductCardSkeleton } from '../components/Skeleton/ProductCardSkeleton';
import MapSection from '../components/Map/MapSection';
import { useProductsQuery } from '../hooks/queries/useProductsQueries';
import { usePrefetchNextPage } from '../hooks/useImagePrefetch';
import { authenticatedImageCache } from '../utils/authenticatedImageCache';
import { usePrefetchOnHover } from '../hooks/usePrefetchOnHover';

// Especialidades Farmacéuticas
const medicalCategories = [
  { id: 'SISTEMA NERVIOSO', name: 'Sistema Nervioso', icon: 'Brain', color: 'purple', count: 0 },
  { id: 'SALUD CARDIOVASCULAR', name: 'Salud Cardiovascular', icon: 'Heart', color: 'red', count: 0 },
  { id: 'SISTEMA INMUNOLOGICO', name: 'Sistema Inmunológico', icon: 'Shield', color: 'blue', count: 0 },
  { id: 'SISTEMA OSTEOARTICULAR', name: 'Sistema Osteoarticular', icon: 'Bone', color: 'orange', count: 0 },
  { id: 'BIENESTAR GENERAL', name: 'Bienestar General', icon: 'Sparkles', color: 'yellow', count: 0 },
  { id: 'SALUD MASCULINA', name: 'Salud Masculina', icon: 'User', color: 'indigo', count: 0 },
  { id: 'SALUD FEMENINA', name: 'Salud Femenina', icon: 'Flower2', color: 'pink', count: 0 },
  { id: 'PERDIDA DE PESO', name: 'Pérdida de Peso', icon: 'Scale', color: 'green', count: 0 }
];

const CatalogPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchParams.get('search') || '');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);
  const [isPageChanging, setIsPageChanging] = useState(false);
  const { currency, formatPriceFromBackend, getDisplayPrice } = useGlobalCurrency();
  
  // Ref para scroll al cambiar de página
  const productsContainerRef = useRef<HTMLDivElement>(null);
  
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    subcategory: '',
    patology: '',
    priceRange: [0, 1000],
    inStock: false,
    prescription: false,
    rating: 0,
    brand: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Convertir filtros locales a parámetros de búsqueda de API
  const searchParams_api = useMemo(() => ({
    search: debouncedSearchTerm || undefined,
    category: filters.category || undefined,
    subcategory: filters.subcategory || undefined,
    patology: filters.patology || undefined,
    brand: filters.brand || undefined,
    min_price: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
    max_price: filters.priceRange[1] < 1000 ? filters.priceRange[1] : undefined,
    in_stock: filters.inStock || undefined,
    prescription: filters.prescription || undefined,
    sort_by: filters.sortBy as 'name' | 'price' | 'rating' | 'created_at' | 'relevance',
    sort_order: filters.sortOrder,
    page: currentPage,
    limit: productsPerPage
  }), [debouncedSearchTerm, filters, currentPage, productsPerPage]);

  // Usar React Query para obtener productos
  const { data: productsResponse, isLoading, isFetching, error } = useProductsQuery(searchParams_api);
  useEffect(() => {
  }, [productsResponse, isLoading, isFetching, searchParams_api]);

  const products = productsResponse?.products || [];
  const totalPages = productsResponse?.pagination?.total_pages || productsResponse?.total ? Math.ceil((productsResponse.total || 0) / productsPerPage) : 1;
  const totalProducts = productsResponse?.total || productsResponse?.pagination?.total || 0;
  const isFiltering = isFetching && !isLoading;

  // Actualizar searchTerm cuando cambia la URL
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch && urlSearch !== searchTerm) {
      setSearchTerm(urlSearch);
    }
  }, [searchParams]);

  // Resetear página cuando cambian filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, debouncedSearchTerm]);

  // Manejar cambio de página con scroll y loading
  const handlePageChange = useCallback((page: number) => {
    if (page === currentPage) return;
    
    // Activar estado de carga
    setIsPageChanging(true);
    setCurrentPage(page);
    
    // Scroll suave hacia el contenedor de productos
    if (productsContainerRef.current) {
      const offsetTop = productsContainerRef.current.offsetTop - 120; // Offset para el navbar
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    } else {
      // Fallback: scroll al top
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [currentPage]);

  // Desactivar estado de carga cuando terminan de cargar los productos
  useEffect(() => {
    if (!isFetching && isPageChanging) {
      // Pequeño delay para que la transición sea más suave
      const timer = setTimeout(() => {
        setIsPageChanging(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isFetching, isPageChanging]);

  // Preconnect al backend para reducir latencia en requests de imágenes
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    if (apiUrl && typeof window !== 'undefined') {
      // Preconnect para establecer conexión temprana
      const preconnectLink = document.createElement('link');
      preconnectLink.rel = 'preconnect';
      preconnectLink.href = apiUrl;
      preconnectLink.crossOrigin = 'use-credentials';
      document.head.appendChild(preconnectLink);

      // DNS-prefetch como fallback
      const dnsPrefetchLink = document.createElement('link');
      dnsPrefetchLink.rel = 'dns-prefetch';
      dnsPrefetchLink.href = apiUrl;
      document.head.appendChild(dnsPrefetchLink);

      return () => {
        document.head.removeChild(preconnectLink);
        document.head.removeChild(dnsPrefetchLink);
      };
    }
  }, []);

  // Hook para prefetch on hover
  const { prefetch: prefetchImage, clearPrefetched } = usePrefetchOnHover();

  // Limpiar prefetch al cambiar de página
  useEffect(() => {
    clearPrefetched();
  }, [currentPage, clearPrefetched]);

  // Prefetch de imágenes de la página actual (más agresivo)
  usePrefetchNextPage(products, !isLoading && products.length > 0);
  
  // Precargar imágenes visibles inmediatamente
  useEffect(() => {
    if (!isLoading && products.length > 0) {
      // Precargar las primeras 12 imágenes (las que están visibles)
      const visibleProducts = products.slice(0, 12);
      const imageUrls = visibleProducts
        .map(product => {
          if (product.images && product.images.length >= 2) {
            return product.images[1];
          }
          return product.image || (product.images && product.images[0]);
        })
        .filter((url): url is string => !!url && url.includes('/api/v1/images/'));
      
      // Precargar en paralelo con prioridad alta
      if (imageUrls.length > 0 && typeof window !== 'undefined') {
        // Usar requestIdleCallback para no bloquear, pero con timeout corto
        const prefetchImages = () => {
          imageUrls.forEach(url => {
            const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
            const imageUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
            authenticatedImageCache.getImage(imageUrl, true).catch(() => {
              // Silenciar errores de prefetch
            });
          });
        };
        
        if ('requestIdleCallback' in window) {
          requestIdleCallback(prefetchImages, { timeout: 500 });
        } else {
          setTimeout(prefetchImages, 100);
        }
      }
    }
  }, [products, isLoading]);

  // Icono dinámico para categorías
  const getCategoryIcon = (iconName: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'Pill': <Pill className="w-5 h-5" />,
      'Heart': <Heart className="w-5 h-5" />,
      'Sparkles': <Sparkles className="w-5 h-5" />,
      'Shield': <Shield className="w-5 h-5" />,
      'Stethoscope': <Stethoscope className="w-5 h-5" />,
      'Brain': <Brain className="w-5 h-5" />,
      'Bone': <Bone className="w-5 h-5" />,
      'User': <User className="w-5 h-5" />,
      'Flower2': <Flower2 className="w-5 h-5" />,
      'Scale': <Scale className="w-5 h-5" />
    };
    return icons[iconName] || <Pill className="w-5 h-5" />;
  };

  // Mapeo de colores para clases de Tailwind
  const getCategoryBgColor = (color: string) => {
    const colorMap: { [key: string]: string } = {
      'purple': 'bg-purple-100',
      'red': 'bg-red-100',
      'blue': 'bg-blue-100',
      'orange': 'bg-orange-100',
      'yellow': 'bg-yellow-100',
      'indigo': 'bg-indigo-100',
      'pink': 'bg-pink-100',
      'green': 'bg-green-100',
      'gray': 'bg-gray-100'
    };
    return colorMap[color] || 'bg-gray-100';
  };

  // Los productos ya vienen filtrados del servidor, no necesitamos filtrar localmente
  const filteredProducts = products;

  // Función para formatear precios individuales (para filtros)
  const formatSinglePrice = (price: number): string => {
    return formatPriceFromBackend(price.toString(), currency);
  };




  return (
    <div className="relative min-h-screen">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1576602976047-174e57a47881?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Interior de una farmacia moderna y luminosa"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-medical-blue-50/95 via-medical-green-50/90 to-white/95" />
      </div>

      {/* Page Content */}
      <div className="relative z-10">
        {/* Header del catálogo */}
        <div className="relative pt-8 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-medical-primary to-medical-accent bg-clip-text text-transparent mb-6">
              Catálogo De Productos
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Encuentra todos los medicamentos, suplementos y productos de salud que necesitas con la garantía de calidad farmacéutica
            </p>
            
            {/* Barra de búsqueda principal */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar medicamentos, marcas, síntomas..."
                  className="w-full pl-12 pr-4 py-4 bg-white/90 backdrop-blur-md border-2 border-medical-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar de filtros */}
            <div className="lg:w-80 space-y-6">
              {/* Toggle para filtros en móvil */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden w-full flex items-center justify-between p-4 bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl"
              >
                <span className="font-medium">Filtros</span>
                <Filter className="w-5 h-5" />
              </button>

              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Especialidades Farmacéuticas */}
                <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Especialidades Farmacéuticas</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setFilters({...filters, category: ''})}
                      className={`w-full text-left p-3 rounded-xl transition-all duration-300 ${
                        !filters.category 
                          ? 'bg-gradient-to-r from-medical-primary to-medical-primary-dark text-white' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      Todas las categorías
                    </button>
                    {medicalCategories.map((category) => (
                      <div
                        key={category.id}
                        className="w-full text-left p-3 rounded-xl flex items-center gap-3 bg-gray-50"
                      >
                        <span className={`p-2 rounded-lg ${getCategoryBgColor(category.color)}`}>
                          {getCategoryIcon(category.icon)}
                        </span>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{category.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rango de precios */}
                <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Rango de Precios</h3>
                  <div className="space-y-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={filters.priceRange[1]}
                      onChange={(e) => setFilters({
                        ...filters, 
                        priceRange: [filters.priceRange[0], parseInt(e.target.value)]
                      })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{formatSinglePrice(filters.priceRange[0])}</span>
                      <span>{formatSinglePrice(filters.priceRange[1])}</span>
                    </div>
                  </div>
                </div>

                {/* Opciones adicionales */}
                <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Opciones</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.inStock}
                        onChange={(e) => setFilters({...filters, inStock: e.target.checked})}
                        className="w-4 h-4 text-medical-primary bg-gray-100 border-gray-300 rounded focus:ring-medical-primary focus:ring-2"
                      />
                      <span>Solo productos en stock</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.prescription}
                        onChange={(e) => setFilters({...filters, prescription: e.target.checked})}
                        className="w-4 h-4 text-medical-primary bg-gray-100 border-gray-300 rounded focus:ring-medical-primary focus:ring-2"
                      />
                      <span>Solo medicamentos con receta</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="flex-1 space-y-6 pb-16">
              {/* Controles de vista y ordenamiento */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <p className="text-gray-600">
                    {totalProducts} productos encontrados
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Ordenamiento */}
                  <select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split('-') as [any, 'asc' | 'desc'];
                      setFilters({...filters, sortBy, sortOrder});
                    }}
                    className="px-4 py-2 bg-white/50 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-medical-primary/50"
                  >
                    <option value="name-asc">Nombre A-Z</option>
                    <option value="name-desc">Nombre Z-A</option>
                    <option value="price-asc">Menor precio</option>
                    <option value="price-desc">Mayor precio</option>
                    <option value="rating-desc">Mejor valorado</option>
                    <option value="popularity-desc">Más popular</option>
                  </select>

                  {/* Vista grid/list */}
                  <div className="flex bg-white/50 border border-white/20 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        viewMode === 'grid' 
                          ? 'bg-medical-primary text-white' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        viewMode === 'list' 
                          ? 'bg-medical-primary text-white' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid de productos */}
              <div ref={productsContainerRef} className="relative">
                {/* Overlay de loading al cambiar de página */}
                {isPageChanging && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-2xl transition-opacity duration-300">
                    <div className="flex flex-col items-center gap-3 w-40">
                      <div className="skeleton rounded-full h-14 w-14" />
                      <div className="skeleton h-3 w-24 rounded-full" />
                      <div className="skeleton h-3 w-16 rounded-full" />
                    </div>
                  </div>
                )}

                {isLoading ? (
                  <div className={`grid gap-6 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                      : 'grid-cols-1'
                  }`}>
                    {[...Array(12)].map((_, index) => (
                      <ProductCardSkeleton key={index} />
                    ))}
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className={`grid gap-6 transition-opacity duration-300 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                      : 'grid-cols-1'
                  } ${isPageChanging ? 'opacity-50' : 'opacity-100'}`}>
                    {filteredProducts.map((product, index) => (
                      <div 
                        key={product.id}
                        onMouseEnter={() => {
                          // Prefetch imagen al hacer hover para carga más rápida
                          const imageUrl = product.images && product.images.length >= 2 
                            ? product.images[1] 
                            : product.image || (product.images && product.images[0]);
                          prefetchImage(imageUrl);
                        }}
                      >
                        <ProductCard 
                          product={product} 
                          priority={index < 12} // Prioridad para las primeras 12 imágenes
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                <div className="text-center py-16 bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl">
                  <div className="max-w-md mx-auto">
                    <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No se encontraron productos
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Intenta ajustar los filtros o cambiar los términos de búsqueda
                    </p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setFilters({
                          category: '',
                          subcategory: '',
                          patology: '',
                          priceRange: [0, 100],
                          inStock: false,
                          prescription: false,
                          rating: 0,
                          brand: '',
                          sortBy: 'name',
                          sortOrder: 'asc'
                        });
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-medical-primary to-medical-primary-dark text-white rounded-xl hover:shadow-lg hover:shadow-medical-primary/25 transition-all duration-300"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              )}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalProducts}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </div>
        </div>



      </div>
    </div>
  );
};

export default CatalogPage; 