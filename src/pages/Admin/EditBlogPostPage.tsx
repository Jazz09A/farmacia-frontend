import React, { lazy, Suspense, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAdminPostByIdQuery, useUpdatePostMutation } from '../../hooks/queries/useBlogQueries';
import { queryKeys } from '../../hooks/queries/queryKeys';
import { BlogPostSkeleton } from '../../components/Skeleton';
import Toast from '../../components/common/Toast';

const BlogPostForm = lazy(() => import('../../components/Admin/BlogPostForm'));

const EditBlogPostPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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

  // Show toast on success and invalidate cache
  useEffect(() => {
    if (updatePostMutation.isSuccess && id) {
      // Invalidar todos los queries relacionados con este post para forzar refetch
      // Solo si la actualización fue exitosa
      const updatedPost = updatePostMutation.data;
      
      // Invalidar query del post por ID (admin)
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.blog.admin.post(id) 
      });
      
      // Invalidar query del post por slug (público) si existe
      if (updatedPost?.slug) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.blog.public.post(updatedPost.slug) 
        });
      }
      
      // Invalidar también el slug anterior si el post tenía uno diferente
      if (post?.slug && post.slug !== updatedPost?.slug) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.blog.public.post(post.slug) 
        });
      }
      
      // Invalidar listas de posts
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.blog.admin.posts() 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.blog.public.posts() 
      });
      
      // Remover el post del cache para forzar refetch completo
      queryClient.removeQueries({ 
        queryKey: queryKeys.blog.admin.post(id) 
      });
      if (updatedPost?.slug) {
        queryClient.removeQueries({ 
          queryKey: queryKeys.blog.public.post(updatedPost.slug) 
        });
      }

      setToast({ type: 'success', message: 'Artículo actualizado exitosamente' });
      setToastVisible(true);
      // Navigate after showing success message, then reload after transition
      const navigateTimer = setTimeout(() => {
        navigate('/admin/blog');
        // Reload page after navigation transition completes (allow time for route transition)
        setTimeout(() => {
          window.location.reload();
        }, 100); // Small delay to allow navigation transition to start
      }, 1500);
      return () => clearTimeout(navigateTimer);
    }
  }, [updatePostMutation.isSuccess, updatePostMutation.data, navigate, queryClient, id, post]);

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