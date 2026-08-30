// 💱 Servicio para manejar la tasa de cambio del BCV
import { publicFetch } from './api/apiClient';

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
  private baseUrl = '/api/v1';

  /**
   * Obtiene la tasa de cambio actual del BCV
   */
  async getExchangeRate(): Promise<ExchangeRateData> {
    try {
      const response = await publicFetch(`${this.baseUrl}/exchange_rate/`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching exchange rate: ${response.status}`);
      }
      
      const data: ExchangeRateResponse = await response.json();
      
      // Procesar datos
      const exchangeRateData: ExchangeRateData = {
        rate: data.exchange_rate.price,
        timestamp: data.exchange_rate.timestamp,
        source: data.exchange_rate.source,
        status: data.exchange_rate.status,
        lastUpdated: new Date()
      };

      return exchangeRateData;
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      throw error;
    }
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

}

export const exchangeRateService = new ExchangeRateService();
export default exchangeRateService;
