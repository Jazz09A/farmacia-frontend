import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { 
  ArrowLeft, 
  Save, 
  X, 
  Image as ImageIcon,
  AlertCircle,
  Package,
  DollarSign,
  Tag,
  Layers,
  Info,
  Edit3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { productService } from '../../services/ProductService';
import { Product } from '../../types';
import { productImageService } from '../../services/ProductImageService';
import { ImageEditor } from '../../components/Admin/ImageEditor';

interface ProductFormData extends Omit<Product, 'id'> {
  meta_description?: string;
  seo_keywords?: string;
  weight?: number;
  dimensions?: string;
  manufacturer?: string;
  expiry_date?: string;
  batch_number?: string;
}

const AdminEditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProductFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('general');
  const [showUnsavedChanges, setShowUnsavedChanges] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [isImageOperationLoading, setIsImageOperationLoading] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [imageToEdit, setImageToEdit] = useState<string>('');
  const [imageIndexToEdit, setImageIndexToEdit] = useState<number>(-1);
  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        try {
          const productData = await productService.getProductById(id);
          if (productData) {
            setFormData(processedData);
          }
        } catch (error) {
          console.error('Error fetching product:', error);
        }
      }
      setIsLoading(false);
    };
    fetchProduct();
  }, [id]);

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    if (!formData) return;
    setFormData(prev => ({ ...prev!, [field]: value }));
    setShowUnsavedChanges(true);
    
    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData) return false;
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del producto es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!formData.brand.trim()) {
      newErrors.brand = 'La marca es requerida';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'La categoría es requerida';
    }

    if (typeof formData.price === 'string' ? parseFloat(formData.price) <= 0 : formData.price <= 0) {
      newErrors.price = 'El precio en USD debe ser mayor a 0';
    }

    if (!formData.image?.trim()) {
      newErrors.image = 'La imagen del producto es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    // Los artículos de Profit Plus son de solo lectura
    // Solo se pueden subir imágenes, no editar otros campos
    alert('Los artículos de Profit Plus son de solo lectura. Solo puedes subir imágenes usando el botón de carga de imágenes.');
    setShowUnsavedChanges(false);
  };

  const handleCancel = () => {
    if (showUnsavedChanges) {
      if (window.confirm('¿Estás seguro? Se perderán los cambios no guardados.')) {
        navigate('/admin/products');
      }
    } else {
      navigate('/admin/products');
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && id) {
      setIsImageOperationLoading(true);
      try {
        
        // Validar tipo de archivo
        if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
          alert('Solo se permiten archivos JPG o PNG');
          return;
        }

        // Validar tamaño (máx 5 MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('El archivo no debe exceder 5 MB');
          return;
        }

        // Subir imagen directamente a la API de artículos
        const result = await productImageService.uploadArticleImage(id, file, 'PRINC');
        
        if (result && result.url) {
          
          // Actualizar el estado local - agregar la nueva imagen
          const currentImages = formData?.images || [];
          handleInputChange('images', [...currentImages, result.url]);
          
          // Limpiar el input
          event.target.value = '';
          
          // Recargar el producto para obtener todas las imágenes actualizadas
          const updatedProduct = await productService.getProductById(id);
          if (updatedProduct) {
            setFormData({
              ...formData!,
              images: updatedProduct.images || []
            });
          }
        }
      } catch (error: any) {
        console.error('Error uploading image:', error);
        alert(error.message || 'Error al subir la imagen. Verifica que el archivo sea JPG o PNG y no exceda 5 MB.');
      } finally {
        setIsImageOperationLoading(false);
      }
    }
  };


  const handleDeleteImageFromArray = async (imageUrl: string) => {
    if (!formData?.images || !id) return;
    
    // La API de artículos no permite eliminar imágenes individuales
    // Solo podemos actualizar el estado local para ocultarla de la vista
    if (window.confirm('¿Estás seguro de que deseas eliminar esta imagen de la vista? (Nota: La imagen permanecerá en el servidor)')) {
      const updatedImages = formData.images.filter(img => img !== imageUrl);
      handleInputChange('images', updatedImages);
    }
  };

  const handleEditImage = (imageUrl: string, index: number) => {
    setImageToEdit(imageUrl);
    setImageIndexToEdit(index);
    setShowImageEditor(true);
  };

  const handleSaveEditedImage = async (editedImageBlob: Blob) => {
    if (!id || imageIndexToEdit === -1) return;
    
    setIsImageOperationLoading(true);
    try {
      // Convertir blob a File
      const file = new File([editedImageBlob], 'edited-image.jpg', { type: 'image/jpeg' });
      
      // Subir la imagen editada directamente a la API de artículos
      const result = await productImageService.uploadArticleImage(id, file);
      
      if (result && result.url && formData?.images) {
        // Actualizar el estado local - reemplazar la imagen en la misma posición
        const updatedImages = [...formData.images];
        updatedImages[imageIndexToEdit] = result.url;
        handleInputChange('images', updatedImages);
        
        // Recargar el producto para obtener todas las imágenes actualizadas
        const updatedProduct = await productService.getProductById(id);
        if (updatedProduct) {
          setFormData({
            ...formData,
            images: updatedProduct.images || []
          });
        }
      }
      
      setShowImageEditor(false);
      setImageToEdit('');
      setImageIndexToEdit(-1);
    } catch (error: any) {
      console.error('Error saving edited image:', error);
      alert(error.message || 'Error al guardar la imagen editada');
    } finally {
      setIsImageOperationLoading(false);
    }
  };
  if (isLoading) {
    return <LoadingSpinner variant="inline" message="Cargando producto..." />;
  }

  if (!formData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Producto no encontrado</h3>
          <p className="text-gray-500 mb-6">El producto que buscas no existe o ha sido eliminado.</p>
          <button
            onClick={() => navigate('/admin/products')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Volver a Productos
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Package },
    { id: 'pricing', label: 'Precios', icon: DollarSign },
    { id: 'categorization', label: 'Categorización', icon: Tag },
    { id: 'inventory', label: 'Inventario', icon: Layers },
    // { id: 'seo', label: 'SEO', icon: Star }
  ];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-3 lg:space-x-4">
          <button
            onClick={handleCancel}
            className="flex items-center px-2 lg:px-3 py-2 text-gray-600 hover:text-gray-800 active:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1 lg:mr-2" />
            <span className="text-sm lg:text-base">Volver</span>
          </button>
          <div className="min-w-0">
            <h1 className="text-xl lg:text-3xl font-bold text-gray-900 truncate">Editar Producto</h1>
            <p className="text-xs lg:text-sm text-gray-600 truncate">ID: {id} • Última actualización: hace 2 horas</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:gap-3">
          {showUnsavedChanges && (
            <span className="text-xs lg:text-sm text-orange-600 flex items-center">
              <AlertCircle className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
              <span>Cambios sin guardar</span>
            </span>
          )}
          <div className="flex gap-2 lg:gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 sm:flex-none px-3 lg:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm lg:text-base hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 sm:flex-none flex items-center justify-center px-3 lg:px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white text-sm lg:text-base rounded-lg transition-colors"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="border-b border-gray-200">
          {/* Mobile tabs - horizontal scroll */}
          <div className="lg:hidden">
            <nav className="flex space-x-4 px-4 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-3 px-3 border-b-2 font-medium text-xs whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-3 h-3 mr-1" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
          
          {/* Desktop tabs */}
          <div className="hidden lg:block">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="p-3 sm:p-4 lg:p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                <div className="space-y-4 lg:space-y-6">
                  <div>
                    <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
                      Nombre del Producto *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-3 py-2 text-sm lg:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Ej: Ibuprofeno 600mg"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs lg:text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
                      Descripción *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className={`w-full px-3 py-2 text-sm lg:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                        errors.description ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Descripción detallada del producto..."
                    />
                    {errors.description && (
                      <p className="mt-1 text-xs lg:text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
                      Marca *
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      className={`w-full px-3 py-2 text-sm lg:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.brand ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Ej: Bayer"
                    />
                    {errors.brand && (
                      <p className="mt-1 text-xs lg:text-sm text-red-600">{errors.brand}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
                      Fabricante
                    </label>
                    <input
                      type="text"
                      value={formData.manufacturer}
                      onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                      className="w-full px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Laboratorios Bayer"
                    />
                  </div>
                </div>

                <div className="space-y-4 lg:space-y-6">
                  <div>
                    <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
                      Galería de Imágenes del Producto *
                    </label>
                    <div className="space-y-3 lg:space-y-4">
                      {/* Mostrar imagen principal (segunda posición del array) */}
                      {(() => {
                        const mainImage = formData.images && formData.images.length > 1 ? formData.images[1] : null;
                        return mainImage;
                      })() && (
                        <div className="relative">
                          <img
                            src={formData.images[1]}
                            alt="Imagen principal"
                            className="w-full h-32 lg:h-48 object-cover rounded-lg border border-gray-300"
                            onLoad={() => {
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                            Principal
                          </div>
                          <div className="absolute top-2 right-2 flex gap-1">
                            <button
                              onClick={() => handleEditImage(formData.images[1], 1)}
                              disabled={isImageOperationLoading}
                              className="p-1 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-full transition-colors"
                              title="Editar imagen"
                            >
                              <Edit3 className="w-3 h-3 lg:w-4 lg:h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteImageFromArray(formData.images[1])}
                              disabled={isImageOperationLoading}
                              className="p-1 bg-red-500 hover:bg-red-600 active:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-full transition-colors"
                              title="Eliminar imagen"
                            >
                              <X className="w-3 h-3 lg:w-4 lg:h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Mostrar todas las imágenes en galería */}
                      {(() => {
                        const visibleImages = formData.images?.filter((_, index) => index > 0) || [];
                        return formData.images && formData.images.length > 0;
                      })() && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Galería de Imágenes ({formData.images.filter((_, index) => index > 0).length} imágenes)
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {(() => {
                              const filteredImages = formData.images.filter((_, index) => index > 0);
                              return filteredImages;
                            })().map((imageUrl, index) => (
                              <div key={index + 1} className="relative">
                                <img
                                  src={imageUrl}
                                  alt={`Imagen ${index + 2}`}
                                  className="w-full h-24 object-cover rounded-lg border border-gray-300"
                                  onLoad={() => {
                                  }}
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                                <div className="absolute top-1 left-1 bg-gray-800 text-white px-1 py-0.5 rounded text-xs">
                                  {index + 2}
                                </div>
                                {index === 0 && (
                                  <div className="absolute top-1 right-1 bg-blue-500 text-white px-1 py-0.5 rounded text-xs">
                                    Principal
                                  </div>
                                )}
                                <div className="absolute bottom-1 right-1 flex gap-1">
                                  <button
                                    onClick={() => handleEditImage(imageUrl, index + 1)}
                                    disabled={isImageOperationLoading}
                                    className="p-1 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-full transition-colors"
                                    title="Editar imagen"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteImageFromArray(imageUrl)}
                                    disabled={isImageOperationLoading}
                                    className="p-1 bg-red-500 hover:bg-red-600 active:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-full transition-colors"
                                    title="Eliminar imagen"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 lg:p-6 text-center">
                        <ImageIcon className="w-8 h-8 lg:w-12 lg:h-12 text-gray-400 mx-auto mb-3 lg:mb-4" />
                        <div className="space-y-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={isUploading || isImageOperationLoading}
                            className="w-full px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            placeholder="Selecciona una imagen"
                          />
                          <p className="text-xs lg:text-sm text-gray-500">
                            O arrastra una imagen aquí para agregarla a la galería
                          </p>
                          <p className="text-xs text-blue-600">
                            La segunda imagen será la imagen principal del producto
                          </p>
                          {(isUploading || isImageOperationLoading) && (
                            <p className="text-xs lg:text-sm text-blue-600">
                              {isUploading ? 'Subiendo imagen...' : 'Procesando imagen...'}
                            </p>
                          )}
                          {uploadError && <p className="text-xs lg:text-sm text-red-600">{uploadError}</p>}
                        </div>
                      </div>
                    </div>
                    {errors.image && (
                      <p className="mt-1 text-xs lg:text-sm text-red-600">{errors.image}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
                        Peso (gr)
                      </label>
                      <input
                        type="number"
                        value={formData.weight}
                        onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dimensiones
                      </label>
                      <input
                        type="text"
                        value={formData.dimensions}
                        onChange={(e) => handleInputChange('dimensions', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="10x5x2 cm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pricing Tab */}
            {activeTab === 'pricing' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                <div className="space-y-4 lg:space-y-6">
                  <div>
                    <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
                      Precio en USD *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 lg:w-4 lg:h-4" />
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                        className={`w-full pl-8 lg:pl-10 pr-3 py-2 text-sm lg:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.price ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.price && (
                      <p className="mt-1 text-xs lg:text-sm text-red-600">{errors.price}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
                      Precio Original (para ofertas)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 lg:w-4 lg:h-4" />
                      <input
                        type="number"
                        step="0.01"
                        value={formData.original_price || ''}
                        onChange={(e) => handleInputChange('original_price', parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 lg:pl-10 pr-3 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 lg:space-y-6">
                  <div className="bg-blue-50 p-3 lg:p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2 text-sm lg:text-base">Configuración de Ofertas</h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.is_offer}
                          onChange={(e) => handleInputChange('is_offer', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-xs lg:text-sm text-gray-700">
                          Marcar como oferta especial
                        </span>
                      </label>
                      
                      {formData.is_offer && formData.original_price && Number(formData.original_price) > 0 && formData.price && (
                        <div className="text-xs lg:text-sm text-gray-600">
                          <p>Descuento: {Math.round(((Number(formData.original_price) - Number(formData.price)) / Number(formData.original_price)) * 100)}%</p>
                          <p>Ahorro: ${(Number(formData.original_price) - Number(formData.price)).toFixed(2)} USD</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Categorization Tab */}
            {activeTab === 'categorization' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                <div className="space-y-4 lg:space-y-6">
                  <div>
                    <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
                      Categoría Principal *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className={`w-full px-3 py-2 text-sm lg:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                        errors.category ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Seleccionar categoría</option>
                      <option value="Medicamentos">Medicamentos</option>
                      <option value="Vitaminas">Vitaminas</option>
                      <option value="Cuidado Personal">Cuidado Personal</option>
                      <option value="Primeros Auxilios">Primeros Auxilios</option>
                      <option value="Bebé y Mamá">Bebé y Mamá</option>
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-xs lg:text-sm text-red-600">{errors.category}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
                      Subcategoría
                    </label>
                    <input
                      type="text"
                      value={formData.subcategory}
                      onChange={(e) => handleInputChange('subcategory', e.target.value)}
                      className="w-full px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Analgésicos"
                    />
                  </div>

                  <div>
                    <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
                      Patología
                    </label>
                    <input
                      type="text"
                      value={formData.patology}
                      onChange={(e) => handleInputChange('patology', e.target.value)}
                      className="w-full px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Dolor, Inflamación"
                    />
                  </div>
                </div>

                <div className="space-y-4 lg:space-y-6">
                  <div className="bg-yellow-50 p-3 lg:p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-2 text-sm lg:text-base">Configuración Médica</h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.prescription}
                          onChange={(e) => handleInputChange('prescription', e.target.checked)}
                          className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                        />
                        <span className="ml-2 text-xs lg:text-sm text-gray-700">
                          Requiere receta médica
                        </span>
                      </label>
                      
                      {formData.prescription && (
                        <div className="text-xs lg:text-sm text-yellow-700 bg-yellow-100 p-2 rounded">
                          <Info className="w-3 h-3 lg:w-4 lg:h-4 inline mr-1" />
                          <span>Este producto requerirá validación de receta antes de la compra.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
                      Fecha de Vencimiento
                    </label>
                    <input
                      type="date"
                      value={formData.expiry_date}
                      onChange={(e) => handleInputChange('expiry_date', e.target.value)}
                      className="w-full px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Lote
                    </label>
                    <input
                      type="text"
                      value={formData.batch_number}
                      onChange={(e) => handleInputChange('batch_number', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: LOT123456"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Inventory Tab */}
            {activeTab === 'inventory' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                <div className="space-y-4 lg:space-y-6">
                  <div className="bg-green-50 p-3 lg:p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2 text-sm lg:text-base">Estado del Inventario</h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.in_stock}
                          onChange={(e) => handleInputChange('in_stock', e.target.checked)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="ml-2 text-xs lg:text-sm text-gray-700">
                          Producto disponible en stock
                        </span>
                      </label>
                      
                        {!formData.in_stock && (
                        <div className="text-xs lg:text-sm text-red-700 bg-red-100 p-2 rounded">
                          <AlertCircle className="w-3 h-3 lg:w-4 lg:h-4 inline mr-1" />
                          <span>El producto aparecerá como "Agotado" en la tienda.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
                        Rating Actual
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={formData.rating || 0}
                        onChange={(e) => handleInputChange('rating', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
                        Número de Reseñas
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.review_count || 0}
                        onChange={(e) => handleInputChange('review_count', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 lg:space-y-6">
                  <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2 text-sm lg:text-base">Información de Stock</h4>
                    <div className="space-y-2 text-xs lg:text-sm text-gray-600">
                      <p>• Unidades vendidas: 45 (último mes)</p>
                      <p>• Stock actual: 120 unidades</p>
                      <p>• Punto de reorden: 20 unidades</p>
                      <p>• Última actualización: hace 2 horas</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                <div className="space-y-4 lg:space-y-6">
                  <div>
                    <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
                      Meta Descripción
                    </label>
                    <textarea
                      value={formData.meta_description}
                      onChange={(e) => handleInputChange('meta_description', e.target.value)}
                      rows={3}
                      maxLength={160}
                      className="w-full px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Descripción para motores de búsqueda (máx. 160 caracteres)"
                    />
                    <p className="text-xs lg:text-sm text-gray-500 mt-1">
                      {formData.meta_description?.length || 0}/160 caracteres
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
                      Palabras Clave SEO
                    </label>
                    <input
                      type="text"
                      value={formData.seo_keywords}
                      onChange={(e) => handleInputChange('seo_keywords', e.target.value)}
                      className="w-full px-3 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="palabra1, palabra2, palabra3"
                    />
                    <p className="text-xs lg:text-sm text-gray-500 mt-1">
                      Separa las palabras clave con comas
                    </p>
                  </div>
                </div>

                <div className="space-y-4 lg:space-y-6">
                  <div className="bg-blue-50 p-3 lg:p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2 text-sm lg:text-base">Vista Previa SEO</h4>
                    <div className="space-y-2">
                      <div className="text-lg text-blue-600 underline">
                        {formData.name || 'Nombre del producto'}
                      </div>
                      <div className="text-sm text-green-600">
                        farmacia.com/producto/{id}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formData.meta_description || formData.description.substring(0, 160) + '...'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Image Editor Modal */}
      {showImageEditor && imageToEdit && (
        <ImageEditor
          image={imageToEdit}
          onSave={handleSaveEditedImage}
          onCancel={() => {
            setShowImageEditor(false);
            setImageToEdit('');
            setImageIndexToEdit(-1);
          }}
        />
      )}
    </div>
  );
};

export default AdminEditProductPage; 