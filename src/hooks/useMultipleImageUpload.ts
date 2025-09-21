import { useState, useCallback } from 'react';

interface UploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

interface ImageUploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  size: number;
  format: string;
}

interface UseMultipleImageUploadReturn {
  uploadImages: (files: File[]) => Promise<ImageUploadResult[]>;
  uploadSingleImage: (file: File) => Promise<ImageUploadResult | null>;
  isUploading: boolean;
  error: string | null;
  progress: number;
  clearError: () => void;
}

const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export const useMultipleImageUpload = (folder: string = 'products'): UseMultipleImageUploadReturn => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const uploadSingleImage = useCallback(async (file: File): Promise<ImageUploadResult | null> => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      setError('Configuración de Cloudinary no encontrada');
      return null;
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen');
      return null;
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen no puede ser mayor a 10MB');
      return null;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error al subir imagen');
      }

      const data: UploadResponse = await response.json();
      
      return {
        url: data.secure_url,
        publicId: data.public_id,
        width: data.width,
        height: data.height,
        size: data.bytes,
        format: data.format
      };
    } catch (err: any) {
      console.error('Error uploading image:', err);
      throw err;
    }
  }, [folder]);

  const uploadImages = useCallback(async (files: File[]): Promise<ImageUploadResult[]> => {
    if (!files.length) return [];

    setIsUploading(true);
    setError(null);
    setProgress(0);

    const results: ImageUploadResult[] = [];
    const errors: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          const result = await uploadSingleImage(file);
          if (result) {
            results.push(result);
          }
        } catch (err: any) {
          errors.push(`${file.name}: ${err.message}`);
        }

        // Actualizar progreso
        setProgress(((i + 1) / files.length) * 100);
      }

      if (errors.length > 0) {
        setError(`Errores en ${errors.length} imagen(es): ${errors.join(', ')}`);
      }

      return results;
    } catch (err: any) {
      setError(err.message || 'Error al subir imágenes');
      return results;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  }, [uploadSingleImage]);

  return { 
    uploadImages, 
    uploadSingleImage, 
    isUploading, 
    error, 
    progress, 
    clearError 
  };
};
