import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { 
  ArrowLeft, 
  X, 
  Image as ImageIcon,
  AlertCircle,
  Package,
  Edit3,
  Upload,
  Trash2,
  Check,
  FileImage,
  Cloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { productService } from '../../services/ProductService';
import { Product } from '../../types';
import { productImageService } from '../../services/ProductImageService';
import { ImageEditor } from '../../components/Admin/ImageEditor';

interface PendingImage {
  id: string;
  file: File;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
  error: string | null;
}

const AdminEditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [imageToEdit, setImageToEdit] = useState<string>('');
  const [imageIndexToEdit, setImageIndexToEdit] = useState<number>(-1);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        try {
          const productData = await productService.getProductById(id);
          setProduct(productData);
        } catch (error) {
          console.error('Error fetching product:', error);
        }
      }
      setIsLoading(false);
    };
    fetchProduct();
  }, [id]);

  const validateFile = (file: File): string | null => {
    // Validar tipo de archivo
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      return 'Solo se permiten archivos JPG o PNG';
    }

    // Validar tamaño (máx 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      return 'El archivo no debe exceder 5 MB';
    }

    return null;
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newPendingImages: PendingImage[] = [];

    Array.from(files).forEach((file) => {
      const error = validateFile(file);
      
      if (!error) {
        const preview = URL.createObjectURL(file);
        newPendingImages.push({
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview,
          uploading: false,
          uploaded: false,
          error: null,
        });
      }
    });

    setPendingImages((prev) => [...prev, ...newPendingImages]);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFilesSelected(event.target.files);
    // Limpiar el input para permitir seleccionar el mismo archivo de nuevo
    event.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    handleFilesSelected(files);
  };

  const removePendingImage = (imageId: string) => {
    setPendingImages((prev) => {
      const image = prev.find((img) => img.id === imageId);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter((img) => img.id !== imageId);
    });
  };

  const uploadSingleImage = async (imageId: string) => {
    if (!id) return;

    const image = pendingImages.find((img) => img.id === imageId);
    if (!image) return;

    // Marcar como subiendo
    setPendingImages((prev) =>
      prev.map((img) =>
        img.id === imageId ? { ...img, uploading: true, error: null } : img
      )
    );

    try {
      const result = await productImageService.uploadArticleImage(id, image.file, 'PRINC');

      if (result && result.url) {
        // Marcar como subido
        setPendingImages((prev) =>
          prev.map((img) =>
            img.id === imageId ? { ...img, uploading: false, uploaded: true } : img
          )
        );

        // Recargar el producto
        const updatedProduct = await productService.getProductById(id);
        if (updatedProduct) {
          setProduct(updatedProduct);
        }

        // Remover la imagen pendiente después de 2 segundos
        setTimeout(() => {
          removePendingImage(imageId);
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setPendingImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? {
                ...img,
                uploading: false,
                error: error.message || 'Error al subir la imagen',
              }
            : img
        )
      );
    }
  };

  const uploadAllPendingImages = async () => {
    const imagesToUpload = pendingImages.filter((img) => !img.uploaded && !img.uploading);
    
    for (const image of imagesToUpload) {
      await uploadSingleImage(image.id);
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    if (!product || !id) return;

    if (window.confirm('¿Estás seguro de que deseas eliminar esta imagen de la vista? (Nota: La imagen permanecerá en el servidor)')) {
      const updatedImages = product.images.filter((img) => img !== imageUrl);
      setProduct({
        ...product,
        images: updatedImages,
      });
    }
  };

  const handleEditImage = (imageUrl: string, index: number) => {
    setImageToEdit(imageUrl);
    setImageIndexToEdit(index);
    setShowImageEditor(true);
  };

  const handleSaveEditedImage = async (editedImageBlob: Blob) => {
    if (!id || imageIndexToEdit === -1 || !product) return;

    try {
      const file = new File([editedImageBlob], 'edited-image.jpg', { type: 'image/jpeg' });
      const result = await productImageService.uploadArticleImage(id, file);

      if (result && result.url) {
        const updatedProduct = await productService.getProductById(id);
        if (updatedProduct) {
          setProduct(updatedProduct);
        }
      }

      setShowImageEditor(false);
      setImageToEdit('');
      setImageIndexToEdit(-1);
    } catch (error: any) {
      console.error('Error saving edited image:', error);
      alert(error.message || 'Error al guardar la imagen editada');
    }
  };

  if (isLoading) {
    return <LoadingSpinner variant="inline" message="Cargando producto..." />;
  }

  if (!product) {
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

  const validImages = product.images?.filter((img) => img && img !== 'https://placehold.co/400x400/png') || [];
  const hasPendingImages = pendingImages.length > 0;
  const hasUnuploadedImages = pendingImages.some((img) => !img.uploaded);

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-3 lg:space-x-4">
          <button
            onClick={() => navigate('/admin/products')}
            className="flex items-center px-2 lg:px-3 py-2 text-gray-600 hover:text-gray-800 active:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1 lg:mr-2" />
            <span className="text-sm lg:text-base">Volver</span>
          </button>
          <div className="min-w-0">
            <h1 className="text-xl lg:text-3xl font-bold text-gray-900 truncate">Gestionar Imágenes</h1>
            <p className="text-xs lg:text-sm text-gray-600 truncate">
              {product.name} • Código: {product.id}
            </p>
          </div>
        </div>
      </div>

      {/* Información del Producto */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 lg:p-6">
        <div className="flex items-start gap-4">
          {validImages.length > 0 ? (
            <img
              src={validImages[0]}
              alt={product.name}
              className="w-20 h-20 lg:w-24 lg:h-24 rounded-lg object-cover border border-gray-200 flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/png';
              }}
            />
          ) : (
            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 truncate">{product.name}</h2>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium">Código:</span> {product.id}
              </p>
              <p>
                <span className="font-medium">Categoría:</span> {product.category || 'Sin categoría'}
              </p>
              {product.currency && (
                <p>
                  <span className="font-medium">Precio:</span> {product.currency} {product.price}
                </p>
              )}
              <p>
                <span className="font-medium">Stock:</span> {product.stock} unidades
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Zona de Subida de Imágenes */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 lg:p-6">
        <div className="mb-4 lg:mb-6">
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Subir Nuevas Imágenes</h3>
          <p className="text-sm text-gray-600">
            Arrastra imágenes aquí o haz clic para seleccionar. Podrás previsualizarlas antes de subirlas.
          </p>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 lg:p-12 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileChange}
            multiple
            className="hidden"
          />
          <div className="relative inline-block">
            <Cloud
              className={`w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 ${
                isDragging ? 'text-blue-500' : 'text-gray-400'
              }`}
            />
            <Upload
              className={`w-6 h-6 lg:w-8 lg:h-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
                isDragging ? 'text-blue-600' : 'text-gray-500'
              }`}
            />
          </div>
          <p className="text-base lg:text-lg font-medium text-gray-700 mb-2">
            {isDragging ? 'Suelta las imágenes aquí' : 'Arrastra imágenes o haz clic para seleccionar'}
          </p>
          <p className="text-xs lg:text-sm text-gray-500">
            Formatos: JPG, PNG • Tamaño máximo: 5 MB por imagen
          </p>
        </div>

        {/* Imágenes Pendientes */}
        <AnimatePresence>
          {hasPendingImages && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm lg:text-base font-semibold text-gray-900">
                  Imágenes Pendientes ({pendingImages.length})
                </h4>
                {hasUnuploadedImages && (
                  <button
                    onClick={uploadAllPendingImages}
                    disabled={pendingImages.some((img) => img.uploading)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <Upload className="w-4 h-4" />
                    Subir Todas
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {pendingImages.map((image) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
                      <img
                        src={image.preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Overlay de estado */}
                      {(image.uploading || image.uploaded) && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          {image.uploading && (
                            <div className="text-white text-center">
                              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                              <p className="text-xs">Subiendo...</p>
                            </div>
                          )}
                          {image.uploaded && (
                            <div className="text-white text-center">
                              <Check className="w-12 h-12 mx-auto mb-2" />
                              <p className="text-xs">¡Subida!</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Botones de acción */}
                    {!image.uploading && !image.uploaded && (
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            uploadSingleImage(image.id);
                          }}
                          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-colors"
                          title="Subir imagen"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removePendingImage(image.id);
                          }}
                          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                          title="Eliminar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Error */}
                    {image.error && (
                      <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs p-2">
                        {image.error}
                      </div>
                    )}

                    {/* Nombre del archivo */}
                    <p className="mt-1 text-xs text-gray-600 truncate" title={image.file.name}>
                      {image.file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(image.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Galería de Imágenes Existentes */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 lg:p-6">
        <div className="mb-4 lg:mb-6">
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">
            Galería de Imágenes
          </h3>
          <p className="text-sm text-gray-600">
            Imágenes actualmente en el servidor ({validImages.length})
          </p>
        </div>

        {validImages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
            {validImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  <img
                    src={imageUrl}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="absolute top-2 left-2 bg-gray-800 text-white px-2 py-1 rounded text-xs font-medium">
                  {index + 1}
                </div>
                {index === 0 && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Principal
                  </div>
                )}
                <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditImage(imageUrl, index)}
                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors shadow-lg"
                    title="Editar imagen"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteImage(imageUrl)}
                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg"
                    title="Eliminar imagen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 lg:py-12">
            <FileImage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm lg:text-base">
              No hay imágenes disponibles. Sube la primera imagen usando el área de arriba.
            </p>
          </div>
        )}
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
