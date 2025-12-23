import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BlogPost, BlogPostListItem } from '../../types';
import { Calendar, User } from 'lucide-react';
import { getApiUrl } from '../../config';

interface BlogPostCardProps {
  post: BlogPost | BlogPostListItem;
}

/**
 * Componente de tarjeta de blog con optimizaciones de carga de imagen:
 * - Shimmer placeholder mientras carga
 * - Lazy loading nativo
 * - Transición suave al cargar
 * - Fallback a imagen por defecto si falla
 */
const BlogPostCard: React.FC<BlogPostCardProps> = ({ post }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Helper functions to extract data from both old and new structures
  const getAuthorName = (): string => {
    if (typeof post.author === 'string') {
      return post.author;
    }
    return post.author?.full_name || 'Autor desconocido';
  };

  const getCategoryName = (): string => {
    if (typeof post.category === 'string') {
      return post.category;
    }
    return post.category?.name || 'Sin categoría';
  };

  const resolveImageUrl = (url?: string): string => {
    if (!url) return '/images/blog/default.jpg';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/api/')) {
      // Ensure single slash join
      return `${getApiUrl('').replace(/\/$/, '')}${url}`;
    }
    return url;
  };

  const getImageUrl = (): string => {
    // Try featured_image_url first (new API structure)
    if ('featured_image_url' in post && post.featured_image_url) {
      return resolveImageUrl(post.featured_image_url);
    }
    // Try images array (new API structure)
    if ('images' in post && post.images && post.images.length > 0) {
      return resolveImageUrl(post.images[0]);
    }
    // Fallback to old image field
    if ('image' in post && post.image) {
      return resolveImageUrl(post.image);
    }
    return '/images/blog/default.jpg';
  };

  const getPublishedDate = (): Date | null => {
    if ('published_at' in post && post.published_at) {
      return new Date(post.published_at);
    }
    if ('publishedAt' in post && post.publishedAt) {
      return post.publishedAt instanceof Date ? post.publishedAt : new Date(post.publishedAt);
    }
    return null;
  };

  const publishedDate = getPublishedDate();
  const imageUrl = getImageUrl();
  const isDefaultImage = imageUrl === '/images/blog/default.jpg';

  // Handle image error - prevent infinite loop
  const handleImageError = React.useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setHasError(true);
    // Only set default if it's not already the default image
    if (img.src !== window.location.origin + '/images/blog/default.jpg' && !isDefaultImage) {
      img.src = '/images/blog/default.jpg';
      // Prevent further error handling
      img.onerror = null;
    }
  }, [isDefaultImage]);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  return (
    <Link to={`/blog/${post.slug}`} className="block group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
        {/* Shimmer placeholder - visible mientras carga */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
              style={{
                animation: 'shimmer 1.5s infinite',
                transform: 'translateX(-100%)'
              }}
            />
          </div>
        )}
        
        <img 
          src={imageUrl} 
          alt={post.title} 
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy" 
          decoding="async"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
      <div className="p-6">
        <p className="text-sm text-blue-600 font-semibold">{getCategoryName()}</p>
        <h3 className="mt-2 text-xl font-bold text-gray-800 group-hover:text-blue-700">{post.title}</h3>
        <p className="mt-3 text-gray-600 text-sm">{post.excerpt}</p>
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <User className="w-4 h-4 mr-2" />
            <span>{getAuthorName()}</span>
          </div>
          {publishedDate && (
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{publishedDate.toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default BlogPostCard;
