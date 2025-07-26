import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Grid, List, Star, Heart, ShoppingCart, AlertCircle, Pill, Stethoscope, Shield, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product, SearchFilters } from '../types';
import { getProductsPaginated } from '../data/products';
import { useCart } from '../hooks/useCart';
import { ProductCardSkeleton} from '../components/Skeleton';
import Pagination from '../components/common/Pagination';

// Categorías temporales hasta que se obtengan de la API
const medicalCategories = [
  { id: 'SISTEMA NERVIOSO', name: 'Sistema Nervioso', icon: 'Stethoscope', color: 'blue', count: 0 },
  { id: 'Sin Categoría**', name: 'Sin Categoría', icon: 'Pill', color: 'gray', count: 0 }
];

const medicalConditions = [
  'Patología genérica**',
  'Neurología',
  'Cardiología'
];


const CatalogPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [productsPerPage] = useState(8);
  const cart = useCart();
  
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    subcategory: '',
    patology: '',
    priceRange: [0, 1000000],
    inStock: false,
    prescription: false,
    rating: 0,
    brand: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Función para cargar productos paginados
  const loadProducts = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const response = await getProductsPaginated(page, productsPerPage);
      setProducts(response.products);
      setTotalPages(response.totalPages);
      setTotalProducts(response.total);
      setCurrentPage(response.page);
    } catch (error) {
      console.error('Error loading products:', error);
      // En caso de error, limpiar el estado
      setProducts([]);
      setTotalPages(0);
      setTotalProducts(0);
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial loading
  useEffect(() => {
    loadProducts(1);
  }, []);

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    loadProducts(page);
    // Scroll to top cuando cambie de página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter change loading simulation
  useEffect(() => {
    if (!isLoading) {
      setIsFiltering(true);
      const timer = setTimeout(() => {
        setIsFiltering(false);
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [searchTerm, filters]);

  // Icono dinámico para categorías
  const getCategoryIcon = (iconName: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'Pill': <Pill className="w-5 h-5" />,
      'Heart': <Heart className="w-5 h-5" />,
      'Sparkles': <Sparkles className="w-5 h-5" />,
      'Shield': <Shield className="w-5 h-5" />,
      'Stethoscope': <Stethoscope className="w-5 h-5" />
    };
    return icons[iconName] || <Pill className="w-5 h-5" />;
  };

  // Filtrar y ordenar productos (ahora aplicado sobre los productos paginados)
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !filters.category || product.category === filters.category;
      const matchesSubcategory = !filters.subcategory || product.subcategory === filters.subcategory;
      const matchesPatology = !filters.patology || product.patology === filters.patology;
      const matchesBrand = !filters.brand || product.brand.toLowerCase().includes(filters.brand.toLowerCase());
      const matchesPrice = product.price_ves >= filters.priceRange[0] && product.price_ves <= filters.priceRange[1];
      const matchesStock = !filters.inStock || product.in_stock;
      const matchesPrescription = !filters.prescription || product.prescription;
      const matchesRating = product.rating >= filters.rating;

      return matchesSearch && matchesCategory && matchesSubcategory && matchesPatology && 
             matchesBrand && matchesPrice && matchesStock && matchesPrescription && matchesRating;
    });

    // Ordenar productos
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'price':
          comparison = a.price_ves - b.price_ves;
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'popularity':
          comparison = a.review_count - b.review_count;
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [products, searchTerm, filters]);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <div className="group relative bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:shadow-xl hover:shadow-medical-primary/10 transition-all duration-300 hover:-translate-y-1 flex flex-col">
      <Link to={`/producto/${product.id}`} className="flex flex-col flex-grow">
        {/* Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {product.is_offer && (
            <span className="px-2 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold rounded-full animate-pulse">
              OFERTA
            </span>
          )}
          {product.prescription && (
            <span className="px-2 py-1 bg-gradient-to-r from-medical-accent to-medical-accent-dark text-white text-xs font-semibold rounded-full flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Rx
            </span>
          )}
          {!product.in_stock && (
            <span className="px-2 py-1 bg-gray-500 text-white text-xs font-semibold rounded-full">
              Agotado
            </span>
          )}
        </div>

        {/* Corazón para favoritos */}
        <button 
          onClick={(e) => { e.preventDefault(); /* Lógica para wishlist */ }} 
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-medical-primary hover:text-white"
        >
          <Heart className="w-4 h-4" />
        </button>

        {/* Imagen del producto */}
        <div className="relative overflow-hidden rounded-xl mb-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Información del producto */}
        <div className="space-y-3 flex flex-col flex-grow">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-medical-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-medical-primary font-medium">{product.brand}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {product.rating} ({product.review_count})
            </span>
          </div>

          {/* Espaciador */}
          <div className="flex-grow"></div>
          
          {/* Precio */}
          <div className="flex items-center justify-between">
            <div>
              {product.is_offer && product.original_price ? (
                <div className="space-y-1">
                  <p className="text-lg font-bold text-medical-accent">
                    {formatPrice(product.price_ves)}
                  </p>
                  <p className="text-sm text-gray-500 line-through">
                    {formatPrice(product.original_price)}
                  </p>
                </div>
              ) : (
                <p className="text-lg font-bold text-gray-900">
                  {formatPrice(product.price_ves)}
                </p>
              )}
            </div>
          </div>
        </div>
      </Link>

      <button 
        onClick={(e) => {
          e.preventDefault();
          cart.addItem(product, 1);
        }}
        className={`mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
          product.in_stock
            ? 'bg-gradient-to-r from-medical-primary to-medical-primary-dark text-white hover:shadow-lg hover:shadow-medical-primary/25 hover:scale-105'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        disabled={!product.in_stock}
      >
        <ShoppingCart className="w-4 h-4" />
        <span>Añadir</span>
      </button>
    </div>
  );

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
              Catálogo Médico Premium
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Encuentra todos los medicamentos, suplementos y productos de salud que necesitas con la garantía de calidad farmacéutica
            </p>
            
            {/* Barra de búsqueda principal */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar medicamentos, marcas, síntomas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-medical-primary/50 focus:border-medical-primary transition-all duration-300 text-gray-900 placeholder-gray-500"
                />
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
                {/* Categorías médicas */}
                <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorías Médicas</h3>
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
                      <button
                        key={category.id}
                        onClick={() => setFilters({...filters, category: category.id})}
                        className={`w-full text-left p-3 rounded-xl transition-all duration-300 flex items-center gap-3 ${
                          filters.category === category.id
                            ? 'bg-gradient-to-r from-medical-primary to-medical-primary-dark text-white'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className={`p-2 rounded-lg ${
                          filters.category === category.id ? 'bg-white/20' : `bg-${category.color}-100`
                        }`}>
                          {getCategoryIcon(category.icon)}
                        </span>
                        <div className="flex-1">
                          <div className="font-medium">{category.name}</div>
                          <div className={`text-sm ${
                            filters.category === category.id ? 'text-white/80' : 'text-gray-500'
                          }`}>
                            {category.count} productos
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Patologías */}
                <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Patologías</h3>
                  <select
                    value={filters.patology}
                    onChange={(e) => setFilters({...filters, patology: e.target.value})}
                    className="w-full p-3 bg-white/50 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-medical-primary/50"
                  >
                    <option value="">Todas las patologías</option>
                    {medicalConditions.map((condition) => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>

                {/* Rango de precios */}
                <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Rango de Precios</h3>
                  <div className="space-y-4">
                    <input
                      type="range"
                      min="0"
                      max="1000000"
                      step="5000"
                      value={filters.priceRange[1]}
                      onChange={(e) => setFilters({
                        ...filters, 
                        priceRange: [filters.priceRange[0], parseInt(e.target.value)]
                      })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{formatPrice(filters.priceRange[0])}</span>
                      <span>{formatPrice(filters.priceRange[1])}</span>
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
            <div className="flex-1 space-y-6">
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
              {isLoading || isFiltering ? (
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
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
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
                          priceRange: [0, 1000000],
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