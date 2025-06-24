import React from 'react';
import { useNavigate } from 'react-router-dom';
import BlogPostForm from '../../components/Admin/BlogPostForm';
import { BlogPost } from '../../types';

// En una app real, tendrías un estado global (Zustand, Redux) o un hook para manejar los posts.
// Por ahora, simularemos la creación.

const CreateBlogPostPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCreatePost = (postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'slug' | 'readTime'>) => {
    const newPost: BlogPost = {
      ...postData,
      id: new Date().toISOString(), // ID temporal
      slug: postData.title.toLowerCase().replace(/\s+/g, '-'), // Slug simple
      readTime: Math.ceil(postData.content.length / 1000), // Cálculo simple
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('Nuevo artículo creado (simulado):', newPost);
    alert('Artículo creado con éxito (simulado).');
    
    // Aquí llamarías a tu API: createPost(newPost)
    
    navigate('/admin/blog');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Crear Nuevo Artículo</h1>
      <BlogPostForm onSubmit={handleCreatePost} />
    </div>
  );
};

export default CreateBlogPostPage; 