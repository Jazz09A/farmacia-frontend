// 🛍️ Servicio para manejar productos y búsqueda
import { Product, ProductsApiResponse } from '../types';

export interface ProductSearchParams {
  search?: string;
  category?: string;
  subcategory?: string;
  patology?: string;
  brand?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  prescription?: boolean;
  is_offer?: boolean;
  featured?: boolean;
  sort_by?: 'name' | 'price' | 'rating' | 'created_at' | 'relevance';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchSuggestion {
  text: string;
  type: 'product' | 'brand' | 'category';
}

class ProductService {
  private baseUrl = '/api/v1/public/products';
  private cache = new Map<string, { data: ProductsApiResponse; timestamp: number }>();
  private cacheExpiry = 2 * 60 * 1000; // 2 minutos

  /**
   * Normaliza los datos de un producto del backend para asegurar consistencia
   */
  private normalizeProduct(backendProduct: any): Product {
    // Usar el array completo de imágenes del backend
    const images = backendProduct.images && Array.isArray(backendProduct.images) 
      ? backendProduct.images.filter((img: string) => img && img.trim() !== '')
      : [];

    // Si no hay imágenes, usar placeholder
    if (images.length === 0) {
      images.push('https://placehold.co/400x400/png');
    }

    const parseNum = (v: any): number => {
      const n = typeof v === 'string' ? parseFloat(v) : v;
      return Number.isFinite(n) ? n : 0;
    };

    return {
      id: backendProduct.id,
      name: backendProduct.name,
      brand: backendProduct.brand,
      category: backendProduct.category,
      subcategory: backendProduct.subcategory,
      patology: backendProduct.patology,
      price: parseNum(backendProduct.price),
      description: backendProduct.description,
      ingredients: backendProduct.ingredients || [],
      image: images[0] || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop',
      images: images,
      in_stock: backendProduct.in_stock,
      stock: backendProduct.stock,
      prescription: backendProduct.prescription,
      rating: parseNum(backendProduct.rating),
      review_count: backendProduct.review_count,
      is_offer: backendProduct.is_offer,
      original_price: backendProduct.original_price != null ? parseNum(backendProduct.original_price) : null,
      offer_end_time: backendProduct.offer_end_time ? new Date(backendProduct.offer_end_time).toISOString() : null,
      featured: backendProduct.featured,
      dosage: backendProduct.dosage,
      presentation: backendProduct.presentation,
      laboratorio: backendProduct.laboratorio,
      registro_sanitario: backendProduct.registro_sanitario,
      contraindicaciones: backendProduct.contraindicaciones,
      efectos_secundarios: backendProduct.efectos_secundarios,
      slug: backendProduct.slug,
      discount_percentage: parseNum(backendProduct.discount_percentage),
      current_price: parseNum(backendProduct.current_price ?? backendProduct.price),
      is_available: backendProduct.is_available,
      created_at: backendProduct.created_at,
      updated_at: backendProduct.updated_at,
    };
  }

  /**
   * Buscar productos con filtros y paginación
   */
  async searchProducts(params: ProductSearchParams = {}): Promise<ProductsApiResponse> {
    try {
      const queryParams = new URLSearchParams();

      // Agregar parámetros de búsqueda
      if (params.search) queryParams.append('search', params.search);
      if (params.category) queryParams.append('category', params.category);
      if (params.subcategory) queryParams.append('subcategory', params.subcategory);
      if (params.patology) queryParams.append('patology', params.patology);
      if (params.brand) queryParams.append('brand', params.brand);
      if (params.min_price !== undefined) queryParams.append('min_price', params.min_price.toString());
      if (params.max_price !== undefined) queryParams.append('max_price', params.max_price.toString());
      if (params.in_stock !== undefined) queryParams.append('in_stock', params.in_stock.toString());
      if (params.prescription !== undefined) queryParams.append('prescription', params.prescription.toString());
      if (params.is_offer !== undefined) queryParams.append('is_offer', params.is_offer.toString());
      if (params.featured !== undefined) queryParams.append('featured', params.featured.toString());
      if (params.sort_by) queryParams.append('sort_by', params.sort_by);
      if (params.sort_order) queryParams.append('sort_order', params.sort_order);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const cacheKey = queryParams.toString();
      
      // Verificar caché
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        console.log('🎯 Using cached products data');
        return cached.data;
      }

      const url = `${this.baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error searching products: ${response.status}`);
      }

      const data: ProductsApiResponse = await response.json();
      
      // Guardar en caché
      this.cache.set(cacheKey, { data, timestamp: Date.now() });

      return data;
    } catch (error) {
      console.error('Failed to search products:', error);
      throw error;
    }
  }

  /**
   * Búsqueda específica usando el endpoint de búsqueda
   */
  async search(query: string, params: Omit<ProductSearchParams, 'search'> = {}): Promise<ProductsApiResponse> {
    return this.searchProducts({ ...params, search: query });
  }

  /**
   * Obtener un producto por su ID
   */
  async getProductById(productId: string): Promise<Product> {
    try {
      const response = await fetch(`${this.baseUrl}/${productId}`);

      if (!response.ok) {
        throw new Error(`Error fetching product: ${response.status}`);
      }

      const data = await response.json();
      return this.normalizeProduct(data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      throw error;
    }
  }

  /**
   * Obtener un producto por su slug
   */
  async getProductBySlug(slug: string): Promise<Product> {
    try {
      const response = await fetch(`${this.baseUrl}/slug/${slug}`);

      if (!response.ok) {
        throw new Error(`Error fetching product by slug: ${response.status}`);
      }

      const data = await response.json();
      return this.normalizeProduct(data);
    } catch (error) {
      console.error('Failed to fetch product by slug:', error);
      throw error;
    }
  }

  /**
   * Obtener sugerencias de búsqueda para autocompletado
   */
  async getSearchSuggestions(query: string, limit: number = 10): Promise<SearchSuggestion[]> {
    try {
      if (!query || query.length < 2) {
        return [];
      }

      const response = await fetch(
        `${this.baseUrl}/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`
      );

      if (!response.ok) {
        return [];
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get search suggestions:', error);
      return [];
    }
  }

  /**
   * Obtener productos destacados
   */
  async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
    try {
      const response = await this.searchProducts({
        featured: true,
        limit,
        sort_by: 'rating',
        sort_order: 'desc'
      });

      return response.products;
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
      return [];
    }
  }

  /**
   * Obtener productos en oferta
   */
  async getOfferProducts(limit: number = 20): Promise<Product[]> {
    try {
      const response = await this.searchProducts({
        is_offer: true,
        limit,
        sort_by: 'created_at',
        sort_order: 'desc'
      });

      return response.products;
    } catch (error) {
      console.error('Failed to fetch offer products:', error);
      return [];
    }
  }

  /**
   * Obtener productos por categoría
   */
  async getProductsByCategory(category: string, params: ProductSearchParams = {}): Promise<ProductsApiResponse> {
    return this.searchProducts({ ...params, category });
  }

  /**
   * Obtener productos por marca
   */
  async getProductsByBrand(brand: string, params: ProductSearchParams = {}): Promise<ProductsApiResponse> {
    return this.searchProducts({ ...params, brand });
  }

  /**
   * Obtener productos relacionados (misma categoría/patología)
   */
  async getRelatedProducts(product: Product, limit: number = 6): Promise<Product[]> {
    try {
      const response = await this.searchProducts({
        category: product.category,
        limit: limit + 1, // +1 para excluir el producto actual
        sort_by: 'rating',
        sort_order: 'desc'
      });

      // Filtrar el producto actual
      return response.products.filter(p => p.id !== product.id).slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch related products:', error);
      return [];
    }
  }

  /**
   * Limpiar caché
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Obtener información de caché
   */
  getCacheInfo(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Validar disponibilidad de un producto
   */
  isProductAvailable(product: Product): boolean {
    return product.is_available && product.in_stock && product.stock > 0;
  }

  /**
   * Calcular precio con descuento
   */
  getDiscountedPrice(product: Product): number {
    if (product.is_offer && product.original_price) {
      return parseFloat(product.current_price);
    }
    return parseFloat(product.price);
  }

  /**
   * Obtener URL de imagen principal con fallback
   */
  getProductImage(product: Product): string {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return product.image || '/placeholder-product.png';
  }

  /**
   * Formatear precio para mostrar
   */
  formatPrice(price: string | number): number {
    return typeof price === 'string' ? parseFloat(price) : price;
  }

  /**
   * Obtener todos los productos (para compatibilidad con código legacy)
   */
  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await this.searchProducts({ limit: 1000, sort_by: 'name', sort_order: 'asc' });
      return response.products;
    } catch (error) {
      console.error('Failed to fetch all products:', error);
      return [];
    }
  }

  /**
   * Actualizar un producto (requiere autenticación admin)
   */
  async updateProduct(productId: string, productData: Partial<Product>): Promise<Product> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/v1/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        throw new Error(`Error updating product: ${response.status}`);
      }

      const updatedProduct = await response.json();
      
      // Limpiar caché para forzar recarga de datos
      this.clearCache();
      
      return this.normalizeProduct(updatedProduct);
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  }

  /**
   * Eliminar una imagen de un producto (requiere autenticación admin)
   */
  async deleteProductImage(productId: string, imageUrl: string): Promise<Product> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/v1/admin/products/${productId}/image/${encodeURIComponent(imageUrl)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error deleting image: ${response.status}`);
      }

      const updatedProduct = await response.json();
      
      // Limpiar caché
      this.clearCache();
      
      return this.normalizeProduct(updatedProduct);
    } catch (error) {
      console.error('Failed to delete product image:', error);
      throw error;
    }
  }
}

export const productService = new ProductService();
export default productService;

