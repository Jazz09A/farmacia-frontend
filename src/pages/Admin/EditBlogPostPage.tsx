import React, { lazy, Suspense, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminPostByIdQuery, useUpdatePostMutation } from '../../hooks/queries/useBlogQueries';
import { BlogPostSkeleton } from '../../components/Skeleton';
import Toast from '../../components/common/Toast';

const BlogPostForm = lazy(() => import('../../components/Admin/BlogPostForm'));

const EditBlogPostPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  
  // Load post data
  const { 
    data: post, 
    isLoading, 
    error: postError 
  } = useAdminPostByIdQuery(id || '', false, !!id);

  // Update mutation
  const updatePostMutation = useUpdatePostMutation();

  // Show toast on success
  useEffect(() => {
    if (updatePostMutation.isSuccess) {
      setToast({ type: 'success', message: 'Artículo actualizado exitosamente' });
      setToastVisible(true);
      // Navigate after showing success message
      const timer = setTimeout(() => {
        navigate('/admin/blog');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [updatePostMutation.isSuccess, navigate]);

  // Show toast on error
  useEffect(() => {
    if (updatePostMutation.isError) {
      const errorMessage = updatePostMutation.error instanceof Error 
        ? updatePostMutation.error.message 
        : 'Error al actualizar el artículo';
      setToast({ type: 'error', message: errorMessage });
      setToastVisible(true);
    }
  }, [updatePostMutation.isError, updatePostMutation.error]);

  const handleUpdatePost = async (postData: {
    title: string;
    content: string;
    category_id: string;
    author_name?: string;
    featured_image_url?: string;
    status: 'draft' | 'published' | 'archived';
  }) => {
    if (!id) return;

    try {
      await updatePostMutation.mutateAsync({ postId: id, data: postData });
    } catch (err) {
      console.error('Error updating post:', err);
      // Error toast is handled by useEffect
    }
  };

  const handleCloseToast = () => {
    setToastVisible(false);
    setTimeout(() => setToast(null), 300);
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Editar Artículo</h1>
        <BlogPostSkeleton />
      </div>
    );
  }

  const error = postError ? (postError instanceof Error ? postError.message : 'Error al cargar el artículo') : null;

  if (error && !post) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => navigate('/admin/blog')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Volver al listado
        </button>
      </div>
    );
  }

  if (!post) {
    return <div className="text-center text-red-500">Artículo no encontrado.</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Editar Artículo</h1>
      <Suspense fallback={<BlogPostSkeleton />}>
        <BlogPostForm onSubmit={handleUpdatePost} post={post} isEditing />
      </Suspense>
      {updatePostMutation.isPending && (
        <div className="mt-4 text-center text-gray-600">
          Guardando cambios...
        </div>
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

export default EditBlogPostPage; 