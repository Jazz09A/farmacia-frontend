import React, { useState, useMemo, lazy, Suspense, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminPostsQuery, useAdminCategoriesQuery, useDeletePostMutation } from '../../hooks/queries/useBlogQueries';
import Toast from '../../components/common/Toast';
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

const ConfirmationModal = lazy(() => import('../../components/common/ConfirmationModal'));

const AdminBlogPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [postToDelete, setPostToDelete] = useState<{ id: string; title: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  // Load categories
  const { data: categories = [] } = useAdminCategoriesQuery();

  // Get category ID for filtering
  const categoryId = useMemo(() => {
    if (categoryFilter === 'all') return undefined;
    return categories.find(cat => cat.id === categoryFilter || cat.name === categoryFilter)?.id;
  }, [categoryFilter, categories]);

  // Load posts
  const { 
    data: postsResponse, 
    isLoading, 
    error: postsError 
  } = useAdminPostsQuery({
    page: currentPage,
    limit: 10,
    status_filter: statusFilter !== 'all' ? statusFilter : undefined,
    category_id: categoryId,
    search: searchTerm || undefined,
  });

  // Delete mutation
  const deletePostMutation = useDeletePostMutation();

  const blogPosts = postsResponse?.items || [];
  const totalPages = postsResponse?.pages || 1;
  const total = postsResponse?.total || 0;
  const error = postsError ? (postsError instanceof Error ? postsError.message : 'Error al cargar los artículos') : null;

  const filteredPosts = blogPosts;

  const handleDeleteRequest = (post: { id: string; title: string }) => {
    setPostToDelete(post);
  };

  // Show toast on delete success
  useEffect(() => {
    if (deletePostMutation.isSuccess) {
      setToast({ type: 'success', message: 'Artículo eliminado exitosamente' });
      setToastVisible(true);
    }
  }, [deletePostMutation.isSuccess]);

  // Show toast on delete error
  useEffect(() => {
    if (deletePostMutation.isError) {
      const errorMessage = deletePostMutation.error instanceof Error 
        ? deletePostMutation.error.message 
        : 'Error al eliminar el artículo';
      setToast({ type: 'error', message: errorMessage });
      setToastVisible(true);
    }
  }, [deletePostMutation.isError, deletePostMutation.error]);

  const handleCloseToast = () => {
    setToastVisible(false);
    setTimeout(() => setToast(null), 300);
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;

    try {
      await deletePostMutation.mutateAsync(postToDelete.id);
      setSelectedPosts(selectedPosts.filter(id => id !== postToDelete.id));
      setPostToDelete(null);
    } catch (err) {
      console.error('Error deleting post:', err);
      // Error toast is handled by useEffect
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.length === 0) return;
    if (window.confirm(`¿Estás seguro de que quieres eliminar ${selectedPosts.length} artículos?`)) {
      try {
        await Promise.all(selectedPosts.map(id => deletePostMutation.mutateAsync(id)));
        setSelectedPosts([]);
        setToast({ type: 'success', message: `${selectedPosts.length} artículo(s) eliminado(s) exitosamente` });
        setToastVisible(true);
      } catch (err) {
        console.error('Error deleting posts:', err);
        setToast({ type: 'error', message: 'Error al eliminar algunos artículos' });
        setToastVisible(true);
      }
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

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Sin publicar';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAuthorName = (post: BlogPostListItem): string => {
    if (typeof post.author === 'string') return post.author;
    return post.author?.full_name || 'Autor desconocido';
  };

  const getCategoryName = (post: BlogPostListItem): string => {
    if (typeof post.category === 'string') return post.category;
    return post.category?.name || 'Sin categoría';
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'published': return 'Publicado';
      case 'draft': return 'Borrador';
      case 'archived': return 'Archivado';
      default: return status;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Blog</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
            Administra todos los artículos de tu blog farmacéutico.
          </p>
        </div>
        <div className="w-full sm:w-auto">
          {/* Mobile Buttons */}
          <div className="sm:hidden">
            <div className="grid grid-cols-3 gap-2 mb-3">
               <button className="flex items-center justify-center px-2 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm font-medium">
                <Filter className="w-4 h-4 mr-1" />
                <span className="truncate">Filtros</span>
              </button>
              <button className="flex items-center justify-center px-2 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm font-medium">
                <Upload className="w-4 h-4 mr-1" />
                <span className="truncate">Importar</span>
              </button>
              <button className="flex items-center justify-center px-2 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm font-medium">
                <Download className="w-4 h-4 mr-1" />
                <span className="truncate">Exportar</span>
              </button>
            </div>
            <Link
              to="/admin/blog/create"
              className="w-full flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg transition-colors font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Artículo
            </Link>
          </div>
          {/* Desktop Buttons */}
          <div className="hidden sm:flex items-center space-x-3">
             <button className="flex items-center px-3 lg:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors font-medium">
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </button>
            <button className="flex items-center px-3 lg:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors font-medium">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
            <Link
              to="/admin/blog/create"
              className="px-3 lg:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Artículo
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <div className="bg-white rounded-lg shadow-md p-3 lg:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">Total Artículos</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">{total}</p>
            </div>
             <div className="p-2 lg:p-3 bg-blue-100 rounded-full flex-shrink-0">
               <FileText className="w-4 h-4 lg:w-6 lg:h-6 text-blue-600" />
             </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-3 lg:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">Publicados</p>
              <p className="text-lg lg:text-2xl font-bold text-green-600">
                {blogPosts.filter(post => post.status === 'published').length}
              </p>
            </div>
            <div className="p-2 lg:p-3 bg-green-100 rounded-full flex-shrink-0">
              <CheckCircle className="w-4 h-4 lg:w-6 lg:h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-3 lg:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">Borradores</p>
              <p className="text-lg lg:text-2xl font-bold text-yellow-600">
                {blogPosts.filter(post => post.status === 'draft').length}
              </p>
            </div>
            <div className="p-2 lg:p-3 bg-yellow-100 rounded-full flex-shrink-0">
              <Clock className="w-4 h-4 lg:w-6 lg:h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-3 lg:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">Categorías</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
            <div className="p-2 lg:p-3 bg-purple-100 rounded-full flex-shrink-0">
              <Tag className="w-4 h-4 lg:w-6 lg:h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Blog Posts List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-3 lg:p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h3 className="text-base lg:text-lg font-semibold">Artículos ({filteredPosts.length})</h3>
            {selectedPosts.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-xs lg:text-sm text-gray-500">{selectedPosts.length} seleccionados</span>
                <button 
                  onClick={handleBulkDelete}
                  className="text-red-600 hover:text-red-800 active:text-red-900 p-2 rounded-full hover:bg-red-50 active:bg-red-100 transition-colors"
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
                className="p-3 lg:p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm lg:text-base truncate">{post.title}</p>
                    <p className="text-xs lg:text-sm text-gray-500">
                      Por {getAuthorName(post)} en <span className="font-medium text-blue-600">{getCategoryName(post)}</span>
                    </p>
                  </div>
                  <div className="text-right ml-3 flex-shrink-0">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(post.status)}`}>
                      {getStatusLabel(post.status)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <p className="text-sm text-gray-500">{formatDate(post.published_at)}</p>
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
                          handleDeleteRequest({ id: post.id, title: post.title });
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
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Cargando artículos...
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No se encontraron artículos
                  </td>
                </tr>
              ) : (
                filteredPosts.map(post => (
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
                    <td className="px-6 py-4">{getAuthorName(post)}</td>
                    <td className="px-6 py-4">{getCategoryName(post)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(post.status)}`}>
                        {getStatusLabel(post.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">{formatDate(post.published_at)}</td>
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
                          handleDeleteRequest({ id: post.id, title: post.title });
                        }}
                        className="p-2 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-600"
                        title="Eliminar Artículo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
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
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </nav>
        </div>
      )}
      
      {postToDelete && (
        <Suspense fallback={<div>Cargando...</div>}>
          <ConfirmationModal
            isOpen={!!postToDelete}
            title="Confirmar Eliminación"
            message={`¿Estás seguro de que deseas eliminar el artículo "${postToDelete.title}"? Esta acción no se puede deshacer.`}
            onConfirm={handleConfirmDelete}
            onClose={() => setPostToDelete(null)}
            confirmText="Eliminar"
            cancelText="Cancelar"
          />
        </Suspense>
      )}

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={toastVisible}
          onClose={handleCloseToast}
        />
      )}
    </div>
  );
};

export default AdminBlogPage; 