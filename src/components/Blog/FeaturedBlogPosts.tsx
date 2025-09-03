import React from 'react';
import { Link } from 'react-router-dom';
import { mockBlogPosts } from '../../data/blogMockData';
import { ArrowRight, Calendar, Clock, User, ChevronRight } from 'lucide-react';

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
  // Tomar los últimos artículos publicados y ordenados por fecha
  const featuredPosts = mockBlogPosts
    .filter(post => post.published)
    .sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime())
    .slice(0, maxPosts);

  if (showSidebar) {
    // Versión compacta para sidebar
    return (
      <div className="space-y-4">
        {featuredPosts.map(post => (
          <Link 
            key={post.id} 
            to={`/blog/${post.slug}`} 
            className="flex items-start space-x-3 group hover:bg-gray-50 p-3 rounded-lg transition-colors"
          >
            <img
              src={post.image}
              alt={post.title}
              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 mb-1 line-clamp-2">
                {post.title}
              </h4>
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(post.publishedAt!).toLocaleDateString('es-ES')}
              </div>
              <div className="flex items-center mt-1 text-xs text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                {post.readTime} min lectura
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
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{title}</h2>
          <p className="text-lg text-gray-600">
            Consejos, noticias y artículos de salud escritos por nuestros expertos farmacéuticos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredPosts.map((post, index) => (
            <Link 
              key={post.id} 
              to={`/blog/${post.slug}`} 
              className={`block group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 ${
                index === 0 && featuredPosts.length > 1 ? 'md:col-span-2 lg:col-span-1' : ''
              }`}
            >
              <div className="relative overflow-hidden">
                <img 
                  src={post.image || '/images/blog/default.jpg'} 
                  alt={post.title} 
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {post.category}
                  </span>
                </div>
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {post.readTime} min
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
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{new Date(post.publishedAt!).toLocaleDateString('es-ES')}</span>
                  </div>
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
      </div>
    </div>
  );
};

export default FeaturedBlogPosts; 