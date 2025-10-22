// 💱 Servicio para manejar la tasa de cambio del BCV

export interface ExchangeRateResponse {
  exchange_rate: {
    price: number;
    timestamp: string;
    source: string;
    status: string;
  };
}

export interface ExchangeRateData {
  rate: number;
  timestamp: string;
  source: string;
  status: string;
  lastUpdated: Date;
}

class ExchangeRateService {
  private baseUrl = import.meta.env.VITE_API_URL + '/api/v1' || 'http://localhost:8000/api/v1';
  private cache: ExchangeRateData | null = null;
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutos en milisegundos

  /**
   * Obtiene la tasa de cambio actual del BCV
   * @param forceRefresh - Si true, ignora la caché y obtiene datos frescos
   */
  async getExchangeRate(forceRefresh: boolean = false): Promise<ExchangeRateData> {
    // Verificar si tenemos datos en caché y no están expirados
    
    if (!forceRefresh && this.cache && this.isCacheValid()) {
      return this.cache;
    }

    try {
      const response = await fetch(`${this.baseUrl}/exchange_rate/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching exchange rate: ${response.status}`);
      }
      
      const data: ExchangeRateResponse = await response.json();
      
      // Procesar y almacenar en caché
      const exchangeRateData: ExchangeRateData = {
        rate: data.exchange_rate.price,
        timestamp: data.exchange_rate.timestamp,
        source: data.exchange_rate.source,
        status: data.exchange_rate.status,
        lastUpdated: new Date()
      };

      this.cache = exchangeRateData;
      return exchangeRateData;
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      
      // Si hay un error y tenemos datos en caché, devolver los datos en caché
      if (this.cache) {
        console.warn('Using cached exchange rate due to API error');
        return this.cache;
      }
      
      throw error;
    }
  }

  /**
   * Verifica si la caché es válida (no ha expirado)
   */
  private isCacheValid(): boolean {
    if (!this.cache) return false;
    const now = new Date();
    const cacheAge = now.getTime() - this.cache.lastUpdated.getTime();
    return cacheAge < this.cacheExpiry;
  }

  /**
   * Obtiene la tasa de cambio USD a VES
   */
  async getUSDToVESRate(): Promise<number> {
    const data = await this.getExchangeRate();
    return data.rate;
  }

  /**
   * Obtiene la tasa de cambio VES a USD
   */
  async getVESToUSDRate(): Promise<number> {
    const data = await this.getExchangeRate();
    return 1 / data.rate;
  }

  /**
   * Convierte un precio de USD a VES usando la tasa actual
   */
  async convertUSDToVES(usdAmount: number): Promise<number> {
    const rate = await this.getUSDToVESRate();
    return usdAmount * rate;
  }

  /**
   * Convierte un precio de VES a USD usando la tasa actual
   */
  async convertVESToUSD(vesAmount: number): Promise<number> {
    const rate = await this.getVESToUSDRate();
    return vesAmount * rate;
  }

  /**
   * Limpia la caché forzando la próxima llamada a obtener datos frescos
   */
  clearCache(): void {
    this.cache = null;
  }

  /**
   * Obtiene información de la caché actual
   */
  getCacheInfo(): { hasCache: boolean; lastUpdated?: Date; isExpired?: boolean } {
    return {
      hasCache: !!this.cache,
      lastUpdated: this.cache?.lastUpdated,
      isExpired: this.cache ? !this.isCacheValid() : undefined
    };
  }
}

export const exchangeRateService = new ExchangeRateService();
export default exchangeRateService;
