import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreatePostMutation } from '../../hooks/queries/useBlogQueries';
import Toast from '../../components/common/Toast';
import BlogPostForm from '../../components/Admin/BlogPostForm';

const CreateBlogPostPage: React.FC = () => {
  const navigate = useNavigate();
  const createPostMutation = useCreatePostMutation();
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  // Show toast on success
  useEffect(() => {
    if (createPostMutation.isSuccess) {
      setToast({ type: 'success', message: 'Artículo creado exitosamente' });
      setToastVisible(true);
      // Navigate after showing success message
      const timer = setTimeout(() => {
        navigate('/admin/blog');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [createPostMutation.isSuccess, navigate]);

  // Show toast on error
  useEffect(() => {
    if (createPostMutation.isError) {
      const errorMessage = createPostMutation.error instanceof Error 
        ? createPostMutation.error.message 
        : 'Error al crear el artículo';
      setToast({ type: 'error', message: errorMessage });
      setToastVisible(true);
    }
  }, [createPostMutation.isError, createPostMutation.error]);

  const handleCreatePost = async (postData: {
    title: string;
    content: string;
    category_id: string;
    author_name?: string;
    featured_image_url?: string;
    status: 'draft' | 'published' | 'archived';
  }) => {
    try {
      await createPostMutation.mutateAsync(postData);
    } catch (err) {
      console.error('Error creating post:', err);
      // Error toast is handled by useEffect
    }
  };

  const handleCloseToast = () => {
    setToastVisible(false);
    setTimeout(() => setToast(null), 300);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Crear Nuevo Artículo</h1>
      <BlogPostForm onSubmit={handleCreatePost} />
      {createPostMutation.isPending && (
        <div className="mt-4 text-center text-gray-600">
          Guardando artículo...
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

export default CreateBlogPostPage; 