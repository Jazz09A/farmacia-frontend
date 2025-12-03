import { authService } from './AuthService';
import { ImageUploadResponse } from '../types';

class ProductImageService {
  private baseUrl = '/api/v1/articles';

  /**
   * Subir una imagen a un artículo (co_art)
   * @param coArt Código del artículo
   * @param file Archivo de imagen
   * @param tip Tipo de imagen (opcional, ej: "IMG001" o "PRINC" para principal)
   * 
   * El endpoint espera multipart/form-data con:
   * - file: El archivo de imagen
   * - tip: (Opcional) Código identificador de la imagen
   * 
   * Ejemplo de uso:
   * POST /api/v1/articles/FITOS004/images
   * Content-Type: multipart/form-data
   * 
   * FormData:
   * - file: [archivo.jpg]
   * - tip: "IMG001"
   */
  async uploadArticleImage(coArt: string, file: File, tip?: string): Promise<ImageUploadResponse> {
    try {
      // Crear FormData para multipart/form-data
      const formData = new FormData();
      formData.append('file', file);
      
      // Agregar tip si se proporciona
      if (tip) {
        formData.append('tip', tip);
      }

      // Usar authenticatedFetch - NO establecer Content-Type manualmente
      // El navegador lo establecerá automáticamente con el boundary correcto
      const response = await authService.authenticatedFetch(
        `${this.baseUrl}/${coArt}/images`,
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
      console.error('Failed to upload article image:', error);
      throw error;
    }
  }

  /**
   * Agregar imágenes a un producto (legacy support - ahora usa uploadArticleImage)
   * @deprecated Usar uploadArticleImage en su lugar
   */
  async addImagesToProduct(productId: string, images: string[]): Promise<any> {
    throw new Error('addImagesToProduct is deprecated. Use uploadArticleImage to upload files directly.');
  }

  /**
   * Eliminar una imagen específica de un producto
   * Nota: La API de artículos no tiene endpoint para eliminar imágenes individuales
   */
  async deleteImageFromProduct(productId: string, imageUrl: string): Promise<any> {
    throw new Error('Delete image is not available for articles API.');
  }

  /**
   * Obtener todas las imágenes de un producto
   * Obtiene el detalle del artículo y extrae las imágenes
   */
  async getProductImages(productId: string): Promise<string[]> {
    try {
      const response = await authService.authenticatedFetch(
        `${this.baseUrl}/${productId}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error getting article: ${errorData.detail || response.statusText}`);
      }

      const article = await response.json();
      return article.images ? article.images.map((img: any) => img.url) : [];
    } catch (error) {
      console.error('Failed to get product images:', error);
      throw error;
    }
  }
}

export const productImageService = new ProductImageService();
