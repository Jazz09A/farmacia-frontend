import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import BlogPostCard from '../components/Blog/BlogPostCard';
import { usePublicPostsQuery, usePublicCategoriesQuery } from '../hooks/queries/useBlogQueries';
import { Search, Calendar, Tag, TrendingUp, Loader2 } from 'lucide-react';
import { BlogPostSkeleton, SkeletonBase } from '../components/Skeleton';
import { BlogCategory } from '../types';
import { BlogPostListItem } from '../types';
const BlogPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageChanging, setIsPageChanging] = useState(false);
  
  const postsPerPage = 6;
  const postsContainerRef = useRef<HTMLDivElement>(null);

  // Load categories
  const { data: categories = [], isLoading: isLoadingCategories } = usePublicCategoriesQuery();

  // Get category slug for filtering
  const categorySlug = useMemo(() => {
    if (selectedCategory === 'all') return undefined;
    return categories.find(cat => cat.name === selectedCategory || cat.slug === selectedCategory)?.slug;
  }, [selectedCategory, categories]);

  // Load posts
  const { 
    data: postsResponse, 
    isLoading: isLoadingPosts, 
    error: postsError 
  } = usePublicPostsQuery({
    page: currentPage,
    limit: postsPerPage,
    category_slug: categorySlug,
    search: searchTerm || undefined,
  });

  const posts = postsResponse?.items || [];
  const totalPages = postsResponse?.pages || 1;
  const total = postsResponse?.total || 0;
  const isLoading = isLoadingPosts || isLoadingCategories;
  const error = postsError ? (postsError instanceof Error ? postsError.message : 'Error al cargar los artículos') : null;

  // Featured posts (first 4 posts, excluding current category)
  const featuredPosts = posts
    .filter(post => {
      const categoryName = typeof post.category === 'string' 
        ? post.category 
        : post.category?.name;
      return selectedCategory === 'all' || categoryName !== selectedCategory;
    })
    .slice(0, 4);

  const handlePageChange = useCallback((page: number) => {
    if (page === currentPage) return;
    
    setIsPageChanging(true);
    setCurrentPage(page);
    
    // Scroll suave hacia el contenedor de posts
    if (postsContainerRef.current) {
      const offsetTop = postsContainerRef.current.offsetTop - 120;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  // Desactivar estado de loading cuando terminan de cargar los posts
  useEffect(() => {
    if (!isLoadingPosts && isPageChanging) {
      const timer = setTimeout(() => {
        setIsPageChanging(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoadingPosts, isPageChanging]);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  }, []);

  // Helper to get category name
  const getCategoryName = (category: string | BlogCategory): string => {
    if (typeof category === 'string') return category;
    return category.name;
  };

  // Helper to get image URL - memoized to prevent re-renders
  const getPostImage = React.useCallback((post: BlogPostListItem): string => {
    if (post.featured_image_url) return post.featured_image_url;
    if (post.images && post.images.length > 0) return post.images[0];
    return '/images/blog/default.jpg';
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Blog de Salud y Bienestar
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Descubre consejos, noticias y artículos de interés sobre salud, medicamentos y bienestar, 
            escritos por nuestros expertos farmacéuticos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar artículos
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Título, contenido o etiquetas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todas las categorías</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Category Tags */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  Todas
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.name)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category.name
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Summary */}
            {(searchTerm || selectedCategory !== 'all') && (
              <div className="mb-6">
                <p className="text-gray-600">
                  Se encontraron <span className="font-semibold">{total}</span> 
                  {total === 1 ? ' resultado' : ' resultados'}
                  {searchTerm && ` para "${searchTerm}"`}
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Blog Posts Grid */}
            <div ref={postsContainerRef} className="relative">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  {[...Array(6)].map((_, index) => (
                    <BlogPostSkeleton key={index} />
                  ))}
                </div>
              ) : posts.length > 0 ? (
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 transition-opacity duration-300 ${
                  isPageChanging ? 'opacity-50' : 'opacity-100'
                }`}>
                  {posts.map(post => (
                    <BlogPostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Search className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    No se encontraron artículos
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm || selectedCategory !== 'all'
                      ? 'Intenta ajustar tus filtros para encontrar lo que buscas.'
                      : 'Aún no hay artículos publicados en el blog.'}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </nav>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-8">
              {/* Featured Posts */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Artículos Destacados</h3>
                </div>
                <div className="space-y-4">
                  {isLoading ? (
                    [...Array(4)].map((_, index) => (
                      <div key={index} className="flex items-start space-x-3 p-2">
                        <SkeletonBase width="4rem" height="4rem" rounded="lg" />
                        <div className="flex-1 space-y-2">
                          <SkeletonBase height="1rem" width="90%" />
                          <SkeletonBase height="1rem" width="70%" />
                          <SkeletonBase height="0.75rem" width="50%" />
                        </div>
                      </div>
                    ))
                  ) : (
                    featuredPosts.map(post => (
                      <div key={post.id} className="group">
                        <a 
                          href={`/blog/${post.slug}`}
                          className="flex items-start space-x-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                        >
                          <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                            <img
                              src={getPostImage(post)}
                              alt={post.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                const img = e.currentTarget;
                                // Only set default if it's not already the default image
                                if (!img.src.includes('/images/blog/default.jpg')) {
                                  img.src = '/images/blog/default.jpg';
                                  // Prevent further error handling
                                  img.onerror = null;
                                }
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2">
                              {post.title}
                            </h4>
                            {post.published_at && (
                              <div className="flex items-center mt-1 text-xs text-gray-500">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(post.published_at).toLocaleDateString('es-ES')}
                              </div>
                            )}
                          </div>
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <Tag className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Categorías</h3>
                </div>
                <div className="space-y-2">
                  {categories.map(category => {
                    const count = posts.filter(post => {
                      const categoryName = typeof post.category === 'string' 
                        ? post.category 
                        : post.category?.name;
                      return categoryName === category.name;
                    }).length;
                    return (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryChange(category.name)}
                        className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <span className="text-sm text-gray-700">{category.name}</span>
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Suscríbete a nuestra newsletter</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Recibe los últimos artículos y consejos de salud directamente en tu email.
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Tu email"
                    className="w-full px-3 py-2 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <button className="w-full bg-white text-blue-600 py-2 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                    Suscribirse
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage; 