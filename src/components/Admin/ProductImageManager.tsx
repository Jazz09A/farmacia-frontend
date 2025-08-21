import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  Upload,
  X,
  Plus,
  Eye
} from 'lucide-react';
import { useMultipleImageUpload } from '../../hooks/useMultipleImageUpload';

interface ImageData {
  url: string;
  publicId: string;
  width: number;
  height: number;
  size: number;
  format: string;
}

interface ProductImageManagerProps {
  productName: string;
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

const ProductImageManager: React.FC<ProductImageManagerProps> = ({
  productName,
  images,
  onImagesChange,
  maxImages = 3,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { uploadImages, isUploading, error, clearError } = useMultipleImageUpload('products');

  const handleFileSelect = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    if (images.length + fileArray.length > maxImages) {
      alert(`Solo puedes subir un máximo de ${maxImages} imágenes por producto`);
      return;
    }

    clearError();

    try {
      const uploadResults = await uploadImages(fileArray);
      const newImageUrls = uploadResults.map(result => result.url);
      onImagesChange([...images, ...newImageUrls]);
    } catch (err) {
      console.error('Error uploading images:', err);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className={className}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
        title={`Gestionar imágenes (${images.length}/${maxImages})`}
      >
        <ImageIcon className="w-4 h-4" />
        <span>{images.length > 0 ? `${images.length} imagen${images.length > 1 ? 'es' : ''}` : 'Sin imágenes'}</span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Imágenes del Producto
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{productName}</p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-96">
                {/* Upload Area */}
                {images.length < maxImages && (
                  <div className="mb-6">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                      className="hidden"
                      id={`file-input-${productName}`}
                      disabled={isUploading}
                    />
                    <label
                      htmlFor={`file-input-${productName}`}
                      className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-gray-400 transition-colors ${
                        isUploading ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        {isUploading ? 'Subiendo...' : `Subir imágenes (${images.length}/${maxImages})`}
                      </p>
                    </label>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {/* Images Grid */}
                {images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={`Producto ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setPreviewImage(imageUrl)}
                                className="p-2 bg-white rounded-full text-gray-700 hover:text-blue-600 transition-colors"
                                title="Ver imagen"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removeImage(index)}
                                className="p-2 bg-white rounded-full text-gray-700 hover:text-red-600 transition-colors"
                                title="Eliminar imagen"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No hay imágenes para este producto</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-75"
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

export default ProductImageManager;
