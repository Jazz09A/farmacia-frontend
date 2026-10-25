import React from 'react';
import { Link } from 'react-router-dom';
import { usePublicPostsQuery } from '../../hooks/queries/useBlogQueries';
import { ArrowRight, Calendar, Clock, User, ChevronRight } from 'lucide-react';
import { BlogPostSkeleton } from '../Skeleton';
import { BlogPostListItem } from '../../types';
import { resolveImageUrl } from '../../utils/imageOptimization';
interface FeaturedBlogPostsProps {
  showSidebar?: boolean;
  maxPosts?: number;
  title?: string;
}

const FeaturedBlogPosts: React.FC<FeaturedBlogPostsProps> = ({ 
  showSidebar = false, 
  maxPosts = 3,
  title = "Últimos Artículos de Nuestro Blog"
}) => {
  const { 
    data: postsResponse, 
    isLoading, 
    error: postsError 
  } = usePublicPostsQuery({
    page: 1,
    limit: maxPosts,
  });

  const featuredPosts = postsResponse?.items.slice(0, maxPosts) || [];
  const error = postsError ? 'Error al cargar los artículos' : null;

  // Helper functions
  const getAuthorName = (post: BlogPostListItem): string => {
    if (typeof post.author === 'string') return post.author;
    return post.author?.full_name || 'Autor desconocido';
  };

  const getCategoryName = (post: BlogPostListItem): string => {
    if (typeof post.category === 'string') return post.category;
    return post.category?.name || 'Sin categoría';
  };

  const getImageUrl = (post: BlogPostListItem): string => {
    let url: string | undefined;
    
    if (post.featured_image_url) {
      url = post.featured_image_url;
    } else if (post.images && post.images.length > 0) {
      url = post.images[0];
    } else {
    return '/images/blog/default.jpg';
    }

    const resolvedUrl = resolveImageUrl(url);
    return resolvedUrl;
  };

  const getReadTime = (post: BlogPostListItem): number => {
    // Estimate read time from excerpt (roughly 200 words per minute)
    const words = post.excerpt.split(' ').length;
    return Math.max(1, Math.ceil(words / 200));
  };

  if (showSidebar) {
    // Versión compacta para sidebar
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(maxPosts)].map((_, index) => (
            <div key={index} className="flex items-start space-x-3 p-3">
              <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error || featuredPosts.length === 0) {
      return (
        <div className="text-center text-gray-500 text-sm py-4">
          {error || 'No hay artículos disponibles'}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {featuredPosts.map(post => (
          <Link 
            key={post.id} 
            to={`/blog/${post.slug}`} 
            className="flex items-start space-x-3 group hover:bg-gray-50 p-3 rounded-lg transition-colors"
          >
            <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={getImageUrl(post)}
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
              <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 mb-1 line-clamp-2">
                {post.title}
              </h4>
              {post.published_at && (
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(post.published_at).toLocaleDateString('es-ES')}
                </div>
              )}
              <div className="flex items-center mt-1 text-xs text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                {getReadTime(post)} min lectura
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
          </Link>
        ))}
      </div>
    );
  }

  // Versión completa para la página principal
  return (
    <div data-testid="blog-section" className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{title}</h2>
          <p className="text-lg text-gray-600">
            Consejos, noticias y artículos de salud escritos por nuestros expertos farmacéuticos
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(maxPosts)].map((_, index) => (
              <BlogPostSkeleton key={index} />
            ))}
          </div>
        ) : error || featuredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">{error || 'No hay artículos disponibles en este momento.'}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post, index) => (
                <Link 
                  key={post.id} 
                  to={`/blog/${post.slug}`} 
                  className={`block group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 ${
                    index === 0 && featuredPosts.length > 1 ? 'md:col-span-2 lg:col-span-1' : ''
                  }`}
                >
                  <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
                    <img 
                      src={getImageUrl(post)} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
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
                    <div className="absolute top-4 left-4">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {getCategoryName(post)}
                      </span>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {getReadTime(post)} min
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 mb-3 line-clamp-2 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="w-4 h-4 mr-2" />
                        <span>{getAuthorName(post)}</span>
                      </div>
                      {post.published_at && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{new Date(post.published_at).toLocaleDateString('es-ES')}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center mt-4 text-blue-600 font-semibold group-hover:text-blue-800 transition-colors">
                      <span>Leer más</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* CTA Bottom */}
            <div className="text-center mt-12">
              <Link 
                to="/blog" 
                className="inline-flex items-center bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                Ver todos los artículos
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FeaturedBlogPosts; 
