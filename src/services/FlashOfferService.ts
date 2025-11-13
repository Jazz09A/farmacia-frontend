// 🔥 Flash Offer Service - API interactions for flash offers
import { authService } from './AuthService';
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
  private adminBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api/v1/admin';

  async getFlashOffersPublic(): Promise<FlashOfferResponse> {
    try {
      const response = await fetch(`${this.adminBaseUrl}/flash-offers/public`);
      if (!response.ok) {
        throw new Error(`Error fetching flash offers: ${response.status}`);
      }
      const data = await response.json();
      
      // Parse the flash offers from the response with robust handling
      const flash_offers = this.parseFlashOffersFromResponse(data);
      
      return {
        flash_offers: flash_offers,
        total_count: data.total_count || data.total || flash_offers.length,
        active_count: data.active_count || data.active || flash_offers.length
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
      const response = await fetch(`${this.adminBaseUrl}/flash-offers/`);
      
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

      const url = `${this.adminBaseUrl}/flash-offers${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await authService.authenticatedFetch(url);
      
      if (!response.ok) {
        throw new Error(`Error fetching admin flash offers: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Parse the flash offers from the response with robust handling
      const flash_offers = this.parseFlashOffersFromResponse(data);
      
      return {
        flash_offers: this.enrichFlashOffers(flash_offers),
        total_count: data.total_count || data.total || flash_offers.length,
        active_count: data.active_count || data.active || flash_offers.length
      };
    } catch (error) {
      console.error('Failed to fetch admin flash offers:', error);
      throw error;
    }
  }

  // 🔥 Crear nueva oferta flash (admin)
  async createFlashOffer(payload: CreateFlashOfferPayload): Promise<FlashOffer> {
    try {
      const response = await authService.authenticatedFetch(
        `${this.adminBaseUrl}/flash-offers`,
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

  // 🔥 Actualizar oferta flash (admin)
  async updateFlashOffer(id: string, payload: Partial<CreateFlashOfferPayload>): Promise<FlashOffer> {
    try {
      const response = await authService.authenticatedFetch(
        `${this.adminBaseUrl}/flash-offers/${id}`,
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

  // 🔥 Eliminar oferta flash (admin)
  async deleteFlashOffer(id: string): Promise<void> {
    try {
      const response = await authService.authenticatedFetch(
        `${this.adminBaseUrl}/flash-offers/${id}`,
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

  // 🔥 Obtener oferta flash específica (admin)
  async getFlashOfferById(id: string): Promise<FlashOfferWithProduct> {
    try {
      const response = await authService.authenticatedFetch(
        `${this.adminBaseUrl}/flash-offers/${id}`
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

  // 🔥 Utilidades privadas

  // Parse flash offers from API response with robust structure handling
  private parseFlashOffersFromResponse(data: any): FlashOfferWithProduct[] {
    
    // Ensure data structure is valid
    if (!data || typeof data !== 'object') {
      console.error('Invalid response format - not an object:', data);
      return [];
    }
    
    // Handle different possible response structures
    let flash_offers: FlashOfferWithProduct[] = [];
    
    // Check if the response directly contains an array of offers
    if (Array.isArray(data)) {
      flash_offers = data;
    }
    // Check if the response has flash_offers property
    else if (data.flash_offers && Array.isArray(data.flash_offers)) {
      flash_offers = data.flash_offers;
    }
    // Check if the response has offers property
    else if (data.offers && Array.isArray(data.offers)) {
      flash_offers = data.offers;
    }
    // Check if the response has data property with flash_offers
    else if (data.data && Array.isArray(data.data.flash_offers)) {
      flash_offers = data.data.flash_offers;
    }
    // Check if the response has data property that is an array
    else if (data.data && Array.isArray(data.data)) {
      flash_offers = data.data;
    }
    else {
      console.warn('Could not find flash offers array in response structure:', data);
      console.warn('flash_offers is not an array, defaulting to empty array');
      flash_offers = [];
    }
    
    return flash_offers;
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
    let availability_percentage = 100;
    if (offer.max_quantity && offer.claimed_quantity !== undefined) {
      availability_percentage = Math.max(0, 
        ((offer.max_quantity - offer.claimed_quantity) / offer.max_quantity) * 100
      );
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
    
    const now = Date.now();
    const startTime = new Date(offer.start_time).getTime();
    const endTime = new Date(offer.end_time).getTime();
    
    return now >= startTime && now <= endTime;
  }

  // 🔥 Formatear tiempo restante para UI
  formatRemainingTime(remainingMs: number): string {
    if (remainingMs <= 0) return 'Expirado';
    
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
    
    if (hours > 0) {
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

