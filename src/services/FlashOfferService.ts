// 🔥 Flash Offer Service - API interactions for flash offers
import { authService } from './AuthService';
import { publicFetch } from './api/apiClient';
import { 
  FlashOffer, 
  FlashOfferWithProduct, 
  FlashOfferResponse, 
  CreateFlashOfferPayload 
} from '../types';

export interface FlashOfferFilters {
  active_only?: boolean;
  product_category?: string;
  min_discount?: number;
  max_discount?: number;
  sort_by?: 'discount_value' | 'end_time' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

class FlashOfferService {
  private adminBaseUrl = '/api/v1/admin';
  private adminFlashOffersBase = `${this.adminBaseUrl}/flash-offers`;
  private articleDiscountsBase = `${this.adminBaseUrl}/article-discounts`;
  private publicFlashOffersUrl = `${this.adminFlashOffersBase}/public`;

  async getFlashOffersPublic(): Promise<FlashOfferResponse> {
    try {
      const response = await publicFetch(this.publicFlashOffersUrl);
      if (!response.ok) {
        throw new Error(`Error fetching flash offers: ${response.status}`);
      }
      const data = await response.json();
      
      // Nueva estructura de respuesta: { offers, total, page, pages, success }
      const flash_offers = this.parseFlashOffersFromResponse(data);
      
      return {
        flash_offers: flash_offers,
        total_count: data.total || data.total_count || flash_offers.length,
        active_count: data.total || data.active_count || flash_offers.length
      };
    }
    catch (error) {
      console.error('Failed to fetch flash offers:', error);
      return {
        flash_offers: [],
        total_count: 0,
        active_count: 0
      };
    }
  }

  // 🔥 Obtener ofertas flash activas (público)
  async getActiveFlashOffers(): Promise<FlashOfferWithProduct[]> {
    try {
      const response = await publicFetch(this.publicFlashOffersUrl);
      
      if (!response.ok) {
        if (response.status === 404) {
          // No hay ofertas activas
          return [];
        }
        throw new Error(`Error fetching flash offers: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Parse the flash offers from the response with robust handling
      const flash_offers = this.parseFlashOffersFromResponse(data);
      
      // Enriquecer con datos calculados
      return this.enrichFlashOffers(flash_offers);
    } catch (error) {
      console.error('Failed to fetch flash offers:', error);
      return []; // Fallo graceful - sin ofertas
    }
  }

  // 🔥 Obtener todas las ofertas flash (admin)
  async getAllFlashOffers(filters?: FlashOfferFilters): Promise<FlashOfferResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, String(value));
          }
        });
      }

      const url = `${this.articleDiscountsBase}${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await authService.authenticatedFetch(url);
      
      if (!response.ok) {
        throw new Error(`Error fetching admin flash offers: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Parse the flash offers from the response with robust handling
      const flash_offers = this.parseFlashOffersFromResponse(data);
      
      return {
        flash_offers: this.enrichFlashOffers(flash_offers),
        total_count: data.total_count || data.total || data.page || flash_offers.length,
        active_count: data.active_count || data.active || flash_offers.length
      };
    } catch (error) {
      console.error('Failed to fetch admin flash offers:', error);
      throw error;
    }
  }

  // 🔥 Crear nueva oferta flash (admin) - Usa article-discounts endpoint
  async createFlashOffer(payload: CreateFlashOfferPayload): Promise<FlashOffer> {
    try {
      const response = await authService.authenticatedFetch(
        this.articleDiscountsBase,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error creating flash offer: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to create flash offer:', error);
      throw error;
    }
  }

  // 🔥 Actualizar oferta flash (admin) - Usa article-discounts endpoint
  async updateFlashOffer(id: string, payload: Partial<CreateFlashOfferPayload>): Promise<FlashOffer> {
    try {
      const response = await authService.authenticatedFetch(
        `${this.articleDiscountsBase}/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error updating flash offer: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to update flash offer:', error);
      throw error;
    }
  }

  // 🔥 Eliminar oferta flash (admin) - Usa article-discounts endpoint
  async deleteFlashOffer(id: string): Promise<void> {
    try {
      const response = await authService.authenticatedFetch(
        `${this.articleDiscountsBase}/${id}`,
        {
          method: 'DELETE',
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error deleting flash offer: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to delete flash offer:', error);
      throw error;
    }
  }

  // 🔥 Obtener oferta flash específica (admin) - Usa article-discounts endpoint
  async getFlashOfferById(id: string): Promise<FlashOfferWithProduct> {
    try {
      const response = await authService.authenticatedFetch(
        `${this.articleDiscountsBase}/${id}`
      );
      
      if (!response.ok) {
        throw new Error(`Error fetching flash offer: ${response.status}`);
      }
      
      const flashOffer: FlashOfferWithProduct = await response.json();
      return this.enrichFlashOffer(flashOffer);
    } catch (error) {
      console.error('Failed to fetch flash offer:', error);
      throw error;
    }
  }

  // 🔥 Activar/Desactivar oferta flash (admin)
  async toggleFlashOfferStatus(id: string, is_active: boolean): Promise<FlashOffer> {
    return this.updateFlashOffer(id, { is_active });
  }

  // 🔥 Obtener descuento de artículo por código (admin)
  async getArticleDiscount(coDesc: string): Promise<any> {
    try {
      const response = await authService.authenticatedFetch(
        `${this.adminBaseUrl}/article-discounts/code/${coDesc}`
      );
      
      if (!response.ok) {
        throw new Error(`Error fetching article discount: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch article discount:', error);
      throw error;
    }
  }

  // 🔥 Actualizar descuento de artículo (admin)
  async updateArticleDiscount(code: string, payload: any): Promise<any> {
    try {
      const response = await authService.authenticatedFetch(
        `${this.adminBaseUrl}/article-discounts/code/${code}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error updating article discount: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to update article discount:', error);
      throw error;
    }
  }

  // 🔥 Utilidades privadas

  // Parse flash offers from API response with robust structure handling
  private parseFlashOffersFromResponse(data: any): FlashOfferWithProduct[] {
    
    // Ensure data structure is valid
    if (!data || typeof data !== 'object') {
      console.error('Invalid response format - not an object:', data);
      return [];
    }
    
    // Handle different possible response structures
    let rawOffers: any[] = [];
    
    // Prioridad 1: Nueva estructura según documentación - { offers, total, page, pages, success }
    if (data.offers && Array.isArray(data.offers)) {
      rawOffers = data.offers;
    }
    // Prioridad 2: Estructura con items - { items, total, page, limit, success }
    else if (data.items && Array.isArray(data.items)) {
      rawOffers = data.items;
    }
    // Prioridad 3: Si la respuesta directamente contiene un array de ofertas
    else if (Array.isArray(data)) {
      rawOffers = data;
    }
    // Prioridad 4: Estructura antigua con flash_offers
    else if (data.flash_offers && Array.isArray(data.flash_offers)) {
      rawOffers = data.flash_offers;
    }
    // Prioridad 5: Estructura anidada con data.flash_offers
    else if (data.data && Array.isArray(data.data.flash_offers)) {
      rawOffers = data.data.flash_offers;
    }
    // Prioridad 6: Estructura anidada con data como array
    else if (data.data && Array.isArray(data.data)) {
      rawOffers = data.data;
    }
    else {
      console.warn('Could not find flash offers array in response structure:', data);
      console.warn('flash_offers is not an array, defaulting to empty array');
      rawOffers = [];
    }
    
    // Map raw offers to FlashOfferWithProduct format
    return rawOffers.map(rawOffer => this.mapRawOfferToFlashOfferWithProduct(rawOffer));
  }

  // Map raw offer from API to FlashOfferWithProduct format
  private mapRawOfferToFlashOfferWithProduct(rawOffer: any): FlashOfferWithProduct {
    // Normalize API field names - handle both old and new API structures
    const articleCode = rawOffer.co_art?.trim() || rawOffer.article_code || rawOffer.product_id || rawOffer.id;
    const articleDescription = rawOffer.art_des?.trim() || rawOffer.article_details?.description || rawOffer.product?.name || 'Producto sin nombre';
    const discountCode = rawOffer.co_desc?.trim() || rawOffer.co_desc || rawOffer.discount_code;
    const startTime = rawOffer.fecha_ini || rawOffer.start_time;
    const endTime = rawOffer.fecha_fin || rawOffer.end_time;
    const discountPercentage = rawOffer.porc1 ? parseFloat(rawOffer.porc1) : (rawOffer.discount_value || 0);
    const maxQuantity = rawOffer.hasta1 ? parseFloat(rawOffer.hasta1) : rawOffer.max_quantity;
    const isActive = rawOffer.is_active !== undefined ? rawOffer.is_active : true;
    const createdAt = rawOffer.fe_us_in || rawOffer.created_at || '';
    const updatedAt = rawOffer.fe_us_mo || rawOffer.updated_at || '';
    
    // Map article_details to Product if available
    let product: any = null;
    
    if (rawOffer.article_details) {
      product = this.mapArticleDetailsToProduct(rawOffer.article_details, articleCode);
    } else if (rawOffer.product) {
      // Fallback to existing product structure
      product = rawOffer.product;
    } else {
      // Create minimal product from offer data
      const parsePrice = (v: any): string => {
        if (v === null || v === undefined) return '0';
        const num = typeof v === 'string' ? parseFloat(v) : v;
        return Number.isFinite(num) ? num.toString() : '0';
      };

      const originalPriceStr = parsePrice(rawOffer.article_details?.original_price);
      const offerPriceStr = parsePrice(rawOffer.article_details?.offer_price || rawOffer.article_details?.original_price);
      
      product = {
        id: articleCode,
        name: articleDescription,
        brand: '',
        category: '',
        subcategory: '',
        patology: '',
        price: originalPriceStr,
        price_ref: originalPriceStr,
        price_ves: '0',
        description: articleDescription,
        ingredients: [],
        image: rawOffer.article_details?.image_url || 'https://placehold.co/400x400/png',
        images: rawOffer.article_details?.gallery && Array.isArray(rawOffer.article_details.gallery) && rawOffer.article_details.gallery.length > 0
          ? rawOffer.article_details.gallery.map((img: any) => typeof img === 'string' ? img : img?.url || '')
          : [rawOffer.article_details?.image_url || 'https://placehold.co/400x400/png'],
        in_stock: parseFloat(rawOffer.article_details?.stock || '0') > 0,
        stock: parseFloat(rawOffer.article_details?.stock || '0'),
        prescription: false,
        rating: '0',
        review_count: 0,
        is_offer: true,
        original_price: originalPriceStr,
        offer_end_time: endTime || null,
        featured: false,
        dosage: '',
        presentation: '',
        laboratorio: '',
        registro_sanitario: '',
        contraindicaciones: '',
        efectos_secundarios: '',
        slug: articleCode,
        discount_percentage: discountPercentage.toString(),
        current_price: offerPriceStr,
        is_available: parseFloat(rawOffer.article_details?.stock || '0') > 0,
        created_at: createdAt,
        updated_at: updatedAt,
      };
    }

    // Calcular claimed_quantity: max_quantity - remaining_quantity
    // Según documentación: remaining_quantity = campo1 - campo2 (max_quantity - used)
    let claimed_quantity: number | undefined;
    let remaining_quantity: number | undefined;
    
    if (rawOffer.remaining_quantity !== undefined) {
      remaining_quantity = rawOffer.remaining_quantity;
      if (maxQuantity !== undefined) {
        claimed_quantity = maxQuantity - rawOffer.remaining_quantity;
      }
    } else if (rawOffer.used_quantity !== undefined) {
      claimed_quantity = rawOffer.used_quantity;
      if (maxQuantity !== undefined) {
        remaining_quantity = maxQuantity - rawOffer.used_quantity;
      }
    } else if (rawOffer.claimed_quantity !== undefined) {
      claimed_quantity = rawOffer.claimed_quantity;
      if (maxQuantity !== undefined) {
        remaining_quantity = maxQuantity - rawOffer.claimed_quantity;
      }
    }

    return {
      id: rawOffer.id || articleCode,
      product_id: articleCode,
      co_desc: discountCode,
      discount_type: rawOffer.discount_type || 'percentage',
      discount_value: discountPercentage,
      start_time: startTime,
      end_time: endTime,
      max_quantity: maxQuantity,
      is_active: isActive,
      created_at: createdAt,
      updated_at: updatedAt,
      product: product,
      claimed_quantity: claimed_quantity,
      remaining_quantity: remaining_quantity,
      des_des: rawOffer.des_des || '',
      // is_valid will be checked in isOfferActive
    };
  }

  // Map article_details to Product format
  private mapArticleDetailsToProduct(articleDetails: any, articleCode: string): any {
    const parseNum = (v: string | null | undefined): number => {
      if (!v) return 0;
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : 0;
    };

    const stock = parseNum(articleDetails.stock);
    const originalPrice = parseNum(articleDetails.original_price);
    const offerPrice = parseNum(articleDetails.offer_price);
    
    // Build images array
    const images: string[] = [];
    if (articleDetails.image_url) {
      images.push(articleDetails.image_url);
    }
    if (articleDetails.gallery && Array.isArray(articleDetails.gallery)) {
      articleDetails.gallery.forEach((img: any) => {
        if (typeof img === 'string' && img.trim()) {
          images.push(img);
        } else if (img && img.url) {
          images.push(img.url);
        }
      });
    }
    if (images.length === 0) {
      images.push('https://placehold.co/400x400/png');
    }

    return {
      id: articleCode,
      name: articleDetails.description || 'Producto sin nombre',
      brand: '',
      category: '',
      subcategory: '',
      patology: '',
      price: originalPrice.toString(),
      price_ref: originalPrice.toString(),
      price_ves: '0', // Will be calculated if needed
      description: articleDetails.description || '',
      ingredients: [],
      image: images[0],
      images: images,
      in_stock: stock > 0,
      stock: stock,
      prescription: false,
      rating: '0',
      review_count: 0,
      is_offer: true,
      original_price: originalPrice.toString(),
      offer_end_time: null, // Will be set from offer data
      featured: false,
      dosage: '',
      presentation: '',
      laboratorio: '',
      registro_sanitario: '',
      contraindicaciones: '',
      efectos_secundarios: '',
      slug: articleCode,
      discount_percentage: articleDetails.discount_percentage?.toString() || '0',
      current_price: offerPrice.toString(),
      is_available: stock > 0,
      created_at: '',
      updated_at: '',
    };
  }

  // Enriquecer múltiples ofertas con datos calculados
  private enrichFlashOffers(offers: FlashOfferWithProduct[]): FlashOfferWithProduct[] {
    if (!Array.isArray(offers)) {
      console.warn('enrichFlashOffers received non-array:', offers);
      return [];
    }
    return offers.map(offer => this.enrichFlashOffer(offer));
  }

  // Enriquecer oferta individual con datos calculados
  private enrichFlashOffer(offer: FlashOfferWithProduct): FlashOfferWithProduct {
    const now = Date.now();
    const endTime = new Date(offer.end_time).getTime();
    const remaining_time = Math.max(0, endTime - now);
    
    // Calcular porcentaje de disponibilidad si hay cantidad máxima
    // Prioridad: usar remaining_quantity si está disponible (más directo)
    let availability_percentage = 100;
    if (offer.max_quantity) {
      if (offer.remaining_quantity !== undefined) {
        // Usar remaining_quantity directamente del backend
        availability_percentage = Math.max(0, 
          (offer.remaining_quantity / offer.max_quantity) * 100
        );
      } else if (offer.claimed_quantity !== undefined) {
        // Calcular desde claimed_quantity
        availability_percentage = Math.max(0, 
          ((offer.max_quantity - offer.claimed_quantity) / offer.max_quantity) * 100
        );
      }
      // Si no hay ninguno, asumir 100% disponible
    }

    return {
      ...offer,
      remaining_time,
      availability_percentage,
    };
  }

  // 🔥 Validar si una oferta está activa
  isOfferActive(offer: FlashOfferWithProduct): boolean {
    if (!offer.is_active) return false;
    
    // Check is_valid if present (new API structure)
    if ((offer as any).is_valid === false) return false;
    
    const now = Date.now();
    const startTime = new Date(offer.start_time).getTime();
    const endTime = new Date(offer.end_time).getTime();
    
    return now >= startTime && now <= endTime;
  }

  // 🔥 Formatear tiempo restante para UI
  formatRemainingTime(remainingMs: number): string {
    if (remainingMs <= 0) return 'Expirado';
    
    const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  // 🔥 Calcular precio con descuento
  calculateDiscountedPrice(originalPrice: number, discountType: 'percentage' | 'fixed_amount', discountValue: number): number {
    if (discountType === 'percentage') {
      return originalPrice * (1 - discountValue / 100);
    } else {
      return Math.max(0, originalPrice - discountValue);
    }
  }

  // 🔥 Calcular precio de ahorro
  calculateSavings(originalPrice: number, discountedPrice: number): number {
    return originalPrice - discountedPrice;
  }
}

// Instancia singleton
export const flashOfferService = new FlashOfferService();

