import { authService } from './AuthService';
import { 
  CloudinaryImageUploadResponse, 
  CloudinaryImageListResponse,
  CloudinarySetMainResponse,
  CloudinaryDeleteResponse 
} from '../types';

class ProductImageService {
  private baseUrl = '/api/v1/articles';

  /**
   * Subir una imagen a Cloudinary para un artículo (co_art)
   * @param coArt Código del artículo
   * @param file Archivo de imagen
   * @param isMain Si es la imagen principal del producto (default: false)
   * @param description Descripción opcional de la imagen
   * 
   * El endpoint espera multipart/form-data con:
   * - file: El archivo de imagen (JPEG, PNG, WEBP, GIF, AVIF - máx 10MB)
   * - is_main: (Opcional) Boolean indicando si es la imagen principal
   * - description: (Opcional) Descripción de la imagen
   * 
   * Ejemplo de uso:
   * POST /api/v1/articles/FITOS023/cloudinary-images
   * Content-Type: multipart/form-data
   * 
   * FormData:
   * - file: [archivo.jpg]
   * - is_main: "true"
   * - description: "Imagen principal del producto"
   */
  async uploadArticleImage(
    coArt: string, 
    file: File, 
    isMain: boolean = false,
    description?: string
  ): Promise<CloudinaryImageUploadResponse> {
    try {
      // Crear FormData para multipart/form-data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('is_main', isMain.toString());
      
      // Agregar description si se proporciona
      if (description) {
        formData.append('description', description);
      }

      // Usar authenticatedFetch - NO establecer Content-Type manualmente
      // El navegador lo establecerá automáticamente con el boundary correcto
      const response = await authService.authenticatedFetch(
        `${this.baseUrl}/${coArt}/cloudinary-images`,
        {
          method: 'POST',
          body: formData,
          // NO incluir headers['Content-Type'] - se establece automáticamente para FormData
        }
      );

      if (!response.ok) {
        let errorMessage = `Error uploading image: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          // Si no se puede parsear el error como JSON, usar el mensaje por defecto
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to upload article image to Cloudinary:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las imágenes de Cloudinary de un artículo
   * @param coArt Código del artículo
   * GET /api/v1/articles/{co_art}/cloudinary-images
   */
  async getProductImages(coArt: string): Promise<CloudinaryImageListResponse> {
    try {
      const response = await authService.authenticatedFetch(
        `${this.baseUrl}/${coArt}/cloudinary-images`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error getting article images: ${errorData.detail || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get product images from Cloudinary:', error);
      throw error;
    }
  }

  /**
   * Establecer una imagen como principal
   * @param imageId ID de la imagen en la base de datos
   * PATCH /api/v1/articles/cloudinary-images/{image_id}/set-main
   */
  async setMainImage(imageId: number): Promise<CloudinarySetMainResponse> {
    try {
      const response = await authService.authenticatedFetch(
        `${this.baseUrl}/cloudinary-images/${imageId}/set-main`,
        {
          method: 'PATCH',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error setting main image: ${errorData.detail || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to set main image:', error);
      throw error;
    }
  }

  /**
   * Eliminar una imagen específica de Cloudinary y la base de datos
   * @param imageId ID de la imagen en la base de datos
   * DELETE /api/v1/articles/cloudinary-images/{image_id}
   */
  async deleteImageFromProduct(imageId: number): Promise<CloudinaryDeleteResponse> {
    try {
      const response = await authService.authenticatedFetch(
        `${this.baseUrl}/cloudinary-images/${imageId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error deleting image: ${errorData.detail || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to delete image from Cloudinary:', error);
      throw error;
    }
  }

  /**
   * Eliminar todas las imágenes de un artículo
   * @param coArt Código del artículo
   * DELETE /api/v1/articles/{co_art}/cloudinary-images
   */
  async deleteAllImagesFromProduct(coArt: string): Promise<any> {
    try {
      const response = await authService.authenticatedFetch(
        `${this.baseUrl}/${coArt}/cloudinary-images`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error deleting all images: ${errorData.detail || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to delete all images from Cloudinary:', error);
      throw error;
    }
  }

  /**
   * @deprecated Legacy method - usar uploadArticleImage en su lugar
   */
  async addImagesToProduct(_productId: string, _images: string[]): Promise<any> {
    throw new Error('addImagesToProduct is deprecated. Use uploadArticleImage to upload files directly.');
  }
}

export const productImageService = new ProductImageService();
