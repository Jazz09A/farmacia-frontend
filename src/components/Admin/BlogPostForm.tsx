import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Estilos para el editor
import { BlogPost } from '../../types';

interface BlogPostFormProps {
  post?: BlogPost;
  onSubmit: (postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'slug' | 'readTime'>) => void;
  isEditing?: boolean;
}

const BlogPostForm: React.FC<BlogPostFormProps> = ({ post, onSubmit, isEditing = false }) => {
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [image, setImage] = useState('');
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (isEditing && post) {
      setTitle(post.title);
      setContent(post.content);
      setExcerpt(post.excerpt);
      setAuthor(post.author);
      setCategory(post.category);
      setTags(post.tags.join(', '));
      setImage(post.image);
      setPublished(post.published);
    }
  }, [isEditing, post]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      title,
      content,
      excerpt,
      author,
      category,
      tags: tags.split(',').map(tag => tag.trim()),
      image,
      published,
      publishedAt: published ? post?.publishedAt || new Date() : undefined,
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título del Artículo</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      {/* Content (Rich Text Editor) */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Contenido</label>
        <ReactQuill theme="snow" value={content} onChange={setContent} className="mt-1 bg-white" />
      </div>

      {/* Excerpt */}
      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">Extracto</label>
        <textarea
          id="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">Un resumen corto que se mostrará en las listas de artículos.</p>
      </div>

      {/* Author & Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-700">Autor</label>
          <input type="text" id="author" value={author} onChange={(e) => setAuthor(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoría</label>
          <input type="text" id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Etiquetas (separadas por coma)</label>
        <input type="text" id="tags" value={tags} onChange={(e) => setTags(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
      </div>

      {/* Image URL */}
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">URL de la Imagen de Portada</label>
        <input type="text" id="image" value={image} onChange={(e) => setImage(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
      </div>

      {/* Published Toggle */}
      <div className="flex items-center">
        <input
          id="published"
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="published" className="ml-2 block text-sm text-gray-900">Publicar artículo</label>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => navigate('/admin/blog')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          {isEditing ? 'Actualizar Artículo' : 'Guardar Artículo'}
        </button>
      </div>
    </form>
  );
};

export default BlogPostForm; 