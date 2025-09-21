/**
 * Servicio para manejar la subida de imágenes a Cloudinary
 */

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class CloudinaryService {
  private cloudName: string;
  private uploadPreset: string;
  private apiKey: string;

  constructor() {
    // Configuración desde variables de entorno
    this.cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
    this.uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'your-upload-preset';
    this.apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY || 'your-api-key';
  }

  /**
   * Subir imagen a Cloudinary con progreso
   */
  async uploadImage(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<CloudinaryResponse> {
    return new Promise((resolve, reject) => {
      // Validar archivo
      if (!this.validateFile(file)) {
        reject(new Error('Archivo no válido. Solo se permiten imágenes JPG, PNG, WEBP hasta 5MB.'));
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);
      formData.append('folder', 'payments'); // Organizar en carpeta específica

      const xhr = new XMLHttpRequest();

      // Manejar progreso
      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress: UploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100)
            };
            onProgress(progress);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText) as CloudinaryResponse;
            resolve(response);
          } catch (error) {
            reject(new Error('Error al procesar la respuesta de Cloudinary'));
          }
        } else {
          reject(new Error(`Error al subir imagen: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Error de conexión al subir la imagen'));
      };

      xhr.ontimeout = () => {
        reject(new Error('Tiempo de espera agotado al subir la imagen'));
      };

      // Configurar timeout (30 segundos)
      xhr.timeout = 30000;

      // Realizar la petición
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`);
      xhr.send(formData);
    });
  }

  /**
   * Validar archivo antes de subir
   */
  private validateFile(file: File): boolean {
    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return false;
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if (file.size > maxSize) {
      return false;
    }

    return true;
  }

  /**
   * Obtener información del archivo
   */
  getFileInfo(file: File) {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      sizeFormatted: this.formatFileSize(file.size),
      isValid: this.validateFile(file)
    };
  }

  /**
   * Formatear tamaño de archivo
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Generar URL de transformación para preview
   */
  generatePreviewUrl(publicId: string, width = 300, height = 200): string {
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/c_fill,w_${width},h_${height},q_auto,f_auto/${publicId}`;
  }

  /**
   * Eliminar imagen de Cloudinary (requiere backend)
   */
  async deleteImage(publicId: string): Promise<void> {
    // Esta operación normalmente se hace desde el backend por seguridad
    // Aquí solo enviamos la solicitud al backend para que elimine la imagen
    try {
      const response = await fetch('/api/v1/cloudinary/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ public_id: publicId })
      });

      if (!response.ok) {
        throw new Error('Error al eliminar imagen');
      }
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      throw error;
    }
  }

  /**
   * Verificar configuración
   */
  isConfigured(): boolean {
    return !!(this.cloudName && this.uploadPreset && this.cloudName !== 'your-cloud-name');
  }

  /**
   * Obtener configuración para debugging
   */
  getConfig() {
    return {
      cloudName: this.cloudName,
      uploadPreset: this.uploadPreset,
      hasApiKey: !!this.apiKey,
      isConfigured: this.isConfigured()
    };
  }
}

export default new CloudinaryService();
