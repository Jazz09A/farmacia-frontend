import React, { lazy, Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BlogPost } from '../../types';
import { mockBlogPosts } from '../../data/blogMockData';
import { BlogPostSkeleton } from '../../components/Skeleton';

const BlogPostForm = lazy(() => import('../../components/Admin/BlogPostForm'));

const EditBlogPostPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // En una app real, aquí harías una petición a la API para obtener el post por su ID
  const postToEdit = mockBlogPosts.find(p => p.id === id);

  const handleUpdatePost = (postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'slug' | 'readTime'>) => {
    if (!postToEdit) return;

    const updatedPost: BlogPost = {
      ...postToEdit,
      ...postData,
      slug: postData.title.toLowerCase().replace(/\s+/g, '-'),
      readTime: Math.ceil(postData.content.length / 1000),
      updatedAt: new Date(),
    };

    // TODO: Implementar actualización real
    alert('Artículo actualizado con éxito (simulado).');

    // Aquí llamarías a tu API: updatePost(id, updatedPost)

    navigate('/admin/blog');
  };

  if (!postToEdit) {
    return <div className="text-center text-red-500">Artículo no encontrado.</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Editar Artículo</h1>
      <Suspense fallback={<BlogPostSkeleton />}>
        <BlogPostForm onSubmit={handleUpdatePost} post={postToEdit} isEditing />
      </Suspense>
    </div>
  );
};

export default EditBlogPostPage; 