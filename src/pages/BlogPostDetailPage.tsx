import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockBlogPosts } from '../data/blogMockData';
import FeaturedBlogPosts from '../components/Blog/FeaturedBlogPosts';
import { 
  Calendar, 
  User, 
  Tag, 
  ArrowLeft, 
  Clock, 
  Share2, 
  BookOpen,
  Heart,
  MessageCircle,
  ChevronRight
} from 'lucide-react';

const BlogPostDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = mockBlogPosts.find(p => p.slug === slug);

  // Artículos relacionados (misma categoría, excluyendo el actual)
  const relatedPosts = mockBlogPosts
    .filter(p => p.published && p.id !== post?.id && p.category === post?.category)
    .slice(0, 3);

  // Posts recientes para el sidebar
  const recentPosts = mockBlogPosts
    .filter(p => p.published && p.id !== post?.id)
    .sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime())
    .slice(0, 4);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <BookOpen className="w-24 h-24 mx-auto text-gray-400 mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Artículo no encontrado</h2>
          <p className="text-gray-600 mb-8">
            Lo sentimos, no pudimos encontrar el artículo que buscas.
          </p>
          <Link 
            to="/blog" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Breadcrumb */}
            <nav className="mb-8">
              <ol className="flex items-center space-x-2 text-sm text-gray-500">
                <li>
                  <Link to="/" className="hover:text-blue-600">Inicio</Link>
                </li>
                <ChevronRight className="w-4 h-4" />
                <li>
                  <Link to="/blog" className="hover:text-blue-600">Blog</Link>
                </li>
                <ChevronRight className="w-4 h-4" />
                <li>
                  <Link to={`/blog?category=${post.category}`} className="hover:text-blue-600">
                    {post.category}
                  </Link>
                </li>
                <ChevronRight className="w-4 h-4" />
                <li className="text-gray-900 font-medium truncate">{post.title}</li>
              </ol>
            </nav>

            {/* Article Header */}
            <article className="bg-white">
              {/* Category Badge */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                  {post.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Excerpt */}
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {post.excerpt}
              </p>

              {/* Metadata */}
              <div className="flex flex-wrap items-center justify-between mb-8 pb-8 border-b border-gray-200">
                <div className="flex flex-wrap items-center space-x-6 mb-4 lg:mb-0">
                  <div className="flex items-center text-gray-500">
                    <User className="w-5 h-5 mr-2" />
                    <span className="font-medium">{post.author}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>{new Date(post.publishedAt!).toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Clock className="w-5 h-5 mr-2" />
                    <span>{post.readTime} min de lectura</span>
                  </div>
                </div>

                {/* Social Share */}
                <div className="flex items-center space-x-3">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    <Heart className="w-4 h-4" />
                    <span>Me gusta</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors">
                    <Share2 className="w-4 h-4" />
                    <span>Compartir</span>
                  </button>
                </div>
              </div>

              {/* Featured Image */}
              <div className="mb-10">
                <img 
                  src={post.image || '/images/blog/default.jpg'} 
                  alt={post.title} 
                  className="w-full h-96 object-cover rounded-xl shadow-lg"
                />
              </div>

              {/* Article Content */}
              <div className="prose prose-lg max-w-none">
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>

              {/* Tags */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center flex-wrap gap-3">
                  <Tag className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-600 font-medium mr-2">Etiquetas:</span>
                  {post.tags.map(tag => (
                    <Link
                      key={tag}
                      to={`/blog?tag=${tag}`}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Comments Section */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center mb-6">
                  <MessageCircle className="w-6 h-6 mr-3 text-gray-600" />
                  <h3 className="text-2xl font-bold text-gray-900">Comentarios</h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-600 mb-4">
                    ¿Te gustó este artículo? ¡Nos encantaría conocer tu opinión!
                  </p>
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Agregar comentario
                  </button>
                </div>
              </div>
            </article>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Artículos relacionados</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map(relatedPost => (
                    <Link
                      key={relatedPost.id}
                      to={`/blog/${relatedPost.slug}`}
                      className="group block bg-gray-50 rounded-lg overflow-hidden hover:bg-white hover:shadow-lg transition-all duration-300"
                    >
                      <img
                        src={relatedPost.image}
                        alt={relatedPost.title}
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-4">
                        <span className="text-xs text-blue-600 font-semibold">
                          {relatedPost.category}
                        </span>
                        <h4 className="mt-2 font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2">
                          {relatedPost.title}
                        </h4>
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-8 sticky top-8">
              {/* Author Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {post.author.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">{post.author}</h4>
                    <p className="text-sm text-gray-600">Experto Farmacéutico</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Especialista en farmacología con más de 10 años de experiencia ayudando a pacientes.
                </p>
              </div>

              {/* Recent Posts */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Artículos recientes</h4>
                <FeaturedBlogPosts showSidebar={true} maxPosts={4} />
              </div>

              {/* Newsletter */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <h4 className="font-semibold mb-2">Mantente informado</h4>
                <p className="text-blue-100 text-sm mb-4">
                  Suscríbete para recibir los últimos artículos sobre salud.
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Tu email"
                    className="w-full px-3 py-2 text-gray-900 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <button className="w-full bg-white text-blue-600 py-2 rounded font-medium hover:bg-gray-100 transition-colors">
                    Suscribirse
                  </button>
                </div>
              </div>

              {/* Back to Blog */}
              <div className="text-center">
                <Link 
                  to="/blog" 
                  className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al blog
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostDetailPage; 