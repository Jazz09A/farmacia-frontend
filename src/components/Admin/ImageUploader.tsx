import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle,
  Eye,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus
} from 'lucide-react';
import { useMultipleImageUpload } from '../../hooks/useMultipleImageUpload';

interface ImageData {
  url: string;
  publicId: string;
  width: number;
  height: number;
  size: number;
  format: string;
  isMain?: boolean;
}

interface ImageUploaderProps {
  images: ImageData[];
  onImagesChange: (images: ImageData[]) => void;
  maxImages?: number;
  allowReorder?: boolean;
  showMainSelector?: boolean;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  allowReorder = true,
  showMainSelector = true,
  className = ''
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadImages, isUploading, error, progress, clearError } = useMultipleImageUpload('products');

  const handleFileSelect = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Validar límite de imágenes
    if (images.length + fileArray.length > maxImages) {
      alert(`Solo puedes subir un máximo de ${maxImages} imágenes`);
      return;
    }

    clearError();

    try {
      const uploadResults = await uploadImages(fileArray);
      const newImages = uploadResults.map(result => ({
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        size: result.size,
        format: result.format,
        isMain: images.length === 0 && uploadResults.indexOf(result) === 0 // Primera imagen como principal si no hay otras
      }));

      onImagesChange([...images, ...newImages]);
    } catch (err) {
      console.error('Error uploading images:', err);
    }
  }, [images, maxImages, uploadImages, onImagesChange, clearError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
    // Limpiar input para permitir seleccionar el mismo archivo nuevamente
    e.target.value = '';
  }, [handleFileSelect]);

  const removeImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    
    // Si eliminamos la imagen principal, hacer la primera imagen como principal
    if (images[index].isMain && newImages.length > 0) {
      newImages[0].isMain = true;
    }
    
    onImagesChange(newImages);
  }, [images, onImagesChange]);

  const setMainImage = useCallback((index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isMain: i === index
    }));
    onImagesChange(newImages);
  }, [images, onImagesChange]);

  const moveImage = useCallback((fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    
    onImagesChange(newImages);
  }, [images, onImagesChange]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading || images.length >= maxImages}
        />

        {isUploading ? (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-blue-500 mx-auto animate-spin" />
            <div>
              <p className="text-lg font-medium text-gray-900">Subiendo imágenes...</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">{Math.round(progress)}%</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-900">
                {images.length >= maxImages 
                  ? `Máximo de ${maxImages} imágenes alcanzado`
                  : 'Arrastra imágenes aquí o haz clic para seleccionar'
                }
              </p>
              <p className="text-sm text-gray-500">
                Formatos soportados: JPG, PNG, WEBP (máximo 10MB por imagen)
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {images.length}/{maxImages} imágenes
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
            <button
              onClick={clearError}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Imágenes Subidas ({images.length})
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {images.map((image, index) => (
                <motion.div
                  key={image.publicId}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Main Image Badge */}
                  {image.isMain && (
                    <div className="absolute top-2 left-2 z-10">
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Principal
                      </span>
                    </div>
                  )}

                  {/* Image */}
                  <div className="aspect-square relative">
                    <img
                      src={image.url}
                      alt="Producto"
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setPreviewImage(image.url)}
                          className="p-2 bg-white rounded-full text-gray-700 hover:text-blue-600 transition-colors"
                          title="Ver imagen"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {showMainSelector && !image.isMain && (
                          <button
                            onClick={() => setMainImage(index)}
                            className="p-2 bg-white rounded-full text-gray-700 hover:text-blue-600 transition-colors"
                            title="Marcar como principal"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => removeImage(index)}
                          className="p-2 bg-white rounded-full text-gray-700 hover:text-red-600 transition-colors"
                          title="Eliminar imagen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Image Info */}
                  <div className="p-3">
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>{image.width} × {image.height}px</p>
                      <p>{formatFileSize(image.size)}</p>
                      <p className="uppercase">{image.format}</p>
                    </div>
                    
                    {/* Reorder buttons */}
                    {allowReorder && images.length > 1 && (
                      <div className="flex justify-center space-x-1 mt-2">
                        <button
                          onClick={() => moveImage(index, index - 1)}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Mover arriba"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => moveImage(index, index + 1)}
                          disabled={index === images.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Mover abajo"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-4xl p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewImage}
                alt="Vista previa"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-2 right-2 p-2 bg-white rounded-full text-gray-700 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageUploader;
