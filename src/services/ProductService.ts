// 🛍️ Servicio para manejar productos y búsqueda (ahora usando artículos de Profit Plus)
import { Product, ProductsApiResponse, ArticleSummary, ArticleDetail, ArticlesApiResponse } from '../types';
import { authService } from './AuthService';

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
  // Nuevos parámetros para artículos
  category_code?: string;
  line_code?: string;
  price_code?: string;
  warehouse_code?: string;
}

export interface SearchSuggestion {
  text: string;
  type: 'product' | 'brand' | 'category';
}

/**
 * Caché para propiedades de imágenes de artículos
 * Almacena image_url y has_image por co_art para evitar peticiones repetidas
 */
interface ArticleImageCacheEntry {
  image_url: string | null;
  has_image: boolean;
  timestamp: number;
}

class ArticleImageCache {
  private cache: Map<string, ArticleImageCacheEntry>;
  private maxAge: number; // 30 minutos por defecto

  constructor(maxAge: number = 30 * 60 * 1000) {
    this.cache = new Map();
    this.maxAge = maxAge;
  }

  /**
   * Obtener datos de imagen desde el caché
   */
  get(coArt: string): { image_url: string | null; has_image: boolean } | null {
    const cached = this.cache.get(coArt);
    if (!cached) {
      return null;
    }

    // Verificar si el caché ha expirado
    if (Date.now() - cached.timestamp > this.maxAge) {
      this.cache.delete(coArt);
      return null;
    }

    return {
      image_url: cached.image_url,
      has_image: cached.has_image
    };
  }

  /**
   * Guardar datos de imagen en el caché
   */
  set(coArt: string, image_url: string | null, has_image: boolean): void {
    this.cache.set(coArt, {
      image_url,
      has_image,
      timestamp: Date.now()
    });
  }

  /**
   * Invalidar caché de un artículo específico
   */
  invalidate(coArt: string): void {
    this.cache.delete(coArt);
  }

  /**
   * Limpiar entradas expiradas
   */
  cleanExpired(): void {
    const now = Date.now();
    for (const [coArt, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        this.cache.delete(coArt);
      }
    }
  }

  /**
   * Limpiar todo el caché
   */
  clear(): void {
    this.cache.clear();
  }
}

class ProductService {
  private baseUrl = '/api/v1/articles';
  private imageCache = new ArticleImageCache(30 * 60 * 1000); // 30 minutos de caché

  constructor() {
    // Limpiar entradas expiradas cada 5 minutos
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.imageCache.cleanExpired();
      }, 5 * 60 * 1000);
    }
  }

  /**
   * Mapea ArticleSummary a Product para mantener compatibilidad
   */
  private mapArticleSummaryToProduct(article: ArticleSummary): Product {
    const parseNum = (v: string | null | undefined): number => {
      if (!v) return 0;
      const n = typeof v === 'string' ? parseFloat(v) : v;
      return Number.isFinite(n) ? n : 0;
    };

    const stockNum = parseNum(article.stock);
    const priceNum = parseNum(article.price);

    // Usar valores del artículo (si vienen del API) o del caché
    // Priorizar valores del API si están disponibles, sino usar caché
    let imageUrl = article.image_url;
    let hasImage = article.has_image;
    
    // Si el artículo no tiene image_url pero tenemos caché, usar el caché
    if (!imageUrl) {
      const cached = this.imageCache.get(article.co_art);
      if (cached && cached.image_url) {
        imageUrl = cached.image_url;
        hasImage = cached.has_image;
      }
    }
    
    // Siempre actualizar el caché con los valores más recientes del API
    // Esto asegura que el caché se mantenga actualizado
    this.imageCache.set(article.co_art, imageUrl || null, hasImage);

    // Construir array de imágenes
    const images: string[] = [];
    if (imageUrl) {
      images.push(imageUrl);
    }
    if (images.length === 0) {
      images.push('https://placehold.co/400x400/png');
    }

    // Verificar si hay oferta flash
    const hasFlashOffer = article.flash_offer && article.flash_offer.id;
    const flashOffer = article.flash_offer;
    
    // Si hay oferta flash, usar el precio de oferta, sino el precio normal
    const finalPrice = hasFlashOffer && flashOffer?.offer_price 
      ? flashOffer.offer_price.toString() 
      : priceNum.toString();
    
    const originalPrice = hasFlashOffer && flashOffer?.original_price
      ? flashOffer.original_price.toString()
      : null;

    return {
      id: article.co_art, // Usar co_art como ID
      name: article.art_des,
      brand: '', // No disponible en ArticleSummary
      category: article.category_name || article.category_code || '',
      subcategory: '',
      patology: '',
      price: finalPrice,
      currency: article.currency || 'US$', // Moneda del artículo
      description: article.art_des, // Usar descripción como nombre por ahora
      ingredients: [],
      image: images[0],
      images: images,
      in_stock: stockNum > 0,
      stock: stockNum,
      prescription: false, // No disponible en ArticleSummary
      rating: '0', // No disponible en artículos
      review_count: 0,
      is_offer: !!hasFlashOffer,
      original_price: originalPrice,
      offer_end_time: hasFlashOffer && flashOffer?.end_time ? flashOffer.end_time : null,
      featured: false,
      dosage: '',
      presentation: '',
      laboratorio: '',
      registro_sanitario: '',
      contraindicaciones: '',
      efectos_secundarios: '',
      slug: article.co_art, // Usar co_art como slug
      discount_percentage: '0',
      current_price: priceNum.toString(),
      is_available: stockNum > 0,
      created_at: '',
      updated_at: '',
      profit_discount: (article as any).profit_discount || null, // Mapear profit_discount del backend
    };
  }

  /**
   * Mapea ArticleDetail a Product para mantener compatibilidad
   */
  private mapArticleDetailToProduct(article: ArticleDetail): Product {
    const parseNum = (v: string | null | undefined): number => {
      if (!v) return 0;
      const n = typeof v === 'string' ? parseFloat(v) : v;
      return Number.isFinite(n) ? n : 0;
    };

    // Obtener precio más reciente
    const latestPrice = article.prices && article.prices.length > 0 
      ? article.prices[0] 
      : null;
    const priceNum = latestPrice ? parseNum(latestPrice.amount) : 0;
    const currency = latestPrice?.currency || 'US$'; // Moneda del precio más reciente

    // Calcular stock total
    const totalStock = article.stock_by_warehouse.reduce((sum, stock) => {
      return sum + parseNum(stock.quantity);
    }, 0);

    // Construir array de imágenes
    const images: string[] = [];
    if (article.images && article.images.length > 0) {
      article.images.forEach(img => {
        if (img.url) images.push(img.url);
      });
    }
    
    // Actualizar caché con la primera imagen si existe
    const firstImageUrl = images.length > 0 ? images[0] : null;
    const hasImage = images.length > 0;
    this.imageCache.set(article.co_art, firstImageUrl, hasImage);
    
    if (images.length === 0) {
      images.push('https://placehold.co/400x400/png');
    }

    // Verificar si hay oferta flash
    const hasFlashOffer = article.flash_offer && article.flash_offer.id;
    const flashOffer = article.flash_offer;
    
    // Si hay oferta flash, usar el precio de oferta, sino el precio normal
    const finalPrice = hasFlashOffer && flashOffer?.offer_price !== undefined
      ? flashOffer.offer_price.toString()
      : priceNum.toString();
    
    const originalPrice = hasFlashOffer && flashOffer?.original_price !== undefined
      ? flashOffer.original_price.toString()
      : null;

    return {
      id: article.co_art,
      name: article.art_des,
      brand: '', // No disponible en ArticleDetail
      category: article.category_name || article.category_code || '',
      subcategory: article.sub_line_code || '',
      patology: '',
      price: finalPrice,
      currency: currency, // Moneda del precio
      description: article.art_des,
      ingredients: [],
      image: images[0],
      images: images,
      in_stock: totalStock > 0,
      stock: totalStock,
      prescription: false,
      rating: '0',
      review_count: 0,
      is_offer: !!hasFlashOffer,
      original_price: originalPrice,
      offer_end_time: hasFlashOffer && flashOffer?.end_time ? flashOffer.end_time : null,
      featured: false,
      dosage: '',
      presentation: article.presentation || '',
      laboratorio: '',
      registro_sanitario: '',
      contraindicaciones: '',
      efectos_secundarios: '',
      slug: article.co_art,
      discount_percentage: hasFlashOffer && flashOffer?.discount_percentage !== undefined
        ? flashOffer.discount_percentage.toString()
        : '0',
      current_price: finalPrice,
      is_available: totalStock > 0,
      created_at: '',
      updated_at: '',
      profit_discount: (article as any).profit_discount || null, // Mapear profit_discount del backend
    };
  }

  /**
   * Normaliza los datos de un producto del backend para asegurar consistencia (legacy support)
   */
  // private normalizeProduct(backendProduct: any): Product {
  //   // Si ya es un Product, devolverlo
  //   if (backendProduct.id && backendProduct.name) {
  //     return backendProduct;
  //   }

  //   // Si es ArticleSummary, mapearlo
  //   if (backendProduct.co_art) {
  //     if (backendProduct.prices) {
  //       return this.mapArticleDetailToProduct(backendProduct as ArticleDetail);
  //     }
  //     return this.mapArticleSummaryToProduct(backendProduct as ArticleSummary);
  //   }

  //   // Fallback para formato legacy
  //   const images = backendProduct.images && Array.isArray(backendProduct.images) 
  //     ? backendProduct.images.filter((img: string) => img && img.trim() !== '')
  //     : [];

  //   if (images.length === 0) {
  //     images.push('https://placehold.co/400x400/png');
  //   }

  //   const parseNum = (v: any): number => {
  //     const n = typeof v === 'string' ? parseFloat(v) : v;
  //     return Number.isFinite(n) ? n : 0;
  //   };

  //   return {
  //     id: backendProduct.id || backendProduct.co_art,
  //     name: backendProduct.name || backendProduct.art_des,
  //     brand: backendProduct.brand || '',
  //     category: backendProduct.category || backendProduct.category_name || '',
  //     subcategory: backendProduct.subcategory || '',
  //     patology: backendProduct.patology || '',
  //     price: parseNum(backendProduct.price).toString(),
  //     description: backendProduct.description || backendProduct.art_des || '',
  //     ingredients: backendProduct.ingredients || [],
  //     image: images[0] || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop',
  //     images: images,
  //     in_stock: backendProduct.in_stock !== undefined ? backendProduct.in_stock : (parseNum(backendProduct.stock) > 0),
  //     stock: parseNum(backendProduct.stock),
  //     prescription: backendProduct.prescription || false,
  //     rating: parseNum(backendProduct.rating).toString(),
  //     review_count: backendProduct.review_count || 0,
  //     is_offer: backendProduct.is_offer || false,
  //     original_price: backendProduct.original_price != null ? parseNum(backendProduct.original_price).toString() : null,
  //     offer_end_time: backendProduct.offer_end_time ? new Date(backendProduct.offer_end_time).toISOString() : null,
  //     featured: backendProduct.featured || false,
  //     dosage: backendProduct.dosage || '',
  //     presentation: backendProduct.presentation || '',
  //     laboratorio: backendProduct.laboratorio || '',
  //     registro_sanitario: backendProduct.registro_sanitario || '',
  //     contraindicaciones: backendProduct.contraindicaciones || '',
  //     efectos_secundarios: backendProduct.efectos_secundarios || '',
  //     slug: backendProduct.slug || backendProduct.co_art || backendProduct.id,
  //     discount_percentage: parseNum(backendProduct.discount_percentage).toString(),
  //     current_price: parseNum(backendProduct.current_price ?? backendProduct.price).toString(),
  //     is_available: backendProduct.is_available !== undefined ? backendProduct.is_available : (parseNum(backendProduct.stock) > 0),
  //     created_at: backendProduct.created_at || '',
  //     updated_at: backendProduct.updated_at || '',
  //   };
  // }

  /**
   * Mapea sort_by del frontend al formato de la API de artículos
   */
  private mapSortBy(sortBy?: string): string | undefined {
    const sortMap: Record<string, string> = {
      'name': 'art_des',
      'price': 'price_asc',
      'price_asc': 'price_asc',
      'price_desc': 'price_desc',
      'stock': 'stock_asc',
      'stock_asc': 'stock_asc',
      'stock_desc': 'stock_desc',
    };
    return sortMap[sortBy || ''] || 'art_des';
  }

  /**
   * Buscar productos con filtros y paginación (ahora usando artículos de Profit Plus)
   */
  async searchProducts(params: ProductSearchParams = {}): Promise<ProductsApiResponse> {
    try {
      const queryParams = new URLSearchParams();

      // Mapear parámetros a formato de API de artículos
      if (params.search) queryParams.append('search', params.search);
      if (params.category_code) {
        queryParams.append('category_code', params.category_code);
      } else if (params.category) {
        // Intentar usar category como category_code si no se especificó category_code
        queryParams.append('category_code', params.category);
      }
      if (params.line_code) queryParams.append('line_code', params.line_code);
      if (params.min_price !== undefined) queryParams.append('min_price', params.min_price.toString());
      if (params.max_price !== undefined) queryParams.append('max_price', params.max_price.toString());
      
      // Parámetros de artículos
      if (params.price_code) queryParams.append('price_code', params.price_code);
      else queryParams.append('price_code', '01'); // Default según documentación
      
      if (params.warehouse_code) queryParams.append('warehouse_code', params.warehouse_code);
      else queryParams.append('warehouse_code', '001'); // Default según documentación

      // Mapear sort_by
      const mappedSortBy = this.mapSortBy(params.sort_by);
      if (mappedSortBy) queryParams.append('sort_by', mappedSortBy);

      // Paginación
      if (params.page) queryParams.append('page', params.page.toString());
      else queryParams.append('page', '1');
      
      if (params.limit) queryParams.append('limit', params.limit.toString());
      else queryParams.append('limit', '20');

      // Usar authenticatedFetch para obtener artículos
      const url = `${this.baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await authService.authenticatedFetch(url);

      if (!response.ok) {
        throw new Error(`Error searching articles: ${response.status}`);
      }

      const data: ArticlesApiResponse = await response.json();
      
      // Mapear ArticlesApiResponse a ProductsApiResponse
      const mappedResponse: ProductsApiResponse = {
        products: data.articles.map(article => this.mapArticleSummaryToProduct(article)),
        pagination: {
          page: data.page,
          limit: data.limit,
          total: data.total,
          total_pages: data.total_pages,
          has_next: data.has_next,
          has_prev: data.has_prev,
        },
        filters_applied: data.filters_applied,
        total: data.total,
      };

      return mappedResponse;
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
   * Obtener un producto por su ID (co_art)
   */
  async getProductById(productId: string): Promise<Product> {
    try {
      // Usar authenticatedFetch para obtener detalle del artículo
      const response = await authService.authenticatedFetch(`${this.baseUrl}/${productId}`);

      if (!response.ok) {
        throw new Error(`Error fetching article: ${response.status}`);
      }

      const data: ArticleDetail = await response.json();
      
      return this.mapArticleDetailToProduct(data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      throw error;
    }
  }

  /**
   * Obtener un producto por su slug (co_art)
   */
  async getProductBySlug(slug: string): Promise<Product> {
    try {
      // En artículos, el slug es el co_art
      return this.getProductById(slug);
    } catch (error) {
      console.error('Failed to fetch product by slug:', error);
      throw error;
    }
  }

  /**
   * Obtener sugerencias de búsqueda para autocompletado
   * Nota: La API de artículos no tiene endpoint de sugerencias, retornamos array vacío
   */
  async getSearchSuggestions(query: string, limit: number = 10): Promise<SearchSuggestion[]> {
    try {
      if (!query || query.length < 2) {
        return [];
      }

      // La API de artículos no tiene endpoint de sugerencias
      // Podríamos hacer una búsqueda y devolver los primeros resultados como sugerencias
      // Por ahora retornamos array vacío para mantener compatibilidad
      return [];
    } catch (error) {
      console.error('Failed to get search suggestions:', error);
      return [];
    }
  }

  /**
   * Obtener productos destacados
   * Nota: La API de artículos no tiene campo featured, retornamos productos aleatorios
   */
  async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
    try {
      const response = await this.searchProducts({
        limit,
        sort_by: 'name',
        sort_order: 'asc'
      });

      return response.products;
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
      return [];
    }
  }

  /**
   * Obtener productos en oferta
   * Nota: La API de artículos no tiene campo is_offer, retornamos productos aleatorios
   */
  async getOfferProducts(limit: number = 20): Promise<Product[]> {
    try {
      const response = await this.searchProducts({
        limit,
        sort_by: 'price',
        sort_order: 'asc'
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
    return this.searchProducts({ ...params, category_code: category });
  }

  /**
   * Obtener productos por marca
   * Nota: La API de artículos no tiene campo brand, retornamos búsqueda general
   */
  async getProductsByBrand(brand: string, params: ProductSearchParams = {}): Promise<ProductsApiResponse> {
    // Usar búsqueda por texto para intentar encontrar la marca
    return this.searchProducts({ ...params, search: brand });
  }

  /**
   * Obtener productos relacionados (misma categoría)
   */
  async getRelatedProducts(product: Product, limit: number = 6): Promise<Product[]> {
    try {
      // Extraer category_code del producto si está disponible
      const categoryCode = product.category; // Puede ser category_code o category_name
      
      const response = await this.searchProducts({
        category_code: categoryCode,
        limit: limit + 1, // +1 para excluir el producto actual
        sort_by: 'name',
        sort_order: 'asc'
      });

      // Filtrar el producto actual
      return response.products.filter(p => p.id !== product.id).slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch related products:', error);
      return [];
    }
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
   * Nota: La API de artículos es de solo lectura, este método no está disponible
   */
  async updateProduct(productId: string, productData: Partial<Product>): Promise<Product> {
    throw new Error('Update product is not available for articles API. Articles are read-only from Profit Plus.');
  }

  /**
   * Eliminar una imagen de un producto (requiere autenticación admin)
   * Nota: La API de artículos no tiene endpoint para eliminar imágenes individuales
   */
  async deleteProductImage(productId: string, imageUrl: string): Promise<Product> {
    throw new Error('Delete product image is not available for articles API.');
  }

  /**
   * Obtener recomendaciones de productos para un artículo específico
   */
  async getProductRecommendations(productId: string): Promise<{
    related_articles: Product[];
    frequently_bought_together: Product[];
    you_may_also_like: Product[];
  }> {
    try {
      const response = await authService.authenticatedFetch(`${this.baseUrl}/${productId}/recommendations`);

      if (!response.ok) {
        throw new Error(`Error fetching recommendations: ${response.status}`);
      }

      const data = await response.json();

      // Mapear los artículos a Product
      return {
        related_articles: (data.related_articles || []).map((article: ArticleSummary) => 
          this.mapArticleSummaryToProduct(article)
        ),
        frequently_bought_together: (data.frequently_bought_together || []).map((article: ArticleSummary) => 
          this.mapArticleSummaryToProduct(article)
        ),
        you_may_also_like: (data.you_may_also_like || []).map((article: ArticleSummary) => 
          this.mapArticleSummaryToProduct(article)
        ),
      };
    } catch (error) {
      console.error('Failed to fetch product recommendations:', error);
      // Retornar estructura vacía en caso de error
      return {
        related_articles: [],
        frequently_bought_together: [],
        you_may_also_like: [],
      };
    }
  }

  /**
   * Invalidar caché de imagen de un artículo específico
   * Útil cuando se actualiza la imagen de un artículo
   */
  invalidateImageCache(coArt: string): void {
    this.imageCache.invalidate(coArt);
  }

  /**
   * Actualizar caché de imagen de un artículo manualmente
   * Útil cuando se sube una nueva imagen
   */
  updateImageCache(coArt: string, imageUrl: string | null, hasImage: boolean): void {
    this.imageCache.set(coArt, imageUrl, hasImage);
  }

  /**
   * Limpiar todo el caché de imágenes
   */
  clearImageCache(): void {
    this.imageCache.clear();
  }
}

export const productService = new ProductService();
export default productService;

