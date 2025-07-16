import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockBlogPosts } from '../../data/blogMockData';
import { BlogPost } from '../../types';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Eye,
  Calendar,
  Tag,
  User,
  FileText,
  Upload,
  Download,
  CheckCircle,
  Clock
} from 'lucide-react';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const AdminBlogPage: React.FC = () => {
  const navigate = useNavigate();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(mockBlogPosts);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);

  // Filtrar posts
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'published' && post.published) ||
                         (statusFilter === 'draft' && !post.published);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Obtener categorías únicas
  const categories = Array.from(new Set(blogPosts.map(post => post.category)));

  const handleDeleteRequest = (post: BlogPost) => {
    setPostToDelete(post);
  };

  const handleConfirmDelete = () => {
    if (!postToDelete) return;

    setBlogPosts(blogPosts.filter(p => p.id !== postToDelete.id));
    setSelectedPosts(selectedPosts.filter(id => id !== postToDelete.id));
    setPostToDelete(null);
  };

  const handleBulkDelete = () => {
    if (selectedPosts.length === 0) return;
    // Aquí podrías usar un modal de confirmación más grande si quisieras
    if (window.confirm(`¿Estás seguro de que quieres eliminar ${selectedPosts.length} artículos?`)) {
      setBlogPosts(blogPosts.filter(post => !selectedPosts.includes(post.id)));
      setSelectedPosts([]);
    }
  };

  const handleSelectPost = (id: string) => {
    setSelectedPosts(prev => 
      prev.includes(id) 
        ? prev.filter(postId => postId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedPosts.length === filteredPosts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(filteredPosts.map(post => post.id));
    }
  };

  const togglePublishStatus = (id: string) => {
    setBlogPosts(posts => 
      posts.map(post => 
        post.id === id 
          ? { 
              ...post, 
              published: !post.published,
              publishedAt: !post.published ? new Date() : undefined
            }
          : post
      )
    );
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Sin publicar';
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Blog</h1>
          <p className="mt-2 text-gray-600">
            Administra todos los artículos de tu blog farmacéutico.
          </p>
        </div>
        <div className="w-full sm:w-auto mt-4 sm:mt-0">
          {/* Mobile Buttons */}
          <div className="sm:hidden">
            <div className="grid grid-cols-3 gap-2">
               <button className="flex items-center justify-center px-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                <Filter className="w-4 h-4 mr-1" />
                Filtros
              </button>
              <button className="flex items-center justify-center px-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                <Upload className="w-4 h-4 mr-1" />
                Importar
              </button>
              <button className="flex items-center justify-center px-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                <Download className="w-4 h-4 mr-1" />
                Exportar
              </button>
            </div>
            <Link
              to="/admin/blog/create"
              className="mt-2 w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Artículo
            </Link>
          </div>
          {/* Desktop Buttons */}
          <div className="hidden sm:flex items-center space-x-3">
             <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
            <Link
              to="/admin/blog/create"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Artículo
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Artículos</p>
              <p className="text-2xl font-bold text-gray-900">{blogPosts.length}</p>
            </div>
             <div className="p-3 bg-blue-100 rounded-full">
               <FileText className="w-6 h-6 text-blue-600" />
             </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Publicados</p>
              <p className="text-2xl font-bold text-green-600">
                {blogPosts.filter(post => post.published).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Borradores</p>
              <p className="text-2xl font-bold text-yellow-600">
                {blogPosts.filter(post => !post.published).length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categorías</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Tag className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Blog Posts List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">Artículos ({filteredPosts.length})</h3>
            {selectedPosts.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">{selectedPosts.length} seleccionados</span>
                <button 
                  onClick={handleBulkDelete}
                  className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50"
                  title={`Eliminar ${selectedPosts.length} artículos`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
        </div>

         {/* Mobile View - Cards */}
        <div className="md:hidden">
          <div className="divide-y divide-gray-200">
            {filteredPosts.map(post => (
              <div 
                key={post.id} 
                className="p-4"
                onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 truncate">{post.title}</p>
                    <p className="text-sm text-gray-500">
                      Por {post.author} en <span className="font-medium text-blue-600">{post.category}</span>
                    </p>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.published ? 'Publicado' : 'Borrador'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <p className="text-sm text-gray-500">{formatDate(post.publishedAt)}</p>
                   <div className="flex items-center space-x-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/blog/edit/${post.id}`);
                        }}
                        className="p-2 text-gray-500 rounded-full hover:bg-blue-100 hover:text-blue-600"
                        title="Editar Artículo"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRequest(post);
                        }}
                        className="p-2 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-600"
                        title="Eliminar Artículo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
             <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="p-4">
                  <div className="flex items-center">
                    <input 
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
                      onChange={handleSelectAll}
                    />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3">Título</th>
                <th scope="col" className="px-6 py-3">Autor</th>
                <th scope="col" className="px-6 py-3">Categoría</th>
                <th scope="col" className="px-6 py-3">Estado</th>
                <th scope="col" className="px-6 py-3">Fecha de Publicación</th>
                <th scope="col" className="px-6 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map(post => (
                <tr 
                  key={post.id}
                  className="bg-white border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
                >
                  <td className="w-4 p-4">
                    <div className="flex items-center">
                       <input 
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        checked={selectedPosts.includes(post.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectPost(post.id);
                        }}
                      />
                    </div>
                  </td>
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {post.title}
                  </th>
                  <td className="px-6 py-4">{post.author}</td>
                  <td className="px-6 py-4">{post.category}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.published ? 'Publicado' : 'Borrador'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{formatDate(post.publishedAt)}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                       <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/blog/edit/${post.id}`);
                        }}
                        className="p-2 text-gray-500 rounded-full hover:bg-blue-100 hover:text-blue-600"
                        title="Editar Artículo"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRequest(post);
                        }}
                        className="p-2 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-600"
                        title="Eliminar Artículo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {postToDelete && (
        <ConfirmationModal
          isOpen={!!postToDelete}
          title="Confirmar Eliminación"
          message={`¿Estás seguro de que deseas eliminar el artículo "${postToDelete.title}"? Esta acción no se puede deshacer.`}
          onConfirm={handleConfirmDelete}
          onClose={() => setPostToDelete(null)}
          confirmText="Eliminar"
          cancelText="Cancelar"
        />
      )}
    </div>
  );
};

export default AdminBlogPage; 