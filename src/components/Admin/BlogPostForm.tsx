import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Estilos para el editor
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminCategoriesQuery, usePostImagesQuery, useUploadPostImageMutation, useDeleteImageMutation } from '../../hooks/queries/useBlogQueries';
import { BlogPostDetail } from '../../types';
import { Upload, Check, Image as ImageIcon, Trash2, Loader2 } from 'lucide-react';
import Toast from '../common/Toast';
import { getApiUrl } from '../../config';

interface BlogPostFormProps {
  post?: BlogPostDetail;
  onSubmit: (postData: {
    title: string;
    content: string;
    category_id: string;
    author_name?: string;
    featured_image_url?: string;
    status: 'draft' | 'published' | 'archived';
  }) => void;
  isEditing?: boolean;
}

const BlogPostForm: React.FC<BlogPostFormProps> = ({ post, onSubmit, isEditing = false }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [loadedPostId, setLoadedPostId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedImageForFeatured, setSelectedImageForFeatured] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  // Load categories
  const { data: categories = [], isLoading: isLoadingCategories } = useAdminCategoriesQuery();

  // Load images for the post (only when editing)
  const { 
    data: imagesResponse, 
    isLoading: isLoadingImages,
    refetch: refetchImages 
  } = usePostImagesQuery(post?.id || '', isEditing && !!post?.id);

  const images = imagesResponse?.images || [];

  // Upload and delete mutations
  const uploadImageMutation = useUploadPostImageMutation();
  const deleteImageMutation = useDeleteImageMutation();

  // Show toast on upload success
  useEffect(() => {
    if (uploadImageMutation.isSuccess) {
      setToast({ type: 'success', message: 'Imagen subida exitosamente' });
      setToastVisible(true);
      setUploadError(null);
    }
  }, [uploadImageMutation.isSuccess]);

  // Show toast on upload error
  useEffect(() => {
    if (uploadImageMutation.isError) {
      const errorMessage = uploadImageMutation.error instanceof Error 
        ? uploadImageMutation.error.message 
        : 'Error al subir la imagen';
      setToast({ type: 'error', message: errorMessage });
      setToastVisible(true);
      setUploadError(errorMessage);
    }
  }, [uploadImageMutation.isError, uploadImageMutation.error]);

  // Show toast on delete success
  useEffect(() => {
    if (deleteImageMutation.isSuccess) {
      setToast({ type: 'success', message: 'Imagen eliminada exitosamente' });
      setToastVisible(true);
    }
  }, [deleteImageMutation.isSuccess]);

  // Show toast on delete error
  useEffect(() => {
    if (deleteImageMutation.isError) {
      const errorMessage = deleteImageMutation.error instanceof Error 
        ? deleteImageMutation.error.message 
        : 'Error al eliminar la imagen';
      setToast({ type: 'error', message: errorMessage });
      setToastVisible(true);
    }
  }, [deleteImageMutation.isError, deleteImageMutation.error]);

  const handleCloseToast = () => {
    setToastVisible(false);
    setTimeout(() => setToast(null), 300);
  };

  // Build absolute image URL when the API returns relative paths (e.g. /api/v1/...)
  const apiOrigin = React.useMemo(() => {
    try {
      return new URL(getApiUrl('')).origin;
    } catch {
      return '';
    }
  }, []);

  const resolveImageUrl = (url: string): string => {
    if (!url) return '/images/blog/default.jpg';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/api/')) return `${apiOrigin}${url}`;
    return url;
  };

  // Load post data when editing, only once per post id (evita sobrescribir estado al refetch)
  useEffect(() => {
    if (isEditing && post && post.id !== loadedPostId) {
      setTitle(post.title);
      setContent(post.content);
      setCategoryId(post.category_id);
      setAuthorName(post.author?.full_name || '');
      setFeaturedImageUrl(resolveImageUrl(post.featured_image_url || ''));
      setStatus(post.status);
      setLoadedPostId(post.id);
    }
  }, [isEditing, post, loadedPostId, resolveImageUrl]);

  // Set featured image from loaded images if not set
  useEffect(() => {
    if (isEditing && post && images.length > 0 && !featuredImageUrl) {
      const firstImageUrl = resolveImageUrl(images[0].image_url);
      setFeaturedImageUrl(firstImageUrl);
      setSelectedImageForFeatured(firstImageUrl);
    }
  }, [images, featuredImageUrl, isEditing, post, resolveImageUrl]);

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !post?.id) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Formato no válido. Solo se permiten JPEG, PNG y WEBP.');
      return;
    }

    // Validate file size (6MB max)
    if (file.size > 6 * 1024 * 1024) {
      setUploadError('El archivo es demasiado grande. Tamaño máximo: 6MB.');
      return;
    }

    setUploadError(null);

    try {
      const result = await uploadImageMutation.mutateAsync({
        postId: post.id,
        file,
      });
      
      // If no featured image is set, use the newly uploaded one
      if (!featuredImageUrl) {
        const resolved = resolveImageUrl(result.image_url);
        setFeaturedImageUrl(resolved);
        setSelectedImageForFeatured(resolved);
      }
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      // Error toast is handled by useEffect
    }
  };

  // Handle image deletion
  const handleDeleteImage = async (imageId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta imagen?')) return;
    if (!post?.id) return;

    try {
      await deleteImageMutation.mutateAsync({
        imageId,
        postId: post.id,
      });
      
      // If deleted image was featured, clear featured image
      const deletedImage = images.find(img => img.id === imageId);
      if (deletedImage && featuredImageUrl === deletedImage.image_url) {
        setFeaturedImageUrl('');
        setSelectedImageForFeatured(null);
      }
    } catch (err) {
      console.error('Error deleting image:', err);
      // Error toast is handled by useEffect
    }
  };

  // Handle set featured image
  const handleSetFeaturedImage = (imageUrl: string) => {
    const resolved = resolveImageUrl(imageUrl);
    console.log('[BlogPostForm] set featured image', { imageUrl, resolved });
    setFeaturedImageUrl(resolved);
    setSelectedImageForFeatured(resolved);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      title,
      content,
      category_id: categoryId,
      author_name: authorName.trim() || undefined,
      featured_image_url: featuredImageUrl || undefined,
      status,
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
        <p className="text-xs text-gray-500 mt-1">El extracto se generará automáticamente desde el contenido.</p>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoría</label>
        {isLoadingCategories ? (
          <div className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-gray-500">
            Cargando categorías...
          </div>
        ) : (
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value="">Selecciona una categoría</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Author Name */}
      <div>
        <label htmlFor="authorName" className="block text-sm font-medium text-gray-700">
          Nombre del Autor
        </label>
        <input
          type="text"
          id="authorName"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Ej: Dr. Juan Pérez"
        />
        <p className="text-xs text-gray-500 mt-1">
          {isEditing 
            ? 'Puedes actualizar el nombre del autor del artículo.'
            : 'Si no se proporciona, se usará el nombre del usuario autenticado.'}
        </p>
      </div>

      {/* Image Gallery (only when editing) */}
      {isEditing && post && (
        <div className="border-t border-gray-200 pt-6 space-y-4">
          {/* Featured image summary */}
          <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="w-16 h-16 rounded-md overflow-hidden bg-white border border-blue-100">
              <img
                src={featuredImageUrl || '/images/blog/default.jpg'}
                alt="Imagen destacada actual"
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (img.src.includes('/images/blog/default.jpg')) {
                    img.onerror = null;
                    return;
                  }
                  img.src = '/images/blog/default.jpg';
                  img.onerror = null;
                }}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900">Imagen de portada actual</p>
              <p className="text-xs text-blue-800">Selecciona una de la galería o sube una nueva para cambiarla.</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">Galería de Imágenes</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploadImageMutation.isPending}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadImageMutation.isPending}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {uploadImageMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Imagen
                </>
              )}
            </button>
          </div>

          {uploadError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{uploadError}</p>
            </div>
          )}

          {/* Upload Animation Overlay */}
          <AnimatePresence>
            {uploadImageMutation.isPending && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative mb-4 p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg overflow-hidden"
              >
                <div className="flex flex-col items-center justify-center">
                  {/* Animated Spinner */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mb-4"
                  >
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent"></div>
                    </div>
                  </motion.div>
                  
                  {/* Pulsing Icon */}
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="mb-3"
                  >
                    <Upload className="w-8 h-8 text-blue-600" />
                  </motion.div>
                  
                  {/* Text */}
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg font-semibold text-gray-800 mb-2"
                  >
                    Subiendo imagen...
                  </motion.h3>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-sm text-gray-600"
                  >
                    Por favor espera mientras se procesa tu imagen
                  </motion.p>
                  
                  {/* Progress Bar Animation */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="mt-4 w-full max-w-xs h-2 bg-blue-200 rounded-full overflow-hidden"
                  >
                    <motion.div
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="h-full w-1/3 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                    />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoadingImages ? (
            <div className="text-center py-8 text-gray-500">Cargando imágenes...</div>
          ) : images.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">No hay imágenes subidas</p>
              <p className="text-xs text-gray-400 mt-1">Haz clic en "Subir Imagen" para agregar imágenes</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => {
                const isFeatured = featuredImageUrl === image.image_url;
                return (
                  <div
                    key={image.id}
                    className={`relative group border-2 rounded-lg overflow-hidden ${
                      isFeatured ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                    }`}
                  >
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={resolveImageUrl(image.image_url)}
                        alt={image.description || 'Imagen del blog'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          if (img.src.includes('/images/blog/default.jpg')) {
                            img.onerror = null;
                            return;
                          }
                          img.src = '/images/blog/default.jpg';
                          img.onerror = null; // Evita loops y nuevas peticiones
                        }}
                      />
                    </div>
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSetFeaturedImage(image.image_url)}
                        className={`opacity-0 group-hover:opacity-100 px-3 py-1.5 rounded text-xs font-medium transition-opacity ${
                          isFeatured
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                        title="Establecer como imagen destacada"
                      >
                        {isFeatured ? (
                          <>
                            <Check className="w-3 h-3 inline mr-1" />
                            Destacada
                          </>
                        ) : (
                          'Destacar'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(image.id)}
                        className="opacity-0 group-hover:opacity-100 px-3 py-1.5 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-opacity"
                        title="Eliminar imagen"
                      >
                        <Trash2 className="w-3 h-3 inline mr-1" />
                        Eliminar
                      </button>
                    </div>

                    {/* Featured badge */}
                    {isFeatured && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold flex items-center">
                        <Check className="w-3 h-3 mr-1" />
                        Destacada
                      </div>
                    )}

                    {/* Image info */}
                    {image.description && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-2 truncate">
                        {image.description}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Featured Image URL */}
      <div>
        {/* Campo de URL ocultado para no confundir al usuario final; se puede reactivar si se necesita carga externa */}
      </div>

      {/* Status */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado</label>
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
            {status === 'published' ? 'Visible al público' : status === 'draft' ? 'Solo borrador' : 'Archivado'}
          </span>
        </div>
        <div className="relative">
          <select
            id="status"
            value={status}
            onChange={(e) => {
              const value = e.target.value as 'draft' | 'published' | 'archived';
              console.log('[BlogPostForm] set status from select', { from: status, to: value });
              setStatus(value);
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="archived">Archivado</option>
          </select>
        </div>
        <p className="text-xs text-gray-600">
          {status === 'published' && 'El artículo será visible públicamente.'}
          {status === 'draft' && 'Se guarda como borrador; no será visible hasta publicarlo.'}
          {status === 'archived' && 'Quedará oculto del sitio, pero no se elimina.'}
        </p>
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

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={toastVisible}
          onClose={handleCloseToast}
        />
      )}
    </form>
  );
};

export default BlogPostForm; 