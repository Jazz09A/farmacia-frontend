import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload,  
  X, 
  Check, 
  AlertTriangle, 
  FileImage,
  Loader2
} from 'lucide-react';
import CloudinaryService from '../../services/CloudinaryService';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface ImageUploaderProps {
  onImageUploaded: (imageUrl: string, publicId: string) => void;
  onError: (error: string) => void;
  maxSize?: number; // en MB
  acceptedTypes?: string[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  currentImageUrl?: string;
}

interface UploadState {
  isDragging: boolean;
  isUploading: boolean;
  uploadProgress: UploadProgress | null;
  uploadedImageUrl: string | null;
  uploadedPublicId: string | null;
  previewUrl: string | null;
  error: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUploaded,
  onError,
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  placeholder = 'Arrastra una imagen aquí o haz clic para seleccionar',
  className = '',
  disabled = false,
  currentImageUrl
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>({
    isDragging: false,
    isUploading: false,
    uploadProgress: null,
    uploadedImageUrl: currentImageUrl || null,
    uploadedPublicId: null,
    previewUrl: null,
    error: null
  });

  // Validar archivo
  const validateFile = useCallback((file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Tipo de archivo no permitido. Solo se aceptan: ${acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}`;
    }

    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `El archivo es demasiado grande. Tamaño máximo: ${maxSize}MB`;
    }

    return null;
  }, [acceptedTypes, maxSize]);

  // Manejar subida de archivo
  const handleFileUpload = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setState(prev => ({ ...prev, error: validationError }));
      onError(validationError);
      return;
    }

    // Crear preview local
    const previewUrl = URL.createObjectURL(file);
    setState(prev => ({ 
      ...prev, 
      isUploading: true, 
      uploadProgress: null, 
      error: null,
      previewUrl 
    }));

    try {
      const response = await CloudinaryService.uploadImage(file, (progress) => {
        setState(prev => ({ ...prev, uploadProgress: progress }));
      });

      setState(prev => ({ 
        ...prev, 
        isUploading: false, 
        uploadedImageUrl: response.secure_url,
        uploadedPublicId: response.public_id,
        uploadProgress: null 
      }));

      // Limpiar preview local
      URL.revokeObjectURL(previewUrl);

      onImageUploaded(response.secure_url, response.public_id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al subir la imagen';
      setState(prev => ({ 
        ...prev, 
        isUploading: false, 
        uploadProgress: null, 
        error: errorMessage 
      }));
      
      // Limpiar preview local
      URL.revokeObjectURL(previewUrl);
      
      onError(errorMessage);
    }
  }, [validateFile, onImageUploaded, onError]);

  // Manejar selección de archivo
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    handleFileUpload(file);
  }, [handleFileUpload]);

  // Eventos de drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setState(prev => ({ ...prev, isDragging: true }));
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, isDragging: false }));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    
    setState(prev => ({ ...prev, isDragging: false }));
    handleFileSelect(e.dataTransfer.files);
  }, [disabled, handleFileSelect]);

  // Manejar clic para seleccionar archivo
  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  // Remover imagen
  const handleRemoveImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setState(prev => ({ 
      ...prev, 
      uploadedImageUrl: null, 
      uploadedPublicId: null,
      previewUrl: null,
      error: null 
    }));
  }, []);

  // Limpiar error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const currentImage = state.uploadedImageUrl || state.previewUrl;
  const showUploadArea = !currentImage && !state.isUploading;
  const showProgress = state.isUploading && state.uploadProgress;

  return (
    <div className={`relative ${className}`}>
      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />

      {/* Área de subida */}
      <motion.div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer
          ${state.isDragging 
            ? 'border-blue-500 bg-blue-50 scale-105' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${state.error ? 'border-red-300 bg-red-50' : ''}
        `}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
      >
        <AnimatePresence mode="wait">
          {showUploadArea && (
            <motion.div
              key="upload-area"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-12 px-6 text-center"
            >
              <div className="mb-4">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <FileImage className="w-8 h-8 text-gray-300 mx-auto" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Subir Comprobante de Pago
              </h3>
              
              <p className="text-gray-500 mb-4 max-w-sm">
                {placeholder}
              </p>
              
              <div className="text-xs text-gray-400 space-y-1">
                <p>Formatos: JPG, PNG, WEBP</p>
                <p>Tamaño máximo: {maxSize}MB</p>
              </div>
            </motion.div>
          )}

          {state.isUploading && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 px-6"
            >
              <div className="mb-4">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Subiendo imagen...
              </h3>
              
              {showProgress && (
                <div className="w-full max-w-xs">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progreso</span>
                    <span>{state.uploadProgress?.percentage.toString() || '0'}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-blue-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${state.uploadProgress?.percentage || 0}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatFileSize(state.uploadProgress?.loaded || 0)} / {formatFileSize(state.uploadProgress?.total || 0)}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {currentImage && !state.isUploading && (
            <motion.div
              key="uploaded-image"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative"
            >
              <div className="relative group">
                <img
                  src={currentImage}
                  alt="Comprobante de pago"
                  className="w-full h-64 object-cover rounded-lg"
                />
                
                {/* Overlay con acciones */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                  <div className="flex gap-2">
                    <button
                      onClick={handleRemoveImage}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="Eliminar imagen"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Indicador de éxito */}
                {state.uploadedImageUrl && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>
              
              <div className="mt-3 text-center">
                <p className="text-sm font-medium text-green-600 flex items-center justify-center gap-1">
                  <Check className="w-4 h-4" />
                  Imagen subida correctamente
                </p>
                <button
                  onClick={handleClick}
                  className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                >
                  Cambiar imagen
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {state.error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
          >
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-700">{state.error}</p>
              <button
                onClick={clearError}
                className="text-xs text-red-600 hover:text-red-800 mt-1"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instrucciones adicionales */}
      {!currentImage && !state.isUploading && (
        <div className="mt-3 text-xs text-gray-500 text-center">
          <p>💡 <strong>Consejo:</strong> Asegúrate de que el comprobante sea legible y muestre claramente los detalles del pago</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
