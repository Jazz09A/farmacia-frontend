import { authService } from './AuthService';

class ProductImageService {
  private baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api/v1/admin';

  /**
   * Agregar imágenes a un producto
   */
  async addImagesToProduct(productId: string, images: string[]): Promise<any> {
    try {
      // Crear query parameters para las imágenes
      const queryParams = images.map(img => `images=${encodeURIComponent(img)}`).join('&');
      const url = `${this.baseUrl}/products/${productId}/images?${queryParams}`;
      
      console.log('Adding images to product:', { productId, images, url });
      
      const response = await authService.authenticatedFetch(url, {
        method: 'POST',
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(`Error adding images: ${errorData.detail || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to add images to product:', error);
      throw error;
    }
  }

  /**
   * Eliminar una imagen específica de un producto
   */
  async deleteImageFromProduct(productId: string, imageUrl: string): Promise<any> {
    try {
      // URL encode la imagen para evitar problemas con caracteres especiales
      const encodedImageUrl = encodeURIComponent(imageUrl);
      
      const response = await authService.authenticatedFetch(
        `${this.baseUrl}/products/${productId}/images/${encodedImageUrl}`,
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
      console.error('Failed to delete image from product:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las imágenes de un producto
   */
  async getProductImages(productId: string): Promise<string[]> {
    try {
      const response = await authService.authenticatedFetch(
        `${this.baseUrl}/products/${productId}/images`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error getting images: ${errorData.detail || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get product images:', error);
      throw error;
    }
  }
}

export const productImageService = new ProductImageService();
