import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { adminService } from '../../services/AdminService';
import { ExchangeRateData } from '../../services/ExchangeRateService';

const ExchangeRateCard: React.FC = () => {
  const [exchangeRateData, setExchangeRateData] = useState<ExchangeRateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadExchangeRate = async (forceRefresh = false) => {
    try {
      setError(null);
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const data = await adminService.getExchangeRate();
      setExchangeRateData(data);
    } catch (err) {
      console.error('Failed to load exchange rate:', err);
      setError('Error al cargar la tasa de cambio');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadExchangeRate();
  }, []);

  const handleRefresh = () => {
    loadExchangeRate(true);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('es-VE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'cached':
        return 'text-blue-600 bg-blue-100';
      case 'live':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'cached':
        return 'Datos en caché';
      case 'live':
        return 'Datos en vivo';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Cargando tasa de cambio...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <div className="flex items-center">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error al cargar tasa de cambio</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!exchangeRateData) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h3 className="ml-2 text-lg font-semibold text-gray-900">Tasa de Cambio BCV</h3>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 text-gray-400 hover:text-blue-600 disabled:opacity-50 transition-colors"
          title="Actualizar tasa de cambio"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Tasa principal */}
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">
            $1 USD = {exchangeRateData.rate.toFixed(2)} Bs.S
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Tasa de conversión actual
          </div>
        </div>

        {/* Información adicional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>Última actualización:</span>
            </div>
            <div className="text-sm font-medium text-gray-900">
              {formatTimestamp(exchangeRateData.timestamp)}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>Estado:</span>
            </div>
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(exchangeRateData.status)}`}>
                {getStatusText(exchangeRateData.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Fuente */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Fuente:</span>
            <span className="font-medium text-gray-900">{exchangeRateData.source}</span>
          </div>
        </div>

        {/* Información de caché */}
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Los precios se actualizan automáticamente usando esta tasa de cambio del BCV.
                Los datos se almacenan en caché por 5 minutos para optimizar el rendimiento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangeRateCard;
